# gen-website ↔ gen-portal

How the marketing site and the client portal fit together, what each side owes
the other, and the things that will quietly break if someone changes one without
the other.

Written from the state of both repositories on **2026-08-28**, updated
**2026-09-01** when the two were actually wired together. Where this document
says "verified", it means the value was read from DNS, from a live HTTP
response, or from a passing test — not from memory.

| | gen-website | gen-portal |
|---|---|---|
| Hostname | `genmars.co.ke`, `www.` | `app.genmars.co.ke`, `api.genmars.co.ke` |
| What it is | Static export — HTML, CSS, JS on disk | Next server + Django + Postgres + Redis |
| Runtime image | Caddy and files. **No Node, no app code** | Node, Python, a database |
| Port (loopback) | `3000` | `3010` web, `8010` api |
| Repo path on host | `/opt/gen-website` | `/opt/gen-portal` |
| Caddy drop-in | `/etc/caddy/conf.d/genmars.caddy` | `/etc/caddy/conf.d/genmars-portal.caddy` |
| Status | **Live** | **Running on the host**; public once Caddy is reloaded |

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

Four, and one of them is a contract.

| From | To | Why |
|---|---|---|
| Header, footer, command palette | `app.genmars.co.ke/sign-in` | A client with an account can reach it |
| `/request/` gate | `app.genmars.co.ke/sign-up` | Account setup before requesting work |
| `/request/` gate | `app.genmars.co.ke/sign-in` | Same, for someone who already has one |
| Privacy policy | `app.genmars.co.ke` | It has to name where client data goes |

**The contract is `?return=`.** The site appends an absolute URL back to the
page the visitor was on; the portal validates it against a fixed allowlist of
origins we own and, once the account is COMPLETE, sends the browser there.
Renaming that parameter on one side turns the round trip into a one-way door
onto the dashboard.

Two rules on it, both load-bearing:

- **The allowlist is parsed, not prefix-matched.** A redirect parameter on an
  auth screen is the classic open-redirect phishing primitive — a link that
  starts on our real domain, over our real TLS, with our real brand, and ends
  on someone else's password form. `startsWith` lets
  `genmars.co.ke.evil.example` straight through. Origins are compared after
  `new URL()`. Never add a wildcard, and never add a value read from a query
  string.
- **It fires only at `/dashboard`.** Returning at `/verify` would drop an
  unverified visitor back onto the site believing they were set up, with no
  dashboard to return to.

`gen-portal/frontend/src/lib/returnTo.ts` and `gen-website/src/lib/portal.ts`
are the two halves. Each has a development origin (`localhost:3010` and
`localhost:3000`); both are needed to exercise the loop locally, and either
alone leaves it half-open.

> The gate on `/request/` is **not authentication** and must never be treated
> as one. A static export has no server to ask and cannot read a cookie scoped
> to `app.genmars.co.ke`; the flag it checks is a boolean in the visitor's own
> local storage. What is behind it composes an email in the visitor's mail
> client. If something of value ever needs protecting, it belongs on the portal.

---

## 3. The design system is duplicated on purpose

`globals.css`, `Brand.tsx`, `LoadingMark.*`, `theme.ts`, `ThemeToggle.*` and
`scripts/check-theme-tokens.mjs` exist in **all three** repositories as copies —
gen-website, gen-portal and internals-tm. A shared package is more machinery
than one engineer needs today; the cost is that a token change applied to one is
not applied to the others, and there are three of them now rather than two.

### The mark

Two forms, and they are not interchangeable:

| | Where | Why that form |
|---|---|---|
| `src/app/icon.png` `apple-icon.png` | all three | The favicon. **Byte-identical copies** — re-rasterising from the SVG invites three subtly different marks. They carry their own deep-well ground, so they read on light and dark browser chrome alike. Next's file convention emits the link tags; no layout code references them. |
| Inline `<svg>` in a component | all three | On-page. `currentColor` is what lets one mark sit on a light header and a dark one without shipping two files — an `<img>` cannot inherit colour. The orbit stays `--mark-orbit` in both themes because it is a brand constant, not a themeable value. |
| `public/genmars-mark.svg` | all three | For anything needing the mark by URL — an email signature, a document, an OG image. Not what the apps render. |

The **path geometry is duplicated in three inline components**. If those `d`
values ever change they change in all three in the same sitting, or Genmars
quietly becomes two different logos depending on which surface you are looking
at.

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

Change it in **all three** repositories in the same sitting, or you will ship
two Genmars that do not match. A client moving from the marketing site to the
portal crosses that seam in one click, and mismatched paint is the most visible
possible failure. internals-tm is seen only by staff, so it is the one that
drifts unnoticed — check it last and check it deliberately.

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

The marketing site sends nothing. Since 2026-09-01 the portal's transactional
mail — verification codes, password resets, error alerts — goes through
**Resend** over its HTTP API, not through Zoho. Zoho remains the human mailbox
that `info@genmars.co.ke` reads and replies from; a six-digit code with a
fifteen-minute life is not what it should be delivering.

The two senders do not share DNS records, and that is the whole trick. Read
live on **2026-09-01**:

| Name | Type | Value | Whose |
|---|---|---|---|
| `genmars.co.ke` | TXT | `v=spf1 include:zohomail.com ~all` | Zoho |
| `send.genmars.co.ke` | TXT | `v=spf1 include:amazonses.com ~all` | Resend |
| `send.genmars.co.ke` | MX | `feedback-smtp.eu-west-1.amazonses.com` | Resend |
| `resend._domainkey` | TXT | DKIM public key | Resend |
| `zmail._domainkey` | TXT | DKIM public key | Zoho |

`genmars.co.ke` is **verified** in Resend (`eu-west-1`), and nothing further is
outstanding. Both DKIM selectors coexist; selectors are independent.

> **Do not merge Resend's include into the root SPF record.** An earlier
> revision of this document said to, and it was wrong. Resend sends with the
> envelope-from on `send.genmars.co.ke`, which carries its own SPF record —
> and SPF is evaluated against the **envelope** domain, not the `From:` header.
> The root record is Zoho's, because Zoho does send as the root. Merging them
> would authorise all of Amazon SES to send as our root envelope domain and
> gain nothing.
>
> The rule that makes the mistake tempting is real: exactly **one** SPF TXT
> record per name, because two is a permerror that fails every sender on that
> name at once. It just does not bite across two different names.

DMARC passes on both paths: DKIM signs `d=genmars.co.ke` for strict alignment,
and `send.genmars.co.ke` aligns with the root under relaxed alignment, which is
the default.

The SMTP path is retained as a fallback: pointing `EMAIL_BACKEND` at Django's
smtp backend with an **application-specific password** (Zoho → Settings →
Security → App Passwords), never the account password, restores mail without a
code change.

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

### 5.1 ~~The site does not link to the portal~~ — done

Done 2026-09-01. A quiet **Sign in** in the header (a link, not a button
competing with the call to action — pushing an account at strangers implies a
self-serve product that does not exist), plus the footer and the command
palette. `Request work` now routes through account setup first. See §2.4 for
the contract that makes the round trip work.

**Deploy order is not optional.** The portal must be serving
`app.genmars.co.ke` before the site ships, or every `Request work` click lands
on a dead host — which is the site's primary conversion path. Portal first,
verify, then the site.

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
| **Cloudflare proxy status** | Every Genmars record is DNS-only. See below — three separate things break |
| The `?return=` parameter name | Both halves must agree, or the loop is a one-way door |
| The portal's allowlisted origins | Drop one and returning visitors land on the dashboard instead |
| `/request/` or its gate | The site's primary conversion path goes through the portal now |

### Every record stays DNS-only (grey cloud)

Verified 2026-09-01, after the orange cloud was briefly enabled and reverted.
Three unrelated things break with it on, which is why this is in the
coordination table rather than left to whoever is next in the DNS panel:

| Host | What breaks | Where it is documented |
|---|---|---|
| `app` `api` `ops` | `NUM_PROXIES = 1` becomes wrong. DRF reads Cloudflare's edge as the client, so per-IP sign-in and code-request throttles collapse into one bucket shared by everyone behind that edge — one abusive client can lock out legitimate users. Proved in Redis: the same probe recorded `162.158.23.122` proxied and `102.211.145.29` direct. | `gen-portal/backend/config/settings.py` |
| `genmars.co.ke` `www` | The **published privacy policy becomes false**. It tells visitors Cloudflare sees "which domain was looked up, not the pages you visit or anything you send", and that "your browser does not contact anyone else while loading this site". Proxied, Cloudflare terminates TLS and neither holds. | `gen-website/deploy/genmars.caddy`, `src/app/privacy/page.tsx` |
| all | Cloudflare injects a managed `robots.txt` **above** ours, adding `User-agent: * / Allow: /` against our deliberate `Disallow: /`. Groups for one user-agent merge, and Google resolves an equal-length Allow over Disallow — so the pre-launch block may not hold. | `gen-website/docs/SEARCH-CONSOLE.md` |

It also adds AAAA records, which broke reachability for an operator whose
network has no working IPv6 path to Cloudflare.

To proxy anything anyway: fix the policy text first, disable Cloudflare's
managed robots.txt, and set `NUM_PROXIES = 2` **with** Caddy `trusted_proxies`
scoped to Cloudflare's ranges — without the second half the forwarded header is
spoofable, which is worse than the problem it solves.

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

Then the seam itself, which no status code covers:

1. `genmars.co.ke/request/` in a browser with clean storage → the account gate,
   not the form.
2. Type something into the form after passing the gate, then go round again →
   the draft is still there.
3. Follow **Create an account** → lands on `app.genmars.co.ke/sign-up`, and the
   page says where it will send you back to.
4. Finish setting up → back on `/request/`, form open, `?from=portal` gone from
   the address bar.
5. Tamper with it: `app.genmars.co.ke/sign-in?return=https://example.com/` →
   must land on the dashboard, **never** on example.com. If it ever does, stop
   and read §2.4.

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
