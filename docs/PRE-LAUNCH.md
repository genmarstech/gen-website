# Pre-launch checklist

**Reconciled against the running system on 2026-09-04.** Everything ticked below
was checked, not remembered, and each tick says how. Read that as the standing
rule for this file: a checklist that is wrong about what is finished cannot be
trusted about what is not, and this one had drifted far enough that three
completed gates still read as open.

**This site is not cleared to publish.** It is built, it works, and it is
deliberately held behind a gate.

**Two things now prevent launch**, both charter requirements rather than
preferences:

1. **Charter 03 §IV Tier 1** — "Privacy policy and terms of service published."
   `/privacy/` is drafted and accurate but still carries its review notice;
   `/terms/` is a placeholder. Both await advocate review
   (`05-policies/Genmars-Policy-Pack-v0.1.pdf`).
2. **No written permission to name clients.** Charter 04 §V — Genmars is
   credited only with written permission. `/work/` therefore shows a holding
   state instead of the projects.

The third blocker in the previous version of this file — that
`info@genmars.co.ke` did not demonstrably exist — is **closed**. Zoho serves the
domain's mail and the address receives; see Gate 2.

While the two above are open, the site ships with `robots.txt` disallowing
everything and `robots: { index: false }` in the root metadata.

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
- [ ] Remove `<ReviewNotice />` from `src/app/privacy/page.tsx` — still rendered,
      confirmed 2026-09-04
- [ ] `privacy@genmars.co.ke` live and monitored — the page names it. See the
      delivery test in Gate 2
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

## Gate 2 — Email (substantially done)

See `09-communication/README.md` for the full scheme.

Two senders, deliberately: **Zoho** carries human mailboxes, **Resend** carries
transactional mail from the portal. They authenticate separately, which is why
there are two sets of records below.

- [x] The domain receives mail at all. Zoho holds the MX (`mx.zoho.com`, `mx2`,
      `mx3`) and `genmars-uptime.timer` has been mailing `info@` on failure
      since 2026-08. DNS verified 2026-09-04; the mailboxes were created in
      Zoho and recorded then
- [ ] **Send a test to each of `info@`, `privacy@` and `security@` from an
      address outside the domain, and confirm it arrives.** MX records prove
      where mail is *routed*, not that a mailbox exists behind it — an alias
      that was never created bounces exactly like a working one until somebody
      tries. Five minutes, and it is the only thing that closes this item
- [x] SPF, DKIM and DMARC published for `genmars.co.ke`. Verified over DoH on
      2026-09-04:
      - SPF `v=spf1 include:zohomail.com ~all`
      - Resend DKIM at `resend._domainkey`, 1024-bit RSA
      - Resend return-path `send.genmars.co.ke` — `include:amazonses.com` plus
        an SES feedback MX, so bounces come back to Resend rather than to us
      - DMARC `v=DMARC1; p=none; rua=mailto:info@genmars.co.ke; fo=1`
- [ ] MFA on every mailbox — **yours to confirm in Zoho.** Not checkable from
      here, and it is the control that matters most: the mailbox is the reset
      path for everything else
- [ ] Emergency mail access holder nominated (Charter 03 §VII)

### Three gaps found on 2026-09-04, none of them breaking

Mail is being delivered and authenticated today. These are the difference
between working and being defensible.

- [ ] **No `zoho._domainkey` published.** Zoho mail is therefore signed by
      nothing of ours and passes DMARC on SPF alignment alone. One forwarding
      hop breaks SPF, and with no DKIM to fall back on the message fails DMARC
      outright. Publish Zoho's DKIM record
- [ ] **The root SPF record does not include Resend.** Portal mail still passes
      DMARC, because it aligns on the Resend DKIM signature and Resend uses its
      own return-path domain for the SPF check — so this is correct as it
      stands, not a bug. Recorded here so that nobody "fixes" it by adding an
      include that is not needed, and so the reasoning survives
- [ ] **DMARC is `p=none`** — monitoring only. Nothing is rejected or
      quarantined, so a forged `@genmars.co.ke` message reaches the recipient
      today. Move to `p=quarantine` once the `rua` reports have been read for
      long enough to show every legitimate sender passing

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
- [ ] ~~Confirm no prices appear anywhere~~ — **superseded.** Prices are now
      published: 27 tier prices across the services catalogue, plus
      `pricingNote` in `src/lib/company.ts`. The check is no longer "are there
      prices" but **is every published price one we will actually honour**, and
      does it still match the pricing model the founder approved. Re-read the
      whole catalogue against it before launch, and again whenever it changes
- [ ] Confirm no response times or SLAs appear anywhere — Charter 03 §IV standing
      rule, and Tier 2 is not met. Note the catalogue publishes **lead times**
      per tier; those are delivery estimates, not a support SLA, and must stay
      worded that way

---

## Gate 4 — Technical

- [ ] Swap `robots.ts` to the allow block and delete `robots: { index: false }`
      from `src/app/layout.tsx`. **Both, or it is a half-launch**
- [ ] Add `/privacy/` and `/terms/` to `src/app/sitemap.ts` once they carry real
      text
- [ ] Confirm the theme toggle persists across a reload in a private window
      (storage can throw; the code falls back to "system"). Needs a browser —
      not verifiable from a build
- [ ] Test **ordering** end-to-end on a phone: pick a tier on `/services/`,
      follow it to `app.genmars.co.ke/order`, sign in, submit. The request
      builder this line used to name no longer exists — `/request/` was removed
      and now 301s to `/services/`, and ordering is the only path in
- [x] OG image. `public/og.png` (1200×630, 393 KB) is in place and referenced
      from both `openGraph.images` and `twitter.images` in
      `src/app/layout.tsx`, cache-busted `?v=2026-09-01`. Verified 2026-09-04
- [x] TLS in front of the site (Charter 03 §IV Tier 1 — TLS everywhere). Caddy
      issues and renews it. `gen-portal/scripts/uptime-check.sh` re-checks the
      certificate's expiry every 15 minutes, so this stays true rather than
      having been true once
- [x] Error monitoring that reaches a human (Tier 1). `genmars-uptime.timer`
      checks `https://genmars.co.ke/` alongside the portal every 15 minutes and
      mails `info@genmars.co.ke` through Resend on failure. Lives in
      `gen-portal/` because that is where the host units are, not because the
      site is an afterthought
- [ ] Automated backup of the repository, with a **tested restore** (Tier 1 — an
      untested backup is not a backup). GitHub is the off-box copy; the untested
      half is a clone-and-build from scratch, which is what actually gets used
      after a laptop dies. The *database* half is done and tested — see
      `gen-portal/docs/DEPLOYMENT.md`, restore-test log, and
      `gen-portal/scripts/restore-test.sh`.
      **The standing risk this item is really about:** the GPG private key
      `413CB8DF5FECF5F4` exists only on one laptop. Every encrypted backup we
      hold is unreadable without it. A clone-and-build drill that does not also
      prove the key is recoverable is testing the easy half
- [x] Deploy and rollback procedure written down (Charter 03 §II item 5) —
      `docs/DEPLOYMENT.md`, "Deploying a new version". Images are pinned by
      commit SHA, so a rollback always names a known artefact
- [x] Built output carries nothing that should not ship. `grep -ril
      "TODO\|FIXME\|lorem ipsum" out/` returns nothing, 2026-09-04. **Re-run it
      on the build you actually publish** — this passing today says nothing
      about the next build

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

## Open calls that are not tasks

These are decisions, not work items, and a checkbox is the wrong shape for
them. Record each one in the decision register at
`ops.genmars.co.ke/decisions` when it is made — with what was true at the time,
which is the part that stops being obvious.

- **Internal TLS between the API and Postgres.** Currently unencrypted on the
  Docker network. Charter 03 §IV Tier 1 as published says "TLS everywhere", so
  the position today is PARTIAL and there are exactly two honest ways out:
  encrypt the link, or reword the published requirement to say what we actually
  hold ourselves to. Marking it met is not one of them
- **Email retention period.** The only unbounded personal data we hold. The
  privacy page says openly that we have not fixed one, which is true and should
  not stay true
- **DMARC enforcement.** `p=none` today. Moving to `p=quarantine` is a decision
  about who is allowed to send as us, and it should be made after reading the
  reports rather than on a schedule
- **Tier 1 assessment for `gen-website` and `internals-tm`.** Both are recorded
  as systems and neither has been assessed — 0 of 6 checks each. An unassessed
  system is not a passing one, and the security screen should not be read as
  though it were

---

## After launch

Not blocking, but queued:

- **Company Profile** — the client-facing overview (root README, not yet built)
- Revisit the team page at Stage 1, when there are engineers to introduce
  (Charter 01 §VII). Not before — Charter 04 §IV forbids inventing one
- Publish response times once Tier 2 is genuinely met, and not a day earlier
- Case studies once there is signed, delivered work with **written permission**
  to describe it (Charter 04 §IV)
