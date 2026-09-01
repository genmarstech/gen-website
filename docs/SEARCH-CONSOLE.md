# Google Search Console

What is in place, how to verify the property, and the exact change that lets
Google index the site — which is a **launch decision, not an SEO task**.

Written 2026-09-01. Where this says "verified", it means the value was read from
the built output in `out/`, not from memory.

---

## Read this first: the site is deliberately not indexable

`robots.txt` says `Disallow: /` and every page carries `noindex, nofollow`.
That is on purpose, and it is not a mistake to be tidied up:

- `/privacy/` is a **draft** carrying a visible review notice, awaiting an
  advocate.
- `/terms/` is a **placeholder**. Liability, warranties and jurisdiction are
  genuine legal drafting and are not written.
- `/work/` names two clients whose **written permission has not been
  requested**. Charter 04 §V forbids crediting client work without it.

Charter 03 §IV Tier 1 requires a published privacy policy and terms of service
before anything goes live. Until `docs/PRE-LAUNCH.md` Gate 1 and Gate 2b are
met, indexing stays off.

> **Verification does not require indexing.** You can verify the property,
> submit the sitemap, and watch coverage today. Search Console will simply
> report the pages as excluded by robots.txt — which is the correct and
> expected state, not a fault to fix.

---

## 1. Create the property

Use a **Domain property**, not a URL-prefix property.

| | Domain property | URL-prefix property |
|---|---|---|
| Verified by | one DNS TXT record | HTML tag, file, GA, GTM |
| Covers | `genmars.co.ke` **and every subdomain** — `www`, `app`, `api`, `ops` — on http and https | exactly one origin |
| Survives a redeploy | yes | an HTML tag can be lost by a bad build |

Genmars runs four hostnames off this domain. One domain property covers all of
them; four URL-prefix properties would need verifying and maintaining
separately.

**Add the TXT record Search Console gives you at the apex.** It sits alongside
the existing records — SPF, the Zoho verification strings, Resend's DKIM — and
does not disturb them. TXT records at one name coexist freely; only SPF has the
one-record-per-name rule, and this is not SPF.

```bash
# after adding it
dig +short TXT genmars.co.ke | grep google-site-verification
```

### If DNS is not available to you

An HTML tag is wired but **not enabled**. It is emitted only when the build is
given a token:

```bash
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<token> npm run build
```

It must be set at **build** time — this is a static export, so there is no
runtime to read an environment variable later. In CI that means adding it to
the `build` workflow's env. Prefer the DNS record.

---

## 2. Submit the sitemap

`https://genmars.co.ke/sitemap.xml` — Search Console → Sitemaps → add.

It lists five routes. Three are deliberately absent:

| Route | Why it is not listed |
|---|---|
| `/privacy/` `/terms/` | Draft and placeholder. A policy page in the index that says "not yet published" is worse than none. |
| `/request/` | It sends a first-time visitor to `app.genmars.co.ke` to set up an account. A crawler experiences that as a redirect off the site, so listing it asks Google to discover a page and then tells it the page is elsewhere. `/contact/` is the indexable route for getting in touch. |

`lastmod` is a **constant**, `CONTENT_REVIEWED` in `src/app/sitemap.ts`, bumped
by hand when copy actually changes. It used to be the build time, which told
Google that every page had changed on every deploy — and lastmod that always
changes is lastmod Google stops trusting.

---

## 3. What is already in place

Verified in `out/` on 2026-09-01:

- **Canonical URL on every route**, absolute, resolved against `metadataBase`.
  Declared per page rather than in the root layout on purpose: a canonical in
  the layout is inherited, so the day someone adds a page and forgets one, that
  page quietly tells Google it *is* the home page.
- **Open Graph and Twitter cards** with a 1200x630 image at `public/og.png`,
  including `og:image:alt`. Declared explicitly in `layout.tsx` rather than
  through Next's `opengraph-image.png` file convention: that convention emits
  the image, type, width and height but **not** the alt from the adjacent
  `.alt.txt` in a static export — checked in `out/`, not assumed — and alt text
  is the only part a screen-reader user of a social platform gets. Bump the
  `?v=` when the image changes or Slack and WhatsApp will serve the old one for
  weeks. Source and regeneration steps in
  `docs/assets/opengraph-image.source.html`.
- **Organization JSON-LD** in the root layout — name, registration number,
  address, contact point. Only facts already stated on the page; no invented
  founding date, employee count or aggregate rating (Charter 04 §IV).
- **`www` → apex 301** at the Caddy edge, so the two are not competing URLs.
- **Trailing slashes** consistent between `next.config.ts`, the sitemap and the
  canonicals, and now enforced: `/services` **308s** to `/services/` in
  `deploy/container.Caddyfile`. Both used to return 200 with byte-identical
  content — two URLs for one page. The canonical tag alone would have let
  Google consolidate them, but the redirect stops the duplicate being linked or
  shared at all. The matcher deliberately excludes `/healthz`, which has no
  extension and no trailing slash and would otherwise be redirected — taking
  the container out of rotation.
- **Per-page titles and descriptions** on all seven routes.

---

## 4. Going live — the exact change

Only when `docs/PRE-LAUNCH.md` Gate 1 and Gate 2b are actually met.

**Two files, and both must change together.** One without the other is a
half-launch that is hard to debug later, because the symptoms are identical to
"Google has not got to us yet".

1. `src/app/robots.ts` — swap `disallow: "/"` for the allow block below it.
2. `src/app/layout.tsx` — delete the `robots: { index: false, follow: false }`
   block.

Then, if `/privacy/` and `/terms/` are genuinely published, add them to
`src/app/sitemap.ts` and bump `CONTENT_REVIEWED`.

Afterwards:

```bash
curl -s https://genmars.co.ke/robots.txt                     # Allow: /
curl -s https://genmars.co.ke/ | grep -o 'name="robots"[^>]*' # should find nothing
```

Then in Search Console: **URL Inspection → genmars.co.ke → Request indexing**.

---

## Related

- `docs/PRE-LAUNCH.md` — the gates that block this
- `docs/PORTAL-INTEGRATION.md` §4 — mail DNS, which shares the apex TXT records
- `docs/DEPLOYMENT.md`
