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

# Unprivileged runtime user. Caddy binds :3000 here, which is above 1024, so it
# needs no capabilities at all — see cap_drop in compose.yaml.
RUN addgroup -g 10001 -S web && adduser -u 10001 -S web -G web

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
