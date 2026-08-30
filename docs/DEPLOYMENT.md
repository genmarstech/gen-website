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
                  conf.d/genmars.caddy               deploy/container.Caddyfile
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

### 1. Caddy — a SHARED host

**This box also serves `clipsserenityspa.co.ke`.** Its config lives in
`/etc/caddy/conf.d/`, and `/etc/caddy/Caddyfile` does nothing but:

```
import /etc/caddy/conf.d/*.caddy
```

**Never `cp` anything over `/etc/caddy/Caddyfile`.** That would delete the
import line and take a client site down. Install as a drop-in instead:

```bash
sudo cp deploy/genmars.caddy /etc/caddy/conf.d/genmars.caddy
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

`caddy validate` before `reload`, always — a reload with a broken config takes
down every site on the host, not just this one. Back up first:

```bash
sudo tar czf /root/caddy-backup-$(date +%F-%H%M).tar.gz -C /etc caddy
```

#### Validate passes, reload fails

`validate` checks that the config *adapts*. Some failures only appear when the
config is *loaded*. The one that bit us:

```
open /var/log/caddy/genmars.log: permission denied
```

A `log { output file ... }` block fails at load even after
`chown caddy:caddy /var/log/caddy`. `genmars.caddy` therefore has no log block —
access logs go to the journal, like every other site here. Journald also keeps
retention in one place, which the privacy policy depends on being true.

After any reload failure, confirm the client site first:

```bash
systemctl is-active caddy && curl -sI --max-time 5 https://clipsserenityspa.co.ke | head -2
```

A failed `reload` leaves the previous config running, so Clips stays up — but
verify rather than assume.

#### Staging, for a new domain

Let's Encrypt rate-limits failed issuance hard. Test against staging when DNS or
the proxy path is unproven — the block and the two things to get right are
documented at the bottom of `deploy/genmars.caddy`.

The short version: the ACME email is an **argument** to `tls`, not a
subdirective (`tls { email ... }` is rejected), and it must be scoped **per
site** — putting `acme_ca` in the global block would switch Clips to staging too
and warn every visitor to a live client site.

### 2. DNS — and a Cloudflare caveat

`genmars.co.ke` and `www.genmars.co.ke` both need A records pointing at the
server **before** Caddy starts, or issuance fails.

Cloudflare is the nameserver for these domains, and the records must stay
**DNS-only (grey cloud)**. Both currently resolve to the server's own IPv4, which
is what makes Let's Encrypt HTTP-01 work and Caddy's certificate the one visitors
actually see.

If a record is switched to **proxied (orange cloud)** — as
`clipsserenityspa.co.ke` is — Cloudflare terminates TLS at its edge instead, and
this setup breaks: visitors see Cloudflare's certificate, Caddy's only covers the
edge→origin hop, and the SSL mode must be Full (strict) or you get a redirect
loop or a 526. Confirm before assuming:

```bash
dig +short genmars.co.ke    # server IP = grey cloud; 104./172.67./188.114. = proxied
```

### 3. Firewall

Allow 80 and 443. Nothing else needs to be open — the container is on loopback.

```bash
sudo ufw allow 80,443/tcp
```

Port 80 must stay open even though everything redirects: Let's Encrypt's HTTP-01
challenge uses it, and closing it breaks renewal 60 days later, quietly.

### 4. HSTS

`genmars.caddy` sets `max-age=31536000` and deliberately **omits**
`includeSubDomains` and `preload`.

Both are hard to reverse. `includeSubDomains` breaks any subdomain not yet on
HTTPS; `preload` is a manual, months-long removal process baked into browsers.
Add them once the certificate has renewed cleanly at least once and every
subdomain is known to be TLS-served.

---

## The pipeline

Deploys are automated. Nothing is built on the server, and nothing reaches the
server that has not passed CI.

```
push to main
     │
     ▼
build.yml ── verify ── check:theme, typecheck, lint, build, export not empty
     │
     └───── image  ── docker build ──▶ smoke test ──▶ trivy scan ──▶ push to GHCR
                       (loaded locally, never pushed until it passes)
     │
     ▼   workflow_run: only on success
deploy.yml ─▶ ⏸ production environment — waits for a human to approve
     │
     ▼   ssh
host: deploy/deploy.sh <sha>
     ├─ checkout <sha>          compose.yaml must match the image
     ├─ docker compose pull     SHA-pinned tag from GHCR
     ├─ up -d --no-build        never rebuilds; runs the artefact CI tested
     ├─ wait for healthy ───────┐
     └─ rollback to previous ◀──┘ if health never arrives
     │
     ▼
verify the public site — TLS, routing, 404, security headers
```

Two properties are worth stating, because both are easy to lose in a later
"tidy-up":

**The image that is tested is the image that ships.** CI builds once with
`load: true`, runs `scripts/smoke.sh` and the vulnerability scan against that
local image, and only then `docker tag`s and pushes it. A second build — even a
fully cached one — would publish bytes no test ever saw.

**The server never builds.** `deploy.sh` pulls a SHA-pinned tag and refuses to
rebuild. A `--build` on the host would deploy whatever the host's checkout and
network happened to produce, which is not the artefact any pipeline approved.

### The smoke test is one file

`scripts/smoke.sh` is what `npm run docker:smoke` runs on a laptop and what CI
runs in the `image` job. CI sets `IMAGE` and `SMOKE_SKIP_BUILD=1` so it tests an
image it already has. One definition of "does this container work" means local
and CI cannot drift apart — and the check that caught the `cap_drop: ALL` exec
failure is in it.

### Accepted CVEs expire on 2026-10-29

The `image` job runs Trivy and fails on any CRITICAL or HIGH **that has a fix
available**. `ignore-unfixed: true` is deliberate — a finding nobody can act on
should not hold a deploy.

Two things came out of the first scan, and the difference between them is the
useful part:

- **Seven Alpine package CVEs** — fixable here. `apk upgrade --no-cache` in the
  Dockerfile's runtime stage takes the published fixes, and `pull: true` on the
  build step stops a warm layer cache serving a base image from weeks ago. Both
  are now permanent, so this class self-heals on every build.
- **Fourteen in the Caddy binary itself** — *not* fixable here. Caddy is not an
  apk package in `caddy:2-alpine`; it is a Go binary compiled with Go 1.26.3,
  and the fixes are in 1.26.4+. Nothing in this repository can change that until
  upstream rebuilds.

Those fourteen are accepted in [`.trivyignore.yaml`](../.trivyignore.yaml), each
with a written exposure assessment and an expiry date.

**On 2026-10-29 they re-surface and the build goes red.** That is the design, not
a bug. An accepted risk with no review date is a forgotten one. When it happens:

```bash
docker run --rm aquasec/trivy image caddy:2-alpine --severity HIGH,CRITICAL --ignore-unfixed
```

If upstream has rebuilt on a current Go toolchain, delete the matching entries.
If not, extend the dates — and say so in the commit message, so the decision has
a trail rather than becoming a habit.

Only those specific IDs, only in `usr/bin/caddy`, are silenced. A new CVE in the
Caddy binary, anything in the Alpine packages, and any CRITICAL still block.

### One-time setup

The `deploy` workflow needs an environment called **production** (Settings →
Environments), with **at least one required reviewer** — that approval is the
gate that stands between a merge and genmars.co.ke.

Secrets on that environment:

| Secret | Value |
|---|---|
| `DEPLOY_HOST` | server hostname or IP |
| `DEPLOY_USER` | SSH user owning the checkout, able to run docker |
| `DEPLOY_SSH_KEY` | private half of a deploy-only keypair, unencrypted PEM |
| `DEPLOY_KNOWN_HOSTS` | output of `ssh-keyscan -H <host>` |

Repository variables, all optional: `DEPLOY_PATH` (default `/srv/gen-website`),
`DEPLOY_PORT` (default `22`), `SITE_URL` (default `https://genmars.co.ke`).

`DEPLOY_KNOWN_HOSTS` is not optional in spirit. Without it the only way to make
SSH connect is `StrictHostKeyChecking=no`, which accepts any host key and turns
a DNS or routing compromise into a shell on the deploy path.

Generate the keypair on the host, and give it nothing but a login:

```bash
ssh-keygen -t ed25519 -C 'github-actions deploy' -f ~/.ssh/gh-deploy -N ''
cat ~/.ssh/gh-deploy.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/gh-deploy          # paste into DEPLOY_SSH_KEY, then delete it
ssh-keyscan -H <host>         # paste into DEPLOY_KNOWN_HOSTS
```

The host does **not** need a registry credential of its own. The deploy job
pipes its own short-lived `GITHUB_TOKEN` over SSH to `docker login`, and logs
out again afterwards — so there is no long-lived PAT sitting in the host's
`~/.docker/config.json` waiting to be read.

The host needs `git`, `docker`, `docker compose` v2, and a clean checkout of
this repo at `DEPLOY_PATH` whose `origin` it can fetch unattended.

---

## Deploying a new version

Merge to `main`, then approve the run in the Actions tab. That is the whole
procedure.

### By hand, when it has to be

Deploy or roll back to **any commit whose image is still in GHCR** by running
`deploy` from the Actions tab with a full 40-character SHA — or on the host:

```bash
cd /srv/gen-website
./deploy/deploy.sh <commit-sha>
```

Rollback — Charter 03 §II item 5 requires this to be written down — is the same
command with an older SHA:

```bash
./deploy/deploy.sh 0871208a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e
```

Tags are immutable per commit SHA, so a rollback is always to a known artefact
rather than to "whatever `latest` was yesterday". `deploy.sh` also rolls back on
its own if the new container never reports healthy, so the usual reason to run
this manually is reverting a *working* deploy that turned out to be wrong.

Find a SHA to go back to:

```bash
git log --oneline -10
docker image ls ghcr.io/genmarstech/gen-website
```

### What deploy.sh refuses to do

- **Run against a dirty working tree.** A host with local edits diverges from
  what CI tested, and the first symptom is a `compose.yaml` that does not match
  the image. Commit, stash or discard first.
- **Build.** See above.
- **Prune aggressively.** It prunes dangling images only. `docker image prune -a`
  would delete the previous SHA tag, which is the rollback target.

It also asserts on every deploy that port 3000 is still bound to `127.0.0.1`
only, and rolls back if it is not — see the section above on why a UFW rule will
not save you there.

### The container is healthy but the site is down

`deploy.sh` checks the container on loopback; the workflow then checks
`SITE_URL` from outside. If the first passes and the second fails, the container
is serving and the problem is in front of it:

```bash
systemctl is-active caddy
sudo caddy validate --config /etc/caddy/Caddyfile
dig +short genmars.co.ke
```

That split is deliberate. A certificate or DNS fault is not fixed by rolling the
application back — doing so would just cost you the new version as well — so
`deploy.sh` warns on a public-health failure rather than reverting.

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
- [ ] **Log retention position.** Access logs go to the journal and contain
      visitor IPs — personal data under the Kenyan DPA. Check the effective
      retention (`journalctl --disk-usage`, `MaxRetentionSec` in
      `/etc/systemd/journald.conf`) and make the privacy policy state a period
      that is actually true (Charter 03 §V). This is host-wide, so it covers
      Clips as well — settle it once.

That last one is easy to miss and directly contradicts a privacy policy that has
not been written yet. Settle the retention period before publishing Document A.
