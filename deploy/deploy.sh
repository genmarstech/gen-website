#!/usr/bin/env bash
#
# Deploy one specific commit of gen-website to this host.
#
#   ./deploy/deploy.sh <commit-sha>
#
# Driven by the GitHub Actions `deploy` workflow over SSH, and run by hand for a
# rollback:
#
#   cd /opt/gen-website && ./deploy/deploy.sh <any-previous-sha>
#
# Images are tagged with the full commit SHA and are immutable, so a deploy and
# a rollback are both to a known artefact rather than to "whatever :latest was
# yesterday". Charter 03 §II item 5 requires the rollback to be written down —
# this script is that rollback.
#
# What it does, in order:
#
#   1. refuses to run against a dirty working tree. A host repo with local edits
#      silently diverges from the commit CI tested, and the first symptom is a
#      compose.yaml that does not match the image it is starting
#   2. records the currently deployed commit as the rollback target
#   3. checks out the requested commit, because compose.yaml lives on the HOST
#      and must match the image
#   4. pulls the SHA-pinned image from GHCR
#   5. restarts the container and waits for it to report healthy
#   6. rolls back to step 2's commit if health never arrives
#
# It never builds. The image is built once, in CI, and the artefact that was
# smoke-tested is the artefact that runs — rebuilding here would put something
# no pipeline ever saw in front of the public.
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

REGISTRY="ghcr.io/genmarstech/gen-website"
SERVICE="web"
CONTAINER="genmars-web"
LOCAL_HEALTH="http://127.0.0.1:3000/healthz"

# Checked end-to-end through the host Caddy, but only as a warning — see below.
PUBLIC_HEALTH="${PUBLIC_HEALTH:-https://genmars.co.ke/healthz}"

# How long to wait for the container healthcheck. compose.yaml uses
# interval=30s / retries=3 / start_period=5s, so a genuinely broken container
# needs roughly 95s to be marked unhealthy. 120 leaves room for that without
# hanging a pipeline for minutes.
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-120}"

log()  { printf '\n==> %s\n' "$*"; }
info() { printf '    %s\n' "$*"; }
die()  { printf '\nFATAL: %s\n' "$*" >&2; exit 1; }

# ---- arguments --------------------------------------------------------------

TARGET="${1:-}"
[[ -n "$TARGET" ]] || die "usage: $0 <commit-sha>"

cd "$(dirname "$0")/.."
ROOT="$PWD"
info "project: $ROOT"

command -v docker >/dev/null || die "docker is not installed"
docker compose version >/dev/null 2>&1 || die "docker compose v2 is required"

# ---- helpers ----------------------------------------------------------------
#
# Defined before the first change to the host, so every failure path below can
# reach them.

# compose.yaml reads ${IMAGE_TAG}. Writing it to .env rather than exporting it
# for a single command means every later `docker compose ps|logs|down` on this
# host resolves the same image — and the file doubles as a record of what is
# deployed. .env is gitignored and excluded from the build context.
write_env() {
  {
    printf '# Written by deploy/deploy.sh — do not edit by hand.\n'
    printf '# Deployed %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    printf 'IMAGE_TAG=%s\n' "$1"
  } > "$ROOT/.env"
}

wait_for_health() {
  local timeout="$1" waited=0 state
  printf '    waiting for health'
  while (( waited < timeout )); do
    state="$(docker inspect -f '{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null || echo missing)"
    case "$state" in
      healthy)   printf ' healthy (%ss)\n' "$waited"; return 0 ;;
      unhealthy) printf ' UNHEALTHY (%ss)\n' "$waited"; return 1 ;;
    esac
    printf '.'
    sleep 2
    waited=$((waited + 2))
  done
  printf ' timed out after %ss\n' "$timeout"
  return 1
}

# Best-effort by design. If the rollback itself fails there is nothing further
# this script can usefully do, and swallowing the error would hide the one thing
# the operator most needs to see.
rollback() {
  log "ROLLING BACK to $PREVIOUS"
  if ! git checkout --quiet --detach "$PREVIOUS"; then
    printf 'rollback checkout FAILED — host is on %s with a broken deploy\n' \
      "$TARGET_SHA" >&2
    return 1
  fi
  write_env "$PREVIOUS"
  docker compose pull --quiet "$SERVICE" || true
  docker compose up -d --no-build "$SERVICE" || true
  if wait_for_health 60; then
    info "rollback healthy — the site is serving $PREVIOUS"
  else
    printf 'rollback did NOT come back healthy. On the host:\n' >&2
    printf '  docker compose ps && docker compose logs --tail=50 %s\n' "$SERVICE" >&2
  fi
}

# ---- 1. the working tree must be clean --------------------------------------

if [[ -n "$(git status --porcelain)" ]]; then
  git status --short
  die "working tree is dirty — commit, stash or discard before deploying"
fi

# ---- 2. record the rollback target ------------------------------------------

PREVIOUS="$(git rev-parse HEAD)"
info "currently deployed: $PREVIOUS"

log "fetching"
git fetch --quiet origin --tags

# Resolved early so a typo'd SHA fails before anything on the host is touched.
TARGET_SHA="$(git rev-parse --verify "${TARGET}^{commit}" 2>/dev/null)" \
  || die "unknown commit: $TARGET"

IMAGE="${REGISTRY}:${TARGET_SHA}"
info "deploying:          $TARGET_SHA"

# ---- 3. move the host to the target commit ----------------------------------

log "checking out $TARGET_SHA"
git checkout --quiet --detach "$TARGET_SHA"
write_env "$TARGET_SHA"

# ---- 4. pull the pinned image -----------------------------------------------
#
# Pull BEFORE stopping anything. A registry outage or a missing tag should leave
# the current version running, not a stopped container and no replacement.

log "pulling $IMAGE"
if ! docker compose pull "$SERVICE"; then
  git checkout --quiet --detach "$PREVIOUS"
  write_env "$PREVIOUS"
  die "could not pull $IMAGE — nothing changed, the site is still up"
fi

# ---- 5. restart and verify --------------------------------------------------

log "starting"
if ! docker compose up -d --no-build "$SERVICE"; then
  rollback
  die "container failed to start"
fi

if ! wait_for_health "$HEALTH_TIMEOUT"; then
  log "never became healthy — last 50 log lines"
  docker compose logs --tail=50 "$SERVICE" || true
  rollback
  die "deploy failed health check"
fi

log "verifying"

# The container's own healthcheck runs inside the container. This asserts the
# port is actually published on the host, which is a different failure.
curl -fsS --max-time 5 "$LOCAL_HEALTH" >/dev/null \
  || { rollback; die "container is healthy but $LOCAL_HEALTH does not answer"; }
info "PASS  $LOCAL_HEALTH"

# Loopback only. "3000:3000" binds 0.0.0.0 and publishes plain HTTP straight to
# the internet, bypassing TLS — and a UFW deny will NOT stop it, because Docker
# writes its iptables rules ahead of UFW's chain. Cheap to assert on every
# deploy, catastrophic to get wrong once.
if command -v ss >/dev/null 2>&1; then
  # Match on the Local Address column only, and accept both loopback forms. A
  # plain `grep -v 127.0.0.1` would call a legitimate [::1]:3000 an exposure.
  EXPOSED="$(ss -tln 2>/dev/null | awk '
    $4 ~ /:3000$/ && $4 !~ /^127\.0\.0\.1:/ && $4 !~ /^\[::1\]:/ { print $4 }')"
  if [[ -n "$EXPOSED" ]]; then
    printf 'port 3000 is listening on: %s\n' "$EXPOSED" >&2
    rollback
    die "port 3000 is not bound to loopback — plain HTTP is exposed to the internet"
  fi
  info "PASS  port 3000 bound to loopback only"
fi

# End to end through the host Caddy: TLS, the proxy hop, the certificate.
#
# A failure here is a host-Caddy or DNS problem, not a bad image, so it warns
# rather than rolling back a container that is demonstrably serving. Rolling the
# app back would not fix a certificate — it would just cost you the new version
# as well.
if curl -fsS --max-time 10 "$PUBLIC_HEALTH" >/dev/null 2>&1; then
  info "PASS  $PUBLIC_HEALTH"
else
  info "WARN  $PUBLIC_HEALTH did not answer — suspect the host Caddy, not the image"
  info "      systemctl is-active caddy"
  info "      sudo caddy validate --config /etc/caddy/Caddyfile"
fi

# ---- 6. tidy ----------------------------------------------------------------
#
# Dangling images only. `docker image prune -a` would delete the previous SHA
# tag, which is the rollback target — a cleanup step that removes the thing you
# roll back to is worse than no cleanup at all.
docker image prune -f >/dev/null 2>&1 || true

log "deployed $TARGET_SHA"
