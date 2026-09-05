# Google Search Console

What is in place, how to verify the property, and the exact change that lets
Google index the site — which is a **launch decision, not an SEO task**.

Written 2026-09-01. Where this says "verified", it means the value was read from
the built output in `out/`, not from memory.

---

## Read this first: the site went indexable on 2026-09-05

`robots.txt` says `Allow: /` and every page except the 404 carries
`index, follow`. It was the opposite from the first deploy until that date,
because Charter 03 §IV Tier 1 requires a published privacy policy and terms of
service, and `/terms/` was a page reading "this document is not yet published".

Both are now published at v1.0, written against the running system. That is
what opened the gate.

**One page is still deliberately held back by its own content, not by robots:**
`/work/` names no client, because Charter 04 §V forbids crediting client work
without written permission and none has been requested. The page shows a holding
state. It is crawlable and correct; there is simply nothing on it to rank for
yet, and that is Gate 2b, not an SEO problem.

> **Neither document has been reviewed by an advocate**, and both carry a
> visible notice saying so. That notice is now the only thing carrying it —
> before this change, nobody could reach the pages. Do not remove it as tidying.

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

**Done on 2026-09-05, in commit `d361d8c`.** Recorded here because the symptoms
of getting it half right are identical to "Google has not got to us yet", and
the next person to touch it needs to know both halves exist.

1. `src/app/robots.ts` — `disallow: "/"` became `allow: "/"`.
2. `src/app/layout.tsx` — `robots` became `index: true, follow: true` with
   explicit `googleBot` snippet and preview limits.
3. `src/app/privacy/page.tsx` and `src/app/terms/page.tsx` — the per-page
   `robots: { index: false, follow: false }` came off. Easy to miss: a page-level
   noindex silently overrides the root metadata, so the site would have been
   crawlable with its two newest documents still invisible.
4. `src/app/sitemap.ts` — `/privacy/` and `/terms/` added at priority 0.3, and
   `CONTENT_REVIEWED` bumped to `2026-09-05`.

`src/app/not-found.tsx` keeps its noindex, which is correct.

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
