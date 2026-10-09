#!/usr/bin/env bash
#
# "This installation is alive, and here is what it thinks of itself."
#
# Posts one heartbeat to the Genmars system registry. Run from
# deploy/genmars-web-heartbeat.timer every five minutes.
#
# ── WHY A SHELL SCRIPT, WHEN THERE IS NO APPLICATION TO PUT IT IN ───────────
#
# business-os reports through a Django management command, because it has a
# Django. This site has nothing at all: next.config.ts sets `output: "export"`,
# so what is deployed is a directory of files and a Caddy serving them. There
# is no process of ours running, no request handler, nowhere a scheduled job
# could live.
#
# That makes a shell script not the pragmatic choice but the only honest one.
#
# ── WHAT A STATIC SITE CAN TRUTHFULLY REPORT ────────────────────────────────
#
# `check_systems` on the parent already GETs https://genmars.co.ke/ from
# outside, and for a static site that answers most of the question: if the
# files are served, the site works. A script here that curled the same URL
# would be a worse copy of a check that already exists.
#
# ⚠ SO THIS REPORTS THE TWO THINGS THE GET CANNOT SEE.
#
#   WHICH BUILD IS LIVE. The deploy pins the image to the commit it was built
#   from — gen-website:b8de98f1d278… — so this is the one place the registry
#   can learn which revision is actually serving genmars.co.ke. The `version`
#   column has been blank for this system since it was registered, and no
#   amount of polling the homepage would ever fill it.
#
#   THAT THE CONTAINER IS GONE. A health poll that times out cannot distinguish
#   a stopped container from a DNS problem, an expired certificate or a dead
#   host. This runs beside the container, so it can say which — and say it in
#   the one case the public probe is least able to explain.
#
# ── IT NEEDS GENMARS_SYSTEM_KEY ─────────────────────────────────────────────
#
# Issued at ops.genmars.co.ke/systems → Marketing site → "Reporting keys". Founder
# only, shown exactly once, Argon2-hashed on the way in and not readable back.
# Put it in /opt/gen-website/.env at mode 600 — it is a bearer credential for
# this system's row.
#
# ⚠ ISSUE IT BEFORE INSTALLING THE TIMER. Without the key this exits non-zero,
#   the unit's OnFailure mails through genmars-alert@, and it does so every
#   five minutes. GM-INC-2026-0001 is what that costs: alerts bounced, the
#   provider suppressed the address, and thirty-one hours of real alerts were
#   dropped in silence.

set -uo pipefail

# ── --dry-run: work out the report and print it, sending nothing ────────────
#
# For setting this up, and for the one question an operator actually has when
# the board looks wrong: "what would this say right now?". It needs no key and
# touches the network not at all, so it is safe to run on a host that is not
# registered yet. business-os's report_health carries the same flag for the
# same reason.
DRY_RUN=0
if [ "${1:-}" = "--dry-run" ]; then
    DRY_RUN=1
fi

CONTAINER="${CONTAINER:-genmars-web}"
ENV_FILE="${ENV_FILE:-/opt/gen-website/.env}"
PARENT="${GENMARS_API_ORIGIN:-https://api.genmars.co.ke}"
TIMEOUT="${TIMEOUT:-10}"

# ── the key, read without ever printing it ──────────────────────────────────
#
# Sourced rather than grepped so an operator can keep it beside anything else
# the deployment needs. `set -a` exports what the file defines; the subshell
# keeps the rest of this script's environment clean.
if [ -f "$ENV_FILE" ]; then
    set -a
    # shellcheck disable=SC1090
    . "$ENV_FILE"
    set +a
fi

KEY="${GENMARS_SYSTEM_KEY:-}"
if [ -z "$KEY" ] && [ "$DRY_RUN" -eq 0 ]; then
    echo "GENMARS_SYSTEM_KEY is not set in ${ENV_FILE}." >&2
    echo "Issue one at ops.genmars.co.ke/systems → Marketing site → Reporting keys." >&2
    exit 1
fi

# ── what this installation thinks of itself ─────────────────────────────────

# ⚠ EVERYTHING THAT REACHES THE PAYLOAD GOES THROUGH HERE FIRST.
#
# The body is built with printf rather than a JSON library, so a newline, a
# quote or a backslash in any of these values produces malformed JSON and the
# parent rejects the report.
#
# That is not hypothetical and it bit the one case this script exists for:
# `docker inspect` on a container that does not exist prints an empty line to
# stdout before failing, so the fallback produced "\nmissing" and the DOWN
# report — the report a health poll cannot give you — was the only one that
# could never be delivered. Found by running it against a made-up container
# name.
clean() {
    # Collapse all whitespace to single spaces, drop the characters that would
    # break the string, and bound the length to the column the parent stores.
    printf '%s' "$1" | tr -d '\\"' | tr '\n\r\t' '   ' | tr -s ' ' | cut -c1-200
}

running="$(clean "$(docker inspect --format '{{.State.Running}}' "$CONTAINER" 2>/dev/null || echo missing)")"

if [ "$running" != "true" ]; then
    HEALTH="down"
    DETAIL="container ${CONTAINER} is not running (${running})"
    VERSION="unknown"
else
    # `none` when the image defines no HEALTHCHECK, which is not the same as
    # unhealthy — reporting it as degraded would invent a fault.
    state="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$CONTAINER" 2>/dev/null || echo "none")"

    case "$state" in
        healthy|none) HEALTH="up";      DETAIL="container healthy" ;;
        starting)     HEALTH="degraded"; DETAIL="container still starting" ;;
        unhealthy)    HEALTH="degraded"; DETAIL="docker healthcheck failing" ;;
        *)            HEALTH="degraded"; DETAIL="unrecognised health: ${state}" ;;
    esac

    # ── WHICH BUILD IS SERVING ──────────────────────────────────────────────
    #
    # deploy/deploy.sh pins the image to the commit it was built from, so the
    # tag IS the revision and this is the whole point of the heartbeat for a
    # static site.
    #
    # The `latest` branch below is a fallback for a deployment that has drifted
    # onto a floating tag — which names no particular build, and would leave
    # the board recording "latest" for ever while deploys came and went
    # invisibly. internals-tm runs exactly that way, so it is not hypothetical.
    image="$(clean "$(docker inspect --format '{{.Config.Image}}' "$CONTAINER" 2>/dev/null || echo "")")"
    tag="${image##*:}"
    if [ -z "$tag" ] || [ "$tag" = "$image" ] || [ "$tag" = "latest" ]; then
        digest="$(docker inspect --format '{{.Image}}' "$CONTAINER" 2>/dev/null || echo "")"
        digest="${digest#sha256:}"
        VERSION="latest@${digest:0:12}"
    else
        VERSION="$tag"
    fi
fi

# ── report ──────────────────────────────────────────────────────────────────
#
# The key goes in a header rather than the body, and the body carries no
# identifiers of any kind: a SystemEvent is Genmars' operational record, not a
# place for a client's name or a figure from somebody's account.
payload=$(printf '{"version":"%s","health":"%s","detail":"%s"}' \
    "$(clean "$VERSION")" "$HEALTH" "$(clean "$DETAIL")")

if [ "$DRY_RUN" -eq 1 ]; then
    echo "would report — ${HEALTH}: ${DETAIL} (${VERSION})"
    # The body exactly as it would be sent, so it can be piped through a JSON
    # parser. It is built with printf rather than a library, so "is this valid
    # JSON" is a real question — and the answer was NO for the down report
    # until the `clean` helper above existed.
    echo "$payload"
    exit 0
fi

# --fail-with-body so a 4xx is a failure here AND its reason is printed. A
# plain --fail prints nothing, which turns "your key was revoked" into an
# unexplained non-zero exit at five-minute intervals.
response="$(curl -sS --fail-with-body -m "$TIMEOUT" \
    -X POST "${PARENT}/api/systems/heartbeat" \
    -H "Authorization: Bearer ${KEY}" \
    -H "Content-Type: application/json" \
    -H "User-Agent: genmars-gen-website-heartbeat" \
    -d "$payload" 2>&1)"
status=$?

if [ "$status" -ne 0 ]; then
    # ⚠ The response and the status, never the payload and never the key. The
    #   key is in a header curl would echo back under -v, which is why -v is
    #   not used here.
    echo "heartbeat refused or unreachable (curl ${status}): ${response}" >&2
    exit 1
fi

echo "reported — ${HEALTH}: ${DETAIL} (${VERSION})"
