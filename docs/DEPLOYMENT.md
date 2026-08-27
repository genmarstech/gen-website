# Deployment

**Genmars Tech Limited** · genmars.co.ke

Runtime per **Charter 03 §I**: Docker Compose, Caddy, Hetzner. CI and registry:
GitHub Actions, GHCR.

> ⚠ **The site is not cleared to publish.** It ships with `robots.txt`
> disallowing everything and `noindex` on every page, because Charter 03 §IV
> Tier 1 requires a live privacy policy and terms of service and both are still
> drafts. Deploying now is fine — it puts a correctly-hidden site on the domain
> and proves the pipeline. Work [`PRE-LAUNCH.md`](PRE-LAUNCH.md) before lifting
> those flags.

---

## Shape of it

```
internet ──TLS──▶ Caddy (host, :443) ──plain HTTP──▶ container (127.0.0.1:3000)
                  deploy/host.Caddyfile              deploy/container.Caddyfile
```

Two decisions worth stating plainly, because both look odd until they are
explained.

### Why the container holds no Node

The site is a Next.js **static export**. `npm run build` emits plain HTML, CSS,
JS and self-hosted fonts into `out/`. The runtime image contains a web server
and a directory of files — no Node, no npm, no application code.

That is the security argument for this image: **a static site cannot have a
runtime dependency CVE, because it has no runtime dependencies.** There is
nothing to patch at 2am and nothing to restart under load.

### Why Caddy twice

Caddy is already the sanctioned runtime. Adding nginx inside the container would
mean two web servers to know, configure and patch, for no gain — Charter 01 §V:
*deep in a small number of tools beats shallow in many.*

The container's Caddy serves files over plain HTTP on `:3000` and terminates
nothing. The host's Caddy is the only process on a public interface: it obtains
the certificate, renews it, redirects HTTP to HTTPS, and proxies inward.

### Why `127.0.0.1:3000` and not `3000:3000`

This is the one line in `compose.yaml` you must not "tidy up".

`"3000:3000"` binds `0.0.0.0` — it publishes plain HTTP to the internet and
bypasses TLS entirely. Worse, **a UFW rule will not save you**: Docker writes its
own iptables rules ahead of UFW's chain, so a `deny 3000` is silently ignored.

The `127.0.0.1` prefix binds the loopback interface only. The container is
reachable by the host Caddy and by nothing else.

Confirm after any change:

```bash
ss -tlnp | grep 3000
```

It must read `127.0.0.1:3000`. If it reads `0.0.0.0:3000` or `*:3000`, stop and
fix it before anything else.

---

## Verify before you deploy

```bash
./scripts/smoke.sh
```

Builds the image, runs it on loopback, and asserts the things that are easy to
get subtly wrong in a static-file config:

- `/approach/` and `/approach` both resolve
- an unknown path returns a real **404**, not a 200 — a static host that answers
  200 for everything makes every typo look like a real page and poisons indexing
- CSP, nosniff, frame-options and referrer-policy are present
- hashed assets are `immutable`, documents are `must-revalidate`
- the container runs as uid 10001 with a read-only root filesystem

It also runs `caddy validate` on both Caddyfiles first, which is the cheapest
way to catch a config error before it reaches a reload.

---

## Local

```bash
docker compose up -d --build
```

Then <http://127.0.0.1:3000>.

```bash
docker compose logs -f web     # follow
docker compose ps              # health status
docker compose down            # stop
```

The build needs network access: `next/font` downloads Jost from Google at **build**
time so it can be self-hosted at **runtime**. The built image makes no outbound
requests at all — but an air-gapped builder will fail at that step. Vendor the
font files if that ever becomes a requirement.

---

## Host setup

### 1. Caddy

```bash
sudo cp deploy/host.Caddyfile /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

`caddy validate` before `reload`, always. A reload with a broken config takes the
site down; a failed validate costs nothing.

Set the `email` in the global block before first issuance — that address receives
expiry and problem notices from Let's Encrypt.

**Test with the ACME staging endpoint first.** The `acme_ca` line is in the file,
commented. Let's Encrypt rate-limits failed issuance hard, and a DNS typo on a
production endpoint can lock you out for a week.

### 2. DNS

`genmars.co.ke` and `www.genmars.co.ke` both need A (and AAAA if the host has
IPv6) records pointing at the server **before** Caddy starts, or certificate
issuance fails. www gets its own certificate; it exists only to redirect to the
apex so a single canonical hostname is indexed.

### 3. Firewall

Allow 80 and 443. Nothing else needs to be open — the container is on loopback.

```bash
sudo ufw allow 80,443/tcp
```

Port 80 must stay open even though everything redirects: Let's Encrypt's HTTP-01
challenge uses it, and closing it breaks renewal 60 days later, quietly.

### 4. HSTS

`host.Caddyfile` sets `max-age=31536000` and deliberately **omits**
`includeSubDomains` and `preload`.

Both are hard to reverse. `includeSubDomains` breaks any subdomain not yet on
HTTPS; `preload` is a manual, months-long removal process baked into browsers.
Add them once the certificate has renewed cleanly at least once and every
subdomain is known to be TLS-served.

---

## Deploying a new version

```bash
git pull
docker compose up -d --build
docker compose ps          # confirm healthy before walking away
```

Rollback — Charter 03 §II item 5 requires this to be written down:

```bash
docker compose down
docker run -d --name genmars-web -p 127.0.0.1:3000:3000 \
  ghcr.io/genmarstech/gen-website:<previous-sha>
```

Or pin `image:` in `compose.yaml` to the previous tag and `docker compose up -d`.
Tags are immutable per commit SHA, so a rollback is always to a known artefact
rather than to "whatever `latest` was yesterday".

---

## Troubleshooting

### `exec /usr/bin/caddy: operation not permitted`

The container restarts in a loop and the log shows only that line.

**Cause.** The official Caddy image runs
`setcap cap_net_bind_service=+ep /usr/bin/caddy` so it can bind :80 and :443 as
a non-root user. `cap_drop: ALL` empties the capability bounding set, and the
kernel refuses to `execve` any binary whose *permitted* file capabilities are
not a subset of that set. The exec fails before Caddy runs a single line — which
is why the log has no Caddy output at all, and why the message names the binary
rather than the capability.

**Fix.** The Dockerfile strips the capability (`setcap -r`), because this
container binds :3000 and has no use for it. Rebuild:

```bash
docker compose up -d --build --force-recreate
```

Confirm it is gone:

```bash
docker run --rm --entrypoint sh ghcr.io/genmarstech/gen-website:latest -c 'getcap /usr/bin/caddy'
```

Empty output is correct.

**Do not** "fix" this by adding `cap_add: NET_BIND_SERVICE` or by removing
`cap_drop: ALL`. Both work, and both grant the container a privilege it has no
use for in order to pass a check it should simply pass. If you swap the base
image, run `getcap` on the new binary before assuming anything.

---

## Content Security Policy — a known compromise

`container.Caddyfile` sets a CSP that locks down every source to `'self'`, with
one exception: **`script-src` includes `'unsafe-inline'`.**

This is unavoidable in the current architecture, and worth understanding rather
than assuming it is an oversight:

- A static export cannot mint per-request nonces. There is no server.
- The page carries two inline scripts by design — the no-flash theme script
  (which *must* run before first paint, or dark-mode visitors see a white flash)
  and the JSON-LD block — plus Next's hydration payload.

With no user-generated content, no comments, no search, no third-party scripts
and no external input reaching the DOM, the residual XSS surface is the build
pipeline itself rather than the page.

**Making it strict requires server rendering**, so nonces can be issued per
request. That is a real architecture change — dropping `output: "export"`,
running Node in production, and accepting the patching burden that avoids today.
Worth doing when the site takes user input. Not before.

Everything else is locked: `default-src 'self'`, `object-src 'none'`,
`frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`.

---

## What is not here yet

Tier 1 (Charter 03 §IV) is not satisfied by deployment alone:

- [ ] **Error monitoring that reaches a human.** A static site fails differently
      from an app, but "the site is down" still has to reach someone. An external
      uptime check against `https://genmars.co.ke/healthz` is the minimum.
- [ ] **Automated backup with a tested restore.** The site rebuilds from git, so
      the repository *is* the backup — which makes an untested restore of the
      repository the actual risk. Test it.
- [ ] **Log retention position.** `host.Caddyfile` keeps 30 days of access logs
      containing IP addresses. That is personal data under the Kenyan DPA, and
      the privacy policy has to say so accurately (Charter 03 §V).

That last one is easy to miss and directly contradicts a privacy policy that has
not been written yet. Settle the retention period before publishing Document A.
