# gen-website ↔ gen-portal

How the marketing site and the client portal fit together, what each side owes
the other, and the things that will quietly break if someone changes one without
the other.

Written from the state of both repositories on **2026-08-28**. Where this
document says "verified", it means the value was read from DNS, from a live
HTTP response, or from a passing test — not from memory.

| | gen-website | gen-portal |
|---|---|---|
| Hostname | `genmars.co.ke`, `www.` | `app.genmars.co.ke`, `api.genmars.co.ke` |
| What it is | Static export — HTML, CSS, JS on disk | Next server + Django + Postgres + Redis |
| Runtime image | Caddy and files. **No Node, no app code** | Node, Python, a database |
| Port (loopback) | `3000` | `3010` web, `8010` api |
| Repo path on host | `/opt/gen-website` | `/opt/gen-portal` |
| Caddy drop-in | `/etc/caddy/conf.d/genmars.caddy` | `/etc/caddy/conf.d/genmars-portal.caddy` |
| Status | **Live** | Deployable, not launched |

---

## 1. Why they are two repositories

Not organisational tidiness. The marketing site's defining security property is
that its runtime image contains **no Node and no application code** — a static
site cannot have a dependency CVE at runtime because it has no dependencies at
runtime. Adding authentication would destroy that outright, and it would put
client personal data on the domain that anonymous strangers browse all day.

So the split is the security boundary, and it holds in both directions:

- **A compromise of the marketing site reaches no client data.** There is none
  there, and no credential, and no database.
- **A compromise of the portal does not deface the public site.** Different
  container, different image, different port.

Anything proposed that would merge them — "just add a login page to the site" —
gives up both properties at once. Say no, and point here.

---

## 2. What actually connects them

Four things, and only four. Everything else is deliberately independent.

### 2.1 One shared host, one shared Caddy

Both run as containers on the same Hetzner box, published to `127.0.0.1` only,
with the host Caddy terminating TLS and proxying to them. `clipsserenityspa.co.ke`
— a **live client site** — is on the same machine.

`/etc/caddy/Caddyfile` does nothing but `import /etc/caddy/conf.d/*.caddy`. Each
site owns one drop-in. **Never copy a drop-in over the main Caddyfile**; it
would take the client site down.

```bash
sudo caddy validate --config /etc/caddy/Caddyfile   # necessary
sudo systemctl reload caddy
systemctl is-active caddy                            # NOT optional — see below
```

`caddy validate` passing is not sufficient. Some failures happen at *load*
rather than at adapt, so validate passes and only the reload breaks. Both
drop-ins deliberately have **no `log { output file … }` block** for exactly
that reason; access logs go to the journal.

### 2.2 Ports that must never collide

`3000` website · `3010` portal web · `8010` portal api · `8085` Clips ·
`3306` Clips MariaDB.

Before adding any service, check. A collision presents as a container that
restarts forever, not as a helpful error.

### 2.3 Links from the portal to the site

The portal owns no marketing content and no policy documents. It links out:

| From | To | Why |
|---|---|---|
| Sign-up form | `https://genmars.co.ke/terms/` | Terms acceptance at signup (Policy Pack) |
| Sign-up form | `https://genmars.co.ke/privacy/` | Same |
| Dashboard empty state | `https://genmars.co.ke/contact/` | Someone with an account but no engagement |

**These must be absolute URLs.** They were relative (`/terms`, `/privacy`),
which resolved to `app.genmars.co.ke` and returned 404 — on the one paragraph a
client has to read *before agreeing to it*. Fixed 2026-08-28. If you ever see a
bare `href="/terms"` in the portal again, it is that bug returning.

### 2.4 Links from the site to the portal

**There are none yet, and this is the gap.** See §5.

---

## 3. The design system is duplicated on purpose

`globals.css`, `Brand.tsx`, `LoadingMark.*`, `theme.ts`, `ThemeToggle.*` and
`scripts/check-theme-tokens.mjs` exist in **both** repositories as copies. A
shared package is more machinery than one engineer needs today; the cost is that
a token change applied to one is not applied to the other.

Verified 2026-08-28: the token *names* are identical bar one, and every brand
constant agrees exactly.

```
--deep-well #2e2b34   --mahogany #834f49   --imperial-topaz #8b5a48
--wild-ginger #82555b --ignition #db7b51   --accent-text #834f49
```

`--danger` exists only in the portal, correctly — the marketing site has no
form that can fail.

### The rule that matters more than any token value

**Brand constants are not themeable values.** `--ignition`, `--deep-well` and
friends are fixed paint. `--ink`, `--bg`, `--accent-text` are semantic and flip
between light and dark. Using a brand constant where a semantic token belongs
produces a panel that is light in both themes with text that is light in one of
them — which is exactly the bug that shipped once on the marketing site and was
reported as "sections showing this way".

Both repos run `scripts/check-theme-tokens.mjs` in the build to prevent it.
Neither build passes with a brand constant used as a themeable value. Do not
disable it; it has already earned its place.

```bash
npm run check:theme
```

### When you change a token

Change it in **both** repositories in the same sitting, or you will ship two
Genmars that do not match. A client moving from the marketing site to the portal
crosses that seam in one click, and mismatched paint is the most visible
possible failure.

---

## 4. Mail is shared, and the portal depends on it

One Zoho Workplace mailbox, `info@genmars.co.ke`, serves both. Verified live in
DNS on 2026-08-28:

| Record | Value |
|---|---|
| MX | `mx.zoho.com` / `mx2` / `mx3` |
| SPF | `v=spf1 include:zohomail.com ~all` |
| DKIM | selector **`zmail`** |
| DMARC | `v=DMARC1; p=none; rua=mailto:info@genmars.co.ke; fo=1` |

The selector is `zmail`, **not** `zoho` — that name returns NXDOMAIN and reads
as "DKIM is not configured" when it plainly is.

The marketing site sends nothing. The portal sends verification codes, password
resets and error alerts through this mailbox, using an **application-specific
password** (Zoho → Settings → Security → App Passwords), never the account
password.

> The portal refuses to boot in production without a sendable mail
> configuration. That guard exists because the failure is otherwise invisible:
> Django's development default is the *file* backend, so sign-up would return
> 200, write the code to a file inside the container, and the client would wait
> forever for a message nobody sent.

`p=none` is an observation policy. Anyone can still send as `@genmars.co.ke`
and be delivered. Read the reports, then tighten to `p=quarantine` — do not jump
to `p=reject`.

---

## 5. What is still missing — and it is on this repo

### 5.1 The site does not link to the portal

Today a client with an account has **no way to reach `app.genmars.co.ke` from
`genmars.co.ke`**. They have to know the subdomain and type it. That is the
opposite of seamless, and it is the single highest-value change on this list.

The recommendation is a quiet **Sign in** in the site header, right-aligned,
pointing at `https://app.genmars.co.ke/sign-in`. Not a call to action and not a
button competing with "Get in touch" — signing in is for people who already have
an account, and pushing it at strangers implies a self-serve product that does
not exist.

Deliberately **not done in this pass**: it is a visible change to a live public
site and a content decision, not a bug fix.

### 5.2 The privacy policy becomes false the day the portal launches

This is a launch blocker, not a nicety. The published policy currently states:

> "No accounts. There is nothing to sign up for" · "no personal data at rest"

Both are true today. Both are **false** the moment the portal holds one client
account. The policy needs rewriting against the data processing record — not
patching — and the controller/processor position with the ODPC (Charter 03 §V)
changes its framing.

### 5.3 `/terms/` is a placeholder

It returns 200 and says nothing binding. The Policy Pack requires terms
acceptance recorded at signup for any product with accounts. The portal already
links here and already asks clients to accept it.

### 5.4 `privacy@genmars.co.ke` does not exist

It is named in the published policy. On the single-user Zoho plan this is free —
an **alias** on the existing mailbox, not a second user.

---

## 6. Deploy order, and what is safe to do alone

They deploy independently. Neither build depends on the other, and no artefact
crosses between them.

**Safe alone:** copy, styling, a new marketing page, portal features, portal
migrations.

**Must be coordinated:**

| Change | Because |
|---|---|
| A design token | Two Genmars that do not match |
| Anything at `/terms/` or `/privacy/` | The portal links to them at signup |
| The `contact/` URL | The portal's empty state links to it |
| A new port or container | Shared host, and a live client site on it |
| Caddy `conf.d` | One bad reload affects every site on the box |

**Rollback is per-site.** Removing the portal's drop-in and reloading Caddy
takes the portal dark and leaves `genmars.co.ke` and the client site untouched.
That isolation is worth preserving.

---

## 7. Verifying the seam

After deploying either side:

```bash
# both alive
curl -sI https://genmars.co.ke/            | head -1
curl -sI https://app.genmars.co.ke/        | head -1
curl -s  https://api.genmars.co.ke/api/health

# the links the portal depends on — these must be 200, not 404
curl -s -o /dev/null -w "terms   %{http_code}\n" https://genmars.co.ke/terms/
curl -s -o /dev/null -w "privacy %{http_code}\n" https://genmars.co.ke/privacy/
curl -s -o /dev/null -w "contact %{http_code}\n" https://genmars.co.ke/contact/
```

Then look at both in a browser, in **dark mode**, one after the other. Token
drift does not show up in a status code.

---

## Related

- `docs/DEPLOYMENT.md` — this site
- `docs/PRE-LAUNCH.md` — this site's blockers
- `gen-portal/docs/DEPLOYMENT.md` — the portal, including rollback after a
  migration has run
- `gen-portal/docs/PRE-LAUNCH.md` — Tier 1 status, honestly scored
- `genmarstech/09-communication/README.md` — mail, in full
