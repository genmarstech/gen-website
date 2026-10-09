# syntax=docker/dockerfile:1.7

# ─────────────────────────────────────────────────────────────────────────────
# Genmars Tech — marketing site
#
# The site is a Next.js STATIC EXPORT: `npm run build` emits plain HTML, CSS, JS
# and self-hosted fonts into ./out. There is no Node process in production, so
# the runtime image contains no Node, no npm, and no application code — only a
# web server and a directory of files.
#
# That is the whole security argument for this image. A static site cannot have
# a dependency CVE at runtime, because it has no dependencies at runtime.
#
# The server is Caddy, which is already the sanctioned runtime in Charter 03 §I.
# Adding nginx here would mean two web servers to know, patch and configure for
# no gain — "deep in a small number of tools beats shallow in many."
# ─────────────────────────────────────────────────────────────────────────────


# ── WHERE THE BASE IMAGES ARE PULLED FROM, AND WHY IT IS ONE ARGUMENT ───────
#
# The default is Docker Hub, spelled in full. `node:22-alpine` and
# `docker.io/library/node:22-alpine` are the same image; writing it out is what
# lets the registry be substituted without the tag moving. compose.yaml and
# scripts/smoke.sh pass no build argument, so a local build is unchanged.
#
# ⚠ ONE ARGUMENT FOR ALL THREE STAGES, AND THAT IS LOAD-BEARING HERE.
#
#   caddy:2-builder-alpine exports $CADDY_VERSION, and the caddybuild stage
#   below clones exactly that tag so the source it compiles cannot drift from
#   the runtime base the binary is dropped into. Two registries resolving
#   caddy:2-* a moment apart is a way for them to drift. One ARG for every
#   FROM is what stops that being possible.
#
# ⚠ THE TAG IS NOT THE PART THAT MAY VARY. REGISTRY must never become a way to
#   move a version.
#
# build.yml overrides it to mirror.gcr.io, a read-through cache of Docker Hub,
# because Docker Hub counts unauthenticated pulls PER IP and GitHub's hosted
# runners share an IP with everybody else building on them. business-os lost
# two consecutive runs to `429 Too Many Requests` on a green branch; here the
# same limit would stop a DEPLOY, because deploy.yml fires on this workflow
# and pulls the image this job publishes.
#
# ── WHAT THAT MEANS HERE AND DOES NOT MEAN IN business-os ───────────────────
#
# business-os builds images in CI only to prove the Dockerfile still works,
# and its host builds its own, so its mirror touches nothing that ships. This
# repository is the one that deploys what CI built. So the mirror IS in the
# production supply chain, and that is a decision rather than an oversight:
#
# - A registry is content-addressed, and all three tags were checked to
#   resolve to the same manifest digest on both — node:22-alpine,
#   caddy:2-alpine and caddy:2-builder-alpine.
#
# - The risk worth naming is therefore STALENESS, not substitution. `pull:
#   true` and `no-cache-filters: runtime` in build.yml exist precisely so the
#   base image is current on every run, and a cache that lagged would quietly
#   undo them. It would not ship: the Trivy step blocks the push on any
#   fixed-available CVE, which is how the 2026-09-05 stale-layer failure was
#   caught. Staleness here is loud.
#
# - The stronger answer is a Docker Hub account and two repository secrets —
#   a per-account limit instead of a per-IP one, which is what the Trivy step
#   already does with ghcr.io and the job's own token. Reach for it the day
#   this mirror lags rather than adding a scan exception.

ARG REGISTRY=docker.io/library

# ---- build ------------------------------------------------------------------

FROM ${REGISTRY}/node:22-alpine AS build

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1 \
    CI=true

# Dependencies first, so a source-only change reuses this layer.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

COPY . .

# ─────────────────────────────────────────────────────────────────────────────
# CONTENT_REV EXISTS TO DEFEAT THE LAYER CACHE, AND IT IS NOT OPTIONAL.
#
# `next build` is not a pure function of this source tree. It FETCHES /docs and
# /work from the API and bakes the result into the HTML. So two builds of the
# same commit legitimately differ, and Docker — which keys a layer on the
# instructions and files above it — cannot tell.
#
# Without this, publishing a document or a piece of work in operations and
# redeploying ships the CACHED build: the pipeline reports success, the image
# digest is new, and the site serves exactly what it served before. That
# happened on 2026-09-23 with /work, and it had been latent for /docs the whole
# time — the failure is silent in both directions, which is what makes it bad.
#
# Pass a value that changes per build (CI passes the run id). npm ci above stays
# cached, which is the layer actually worth caching; this only re-runs the build
# itself.
# ─────────────────────────────────────────────────────────────────────────────
ARG CONTENT_REV=local
RUN echo "content revision: ${CONTENT_REV}" > /app/.content-rev

# NOTE: this step needs network access. next/font downloads Jost from Google at
# BUILD time so it can be self-hosted at RUNTIME — the built image makes no
# outbound requests, but the builder must be able to reach fonts.googleapis.com.
# An air-gapped build will fail here; vendor the font files if that is required.
RUN npm run build


# ---- caddy ------------------------------------------------------------------
#
# WHY THIS STAGE EXISTS: THE PUBLISHED CADDY BINARY IS BUILT ONCE PER RELEASE.
#
# caddy:2-alpine ships the binary compiled at the v2.11.4 release in June 2026,
# on Go 1.26.3, against the module versions in Caddy's go.mod at that moment.
# Rebuilding the IMAGE does not rebuild the BINARY — the 2026-09-23 rebuild of
# caddy:2-alpine still carried Go 1.26.3, x/crypto v0.52.0 and grpc v1.81.0.
#
# That is why `apk upgrade` below could never clear these findings: Caddy is
# not an apk package. Sixteen CVEs accumulated in .trivyignore.yaml as a
# result, every one of them argued as unreachable and none of them actionable
# from this repository — the exact state that file warns turns a red pipeline
# into one people click past.
#
# Nine of the sixteen are Go STANDARD LIBRARY findings (net/url, mime, os.Root,
# crypto/x509, crypto/tls, net/http, html/template, encoding/asn1,
# encoding/xml), fixed in Go 1.26.4+. The builder image carries Go 1.26.8, so
# compiling here fixes all nine for free. The remaining four are module
# versions, pinned below.
#
# The cost is that this stage compiles Caddy on every build — about a minute,
# cached between builds that do not change this stage. That is the price of
# not shipping a binary we cannot patch.

FROM ${REGISTRY}/caddy:2-builder-alpine AS caddybuild

# WHY NOT `xcaddy build --with`, WHICH IS WHAT THE BUILDER IMAGE IS FOR.
#
# `--with` adds a Caddy PLUGIN: xcaddy writes `import _ "<module>"` into a
# generated main.go. That works for a plugin, whose module root is an
# importable package, and fails for a dependency whose root is not:
#
#     go: caddy imports
#         golang.org/x/crypto: cannot find module providing package
#
# Upgrading a transitive dependency is a go.mod edit, not an import. So this
# builds Caddy's own cmd/caddy from source with the four modules raised first.
# The image is still the Caddy builder rather than plain golang:alpine, for two
# reasons: it carries Go 1.26.8, the toolchain the stdlib fixes need, and it
# exports $CADDY_VERSION, so the source we compile cannot drift from the base
# image the binary is dropped into.

WORKDIR /src

RUN git clone --depth 1 --branch "$CADDY_VERSION" \
      https://github.com/caddyserver/caddy.git .

# Each line raises a transitive dependency past a published fix. Checked
# against proxy.golang.org on 2026-10-01; all four are above the version named
# in the CVE.
#
#   x/crypto  CVE-2026-56854            fixed 0.55.0
#   x/net     CVE-2026-46600, -39821
#   x/text    CVE-2026-56852
#   grpc      CVE-2026-84445            fixed 1.82.2
#             CVE-2026-84304            fixed 1.83.1
#             GHSA-hrxh-6v49-42gf
#
# `go mod tidy` after the upgrades, so an indirect requirement these pull in
# is recorded rather than failing the build at link time.
RUN go get \
      golang.org/x/crypto@v0.57.0 \
      golang.org/x/net@v0.59.0 \
      golang.org/x/text@v0.42.0 \
      google.golang.org/grpc@v1.84.0 \
 && go mod tidy

# CGO off so the binary is static and runs on the Alpine runtime image without
# a libc dependency, which is how the published one is built too.
RUN CGO_ENABLED=0 go build -trimpath -o /usr/bin/caddy ./cmd/caddy


# ---- runtime ----------------------------------------------------------------

FROM ${REGISTRY}/caddy:2-alpine AS runtime

LABEL org.opencontainers.image.title="gen-website" \
      org.opencontainers.image.description="Marketing website for Genmars Tech Limited" \
      org.opencontainers.image.vendor="Genmars Tech Limited" \
      org.opencontainers.image.licenses="GPL-3.0-or-later" \
      org.opencontainers.image.source="https://github.com/genmarstech/gen-website"

# Patch the base image's OS packages.
#
# The upstream caddy:2-alpine image is rebuilt on its own schedule, so between
# rebuilds it ships Alpine packages with published, ALREADY-FIXED CVEs. The
# first CI scan of this image found seven HIGH findings that way — c-ares, curl,
# libcurl, libcrypto3, libssl3 — every one of them with a fixed version sitting
# in the Alpine repository, waiting.
#
# This is the whole security story for this image: it holds a web server and a
# directory of files, so patching the OS packages IS the patching. There is
# nothing else in here to fix.
#
# The trade is reproducibility — this line takes whatever is current in the
# Alpine 3.23 repo at build time, so two builds of the same commit can differ.
# Shipping a known-fixed CVE to avoid that is the wrong way round: the image is
# rebuilt from the same source on every deploy anyway, and the SHA-tagged
# artefact in GHCR is what rollback pins to, not this layer.
RUN apk upgrade --no-cache

# The binary from the stage above replaces the released one. This sits BEFORE
# the capability strip on purpose: that step verifies what it stripped, and
# verifying the binary we are about to overwrite would prove nothing.
COPY --from=caddybuild /usr/bin/caddy /usr/bin/caddy

# Unprivileged runtime user. Caddy binds :3000 here, which is above 1024, so it
# needs no capabilities at all — see cap_drop in compose.yaml.
RUN addgroup -g 10001 -S web && adduser -u 10001 -S web -G web

# Strip the binary's file capability.
#
# The official Caddy image runs `setcap cap_net_bind_service=+ep /usr/bin/caddy`
# so it can bind :80 and :443 as a non-root user. We bind :3000, so that
# capability is dead weight — and worse, it makes the container refuse to start
# under `cap_drop: ALL`:
#
#     exec /usr/bin/caddy: operation not permitted
#
# The kernel rejects execve of any binary whose *permitted* file capabilities
# are not a subset of the process capability bounding set. cap_drop: ALL empties
# that set, so the exec fails before Caddy runs a single line. The error names
# the binary, not the capability, which makes it look like a corrupt image.
#
# Stripping the capability is the correct fix. The alternative — adding
# `cap_add: NET_BIND_SERVICE` back in compose — would grant a privilege this
# container has no use for, purely to satisfy a check it should simply pass.
RUN set -eux; \
    apk add --no-cache --virtual .setcap libcap; \
    # `-r` exits non-zero when there is nothing to remove, which is a fine
    # outcome — a future base image may ship without the capability.
    setcap -r /usr/bin/caddy 2>/dev/null || true; \
    # Verify rather than assume. If the strip silently failed, the container
    # would die at runtime with an error that names the binary and not the
    # cause; far better to fail here, in the build, where it is obvious.
    if [ -n "$(getcap /usr/bin/caddy)" ]; then \
        echo "FATAL: file capability still set on /usr/bin/caddy"; \
        getcap /usr/bin/caddy; \
        exit 1; \
    fi; \
    apk del .setcap

# Caddy writes its data and config caches under XDG paths. Pointing them at /tmp
# lets the whole root filesystem be mounted read-only, with /tmp as a small
# tmpfs. Nothing here needs to survive a restart: TLS is terminated upstream, so
# this Caddy stores no certificates.
ENV XDG_DATA_HOME=/tmp/caddy \
    XDG_CONFIG_HOME=/tmp/caddy

COPY deploy/container.Caddyfile /etc/caddy/Caddyfile
COPY --from=build --chown=10001:10001 /app/out /srv

USER 10001:10001

EXPOSE 3000

# Hits the dedicated /healthz endpoint rather than the homepage, so a healthcheck
# never pulls the full document every 30 seconds. busybox wget ships in alpine.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:3000/healthz || exit 1

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
