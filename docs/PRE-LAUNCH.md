# Pre-launch checklist

**This site is not cleared to publish.** It is built, it works, and it is
deliberately held behind a gate.

Three things currently prevent launch, and all are charter requirements rather
than preferences:

1. **Charter 03 §IV Tier 1** — "Privacy policy and terms of service published."
   Both are drafts in `05-policies/Genmars-Policy-Pack-v0.1.pdf`, carrying blanks
   and awaiting advocate review.
2. **`info@genmars.co.ke` does not yet demonstrably exist.** The site prints it.
   A contact address that bounces is worse than no address.
3. **No written permission to name clients.** Charter 04 §V — Genmars is
   credited only with written permission. `/work/` therefore shows a holding
   state instead of the projects.

While those are open, the site ships with `robots.txt` disallowing everything and
`robots: { index: false }` in the root metadata.

---

## Gate 1 — The policy pack (blocks everything)

From the Policy Pack's own publishing checklist:

- [ ] Every blank in Document A (Privacy Policy) and Document B (Terms of
      Service) completed
- [ ] Every control claimed in Document A actually implemented — checked line by
      line against Document C (Security & Access Policy)
- [ ] Advocate review complete, covering the Policy Pack **together with** the
      Client Agreement Pack and the Ownership Term Sheet in one engagement
- [ ] Data protection registration position confirmed (Charter 03 §V — open)
- [ ] Both documents dated and version-numbered on the page itself
- [ ] Footer links live on every page *(already wired — the routes exist)*
- [ ] Terms acceptance recorded at signup for any product with accounts *(N/A —
      no product on this site)*

### Status

| Route | State |
|---|---|
| `/privacy/` | **Drafted** 2026-08-27 from `05-policies/data-processing-record.md`. Every claim verified against the running system. Carries a visible draft notice. Awaiting advocate review |
| `/terms/` | **Placeholder.** Liability, warranties and jurisdiction are genuine legal drafting — not written. Source: Policy Pack Document B, `src/app/terms/page.tsx` |

To finish `/privacy/`:

- [ ] Advocate review, alongside Terms, the Client Agreement Pack and the
      Ownership Term Sheet — one engagement
- [ ] Remove `<ReviewNotice />` from `src/app/privacy/page.tsx`
- [ ] `privacy@genmars.co.ke` live and monitored — the page names it
- [ ] Settle the email retention period; the page currently says openly that we
      have not fixed one, which is true but should not stay true
- [ ] Controller/processor position with the ODPC confirmed (Charter 03 §V)

**If the log retention period ever changes, this page changes.** It states 30
days. A policy claiming 30 while the server keeps 90 is a misrepresentation, and
it surfaces at the worst possible moment. Verify before publishing:

```bash
grep MaxRetentionSec /etc/systemd/journald.conf
```

> **Do not paste generated boilerplate into the Terms page.** The Policy Pack's
> governing rule: *a published policy is a promise.* If the privacy policy says
> data is encrypted at rest and it is not, that is a misrepresentation to every
> person who read it — discoverable in exactly the moment you least want it.
> The placeholder is the safer state until the real text exists.

Delete `src/components/PolicyPlaceholder.tsx` once `/terms/` carries real text —
`/privacy/` no longer uses it.

---

## Gate 1b — Log retention (done)

Set 2026-08-27: `MaxRetentionSec=30day` in `/etc/systemd/journald.conf`,
host-wide, so it covers `clipsserenityspa.co.ke` too. Access logs contain
visitor IPs, which are personal data under the Kenyan DPA (Charter 03 §V).

Recorded in `05-policies/data-processing-record.md` and stated on `/privacy/`.
The three must stay in agreement.

- [ ] Email retention period — still open, and the only unbounded personal data
      we hold

---

## Gate 2 — Email

See `09-communication/README.md` for the full scheme.

- [ ] `info@genmars.co.ke` exists, is monitored, and has been sent a test from
      outside the domain
- [ ] `privacy@genmars.co.ke` exists — the privacy policy will name it
- [ ] `security@genmars.co.ke` exists
- [ ] SPF, DKIM and DMARC published for `genmars.co.ke`
- [ ] MFA on every mailbox
- [ ] Emergency mail access holder nominated (Charter 03 §VII)

---

## Gate 2b — Client permission (blocks `/work/`)

**Charter 04 §V:** "Client-owned software carries the client's brand; Genmars is
credited only with **written permission**." §IV forbids listing "client logos we
do not have written permission to display."

Two clients are recorded in `src/lib/company.ts`, both with
`permissionOnFile: false`:

| Client | Site | Permission |
|---|---|---|
| Avinterra Expeditions | avinterra.tours | ☐ Not yet requested |
| Clips Serenity Spa | clipsserenityspa.co.ke | ☐ Not yet requested |

For each one:

- [ ] Ask in writing whether Genmars may name them and describe the work
- [ ] Confirm what they are comfortable with — name only, name plus link, or a
      full description
- [ ] Store the reply in `07-executed/` alongside the other records
- [ ] Set `permissionOnFile: true` for that entry, and only then

**The page is all-or-nothing on purpose.** `workIsPublishable` requires every
entry to have permission — a partial list implies the rest were less successful,
which is both untrue and unfair to the client who did say yes. If one client
declines, remove that entry rather than publishing a shortened list.

Descriptions cover only what each live site observably does. Do not add metrics
("increased bookings by X%") unless the client provides them in writing and
agrees to their publication — Charter 04 §III, specific over impressive, and
never a number we cannot evidence.

---

## Gate 3 — Content review by the founder

Charter 02 §I: **public statements, brand and website are the founder's sole
decision.** Nothing below is for anyone else to sign off.

- [ ] Every claim on the site is true **today** (Charter 04 §IV standing rule)
- [ ] Team size stays off the site. It was removed at the founder's direction;
      `team` in `src/lib/company.ts` is marked internal. Revisit at Stage 1
- [ ] Confirm the site correctly says nothing about AuthGate. Charter 04 §IV
      forbids announcing a product before it can be used, and AuthGate has no
      product brief and no gate position (`08-products/authgate/README.md`)
- [ ] Confirm no prices appear anywhere — they are still open
- [ ] Confirm no response times or SLAs appear anywhere — Charter 03 §IV standing
      rule, and Tier 2 is not met

---

## Gate 4 — Technical

- [ ] Swap `robots.ts` to the allow block and delete `robots: { index: false }`
      from `src/app/layout.tsx`. **Both, or it is a half-launch**
- [ ] Add `/privacy/` and `/terms/` to `src/app/sitemap.ts` once they carry real
      text
- [ ] Confirm the theme toggle persists across a reload in a private window
      (storage can throw; the code falls back to "system")
- [ ] Test the request builder end-to-end on a phone — the `mailto:` must open
      the device's mail app with the body intact
- [ ] Add an OG image — export from `06-brand/source/`, then set `openGraph.images`
      in `src/app/layout.tsx`. `06-brand/logo/png/genmars-banner-gradient.png`
      (2400×900) is the intended source
- [ ] TLS in front of the site (Charter 03 §IV Tier 1 — TLS everywhere). Caddy
      does this automatically; confirm the certificate actually issued
- [ ] Error monitoring that reaches a human (Tier 1). A static site fails
      differently from an app, but "the site is down" still needs to reach someone
- [ ] Automated backup of the repository, with a **tested restore** (Tier 1 — an
      untested backup is not a backup)
- [ ] Deploy and rollback procedure written down (Charter 03 §II item 5)
- [ ] Check the built output for anything that should not ship:
      `grep -ri "TODO\|FIXME\|lorem" out/`

---

## Deployment

Static export. `npm run build` emits `out/` — plain HTML, CSS, JS and
self-hosted fonts. No Node process runs in production, so there is nothing to
patch or monitor at runtime.

Charter 03 §I gives the runtime as **Docker Compose, Caddy, Hetzner**, with CI on
**GitHub Actions**. The simplest arrangement that satisfies it: build in Actions,
publish `out/` to the Hetzner host, and let Caddy serve it with automatic TLS.

A minimal Caddyfile:

```
genmars.co.ke {
    root * /srv/gen-website
    encode gzip zstd
    file_server
    try_files {path} {path}/ {path}.html /404.html

    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
        X-Frame-Options "DENY"
    }

    header /_next/static/* Cache-Control "public, max-age=31536000, immutable"
}
```

`trailingSlash: true` in `next.config.ts` keeps the exported tree and the served
URLs identical, so `try_files` resolves cleanly.

---

## After launch

Not blocking, but queued:

- **Company Profile** — the client-facing overview (root README, not yet built)
- Revisit the team page at Stage 1, when there are engineers to introduce
  (Charter 01 §VII). Not before — Charter 04 §IV forbids inventing one
- Publish response times once Tier 2 is genuinely met, and not a day earlier
- Case studies once there is signed, delivered work with **written permission**
  to describe it (Charter 04 §IV)
