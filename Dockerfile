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


# ---- build ------------------------------------------------------------------

FROM node:22-alpine AS build

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1 \
    CI=true

# Dependencies first, so a source-only change reuses this layer.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

COPY . .

# NOTE: this step needs network access. next/font downloads Jost from Google at
# BUILD time so it can be self-hosted at RUNTIME — the built image makes no
# outbound requests, but the builder must be able to reach fonts.googleapis.com.
# An air-gapped build will fail here; vendor the font files if that is required.
RUN npm run build


# ---- runtime ----------------------------------------------------------------

FROM caddy:2-alpine AS runtime

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
