#!/usr/bin/env bash
#
# Smoke test the container.
#
# Builds the image, runs it on 127.0.0.1:3000, and asserts the things that are
# easy to get subtly wrong in a static-file Caddy config — trailing slashes,
# 404 status codes, cache headers, and the healthcheck endpoint.
#
# Run before the first deploy, and after any change to deploy/container.Caddyfile:
#   ./scripts/smoke.sh
#
# CI runs this same script against the image it has already built, so local and
# pipeline checks can never drift apart:
#   IMAGE=gen-website:ci SMOKE_SKIP_BUILD=1 ./scripts/smoke.sh
#
# Requires a running Docker daemon.

set -euo pipefail

# CI sets both of these so the image that gets smoke-tested is byte-for-byte the
# one that gets pushed. A second `docker build` would test a different artefact.
IMAGE="${IMAGE:-gen-website:smoke}"
NAME="gen-website-smoke"
BASE="http://127.0.0.1:3000"

pass=0
fail=0

cleanup() {
  docker rm -f "$NAME" >/dev/null 2>&1 || true
}
trap cleanup EXIT

check() {
  local label="$1" expected="$2" actual="$3"
  if [[ "$actual" == "$expected" ]]; then
    printf '  PASS  %-46s %s\n' "$label" "$actual"
    pass=$((pass + 1))
  else
    printf '  FAIL  %-46s got %s, want %s\n' "$label" "$actual" "$expected"
    fail=$((fail + 1))
  fi
}

contains() {
  local label="$1" needle="$2" haystack="$3"
  if grep -qi -- "$needle" <<<"$haystack"; then
    printf '  PASS  %s\n' "$label"
    pass=$((pass + 1))
  else
    printf '  FAIL  %s (missing: %s)\n' "$label" "$needle"
    fail=$((fail + 1))
  fi
}

status() { curl -s -o /dev/null -w '%{http_code}' "$1"; }

echo "==> validating Caddyfiles"
docker run --rm -v "$PWD/deploy:/deploy:ro" caddy:2-alpine \
  caddy validate --adapter caddyfile --config /deploy/container.Caddyfile
echo "  container.Caddyfile OK"

# genmars.caddy is a conf.d DROP-IN, imported by the host Caddyfile. Validating
# it standalone works because it holds only site blocks; the authoritative check
# is on the host: sudo caddy validate --config /etc/caddy/Caddyfile
docker run --rm -v "$PWD/deploy:/deploy:ro" caddy:2-alpine \
  caddy validate --adapter caddyfile --config /deploy/genmars.caddy
echo "  genmars.caddy OK"

echo
if [[ "${SMOKE_SKIP_BUILD:-0}" == "1" ]]; then
  echo "==> using prebuilt image $IMAGE"
else
  echo "==> building image"
  docker build -t "$IMAGE" .
fi

echo
echo "==> starting container"
cleanup

# Run under the SAME security posture as compose.yaml, not a bare `docker run`.
#
# This matters more than it looks. The capability bug — the container refusing to
# exec caddy under an empty bounding set — only reproduces with `--cap-drop ALL`.
# A smoke test that starts the image with default privileges proves the image
# works in conditions production never uses, and passes right up until deploy.
#
# Keep these flags in step with compose.yaml.
docker run -d --name "$NAME" \
  -p 127.0.0.1:3000:3000 \
  --read-only \
  --tmpfs /tmp:size=16m,mode=1777,noexec,nosuid,nodev \
  --security-opt no-new-privileges:true \
  --cap-drop ALL \
  --user 10001:10001 \
  "$IMAGE" >/dev/null

printf '  waiting for health'
for _ in $(seq 1 30); do
  if curl -fsS "$BASE/healthz" >/dev/null 2>&1; then break; fi
  printf '.'
  sleep 1
done
echo

echo
echo "==> routing"
check "healthz"                      "200" "$(status "$BASE/healthz")"
check "homepage"                     "200" "$(status "$BASE/")"
check "trailing-slash route"         "200" "$(status "$BASE/approach/")"
check "bare route redirects"         "200" "$(curl -s -L -o /dev/null -w '%{http_code}' "$BASE/approach")"
check "nested asset"                 "200" "$(status "$BASE/genmars-mark.svg")"
check "robots.txt"                   "200" "$(status "$BASE/robots.txt")"
# A static host that answers 200 for everything is the classic SPA misconfig —
# it makes every typo look like a real page and poisons search indexing.
check "unknown path is a real 404"   "404" "$(status "$BASE/definitely-not-a-page")"

echo
echo "==> headers"
HEAD="$(curl -fsSI "$BASE/")"
contains "Content-Security-Policy set"        "content-security-policy" "$HEAD"
contains "X-Content-Type-Options: nosniff"    "nosniff"                 "$HEAD"
contains "X-Frame-Options: DENY"              "x-frame-options"         "$HEAD"
contains "Referrer-Policy set"                "referrer-policy"         "$HEAD"
contains "document revalidates"               "must-revalidate"         "$HEAD"

ASSET="$(curl -fsS "$BASE/" | grep -o '/_next/static/css/[^"]*\.css' | head -1)"
if [[ -n "$ASSET" ]]; then
  AHEAD="$(curl -fsSI "$BASE$ASSET")"
  contains "hashed asset is immutable"        "immutable"               "$AHEAD"
else
  echo "  SKIP  hashed asset check (no css link found)"
fi

echo
echo "==> container posture"
check "runs as uid 10001"            "10001" "$(docker exec "$NAME" id -u)"
check "root filesystem is read-only" "true"  "$(docker inspect -f '{{.HostConfig.ReadonlyRootfs}}' "$NAME")"
# Assert CapDrop rather than CapAdd. An empty CapAdd is the default and proves
# nothing; "ALL" in CapDrop is the thing that actually empties the bounding set
# and is what the caddy binary must be able to exec under.
#
# Note the quoting: inside single quotes the Go template needs bare " marks.
# Escaping them as \" makes the template parser fail, the command return empty,
# and an equality check against "" pass for the wrong reason — which is exactly
# what this line used to do.
check "all capabilities dropped"     "ALL"   "$(docker inspect -f '{{join .HostConfig.CapDrop ","}}' "$NAME")"
check "serves under the hardened posture" "200" "$(status "$BASE/")"

# The official caddy image sets cap_net_bind_service on the binary. Under
# `cap_drop: ALL` the kernel then refuses to exec it at all — the container dies
# with "exec /usr/bin/caddy: operation not permitted" before Caddy starts.
# The Dockerfile strips it; this asserts the strip actually happened.
CAPS="$(docker run --rm --entrypoint sh "$IMAGE" -c \
  'command -v getcap >/dev/null 2>&1 && getcap /usr/bin/caddy || echo ""' 2>/dev/null || echo "")"
check "no file caps on the caddy binary" "" "$(printf '%s' "$CAPS" | tr -d '[:space:]')"

echo
if [[ "$fail" -gt 0 ]]; then
  echo "FAILED: $fail check(s), $pass passed"
  exit 1
fi
echo "All $pass checks passed."
