# Search engine optimisation — what is configured, and what is deliberately not

The standing reference for how genmars.co.ke is set up to be found. It is
written against Google's own Search Essentials and SEO Starter Guide, in the
order that guide raises things, with the answer for **this** site beside each.

Written 2026-09-09. Everything marked *verified* was read from the running site
or from `out/` after a build, not from memory. Where a claim here and the code
disagree, the code is right and this file is stale — fix it.

Companion documents: `docs/SEARCH-CONSOLE.md` is the property, the sitemap
submission and the day the site opened to crawlers. This file is the standing
configuration. The ops dashboard carries the operator's version of the same
thing at **Settings → Engineering → Search visibility**, which is where the
recurring tasks live.

---

## The one-paragraph summary

The site is a seven-page static export with no server, no user content, no
search, no faceted URLs and no admin area. That removes most of what the guide
spends its length on. What is left — crawlability, one URL per page, honest
titles and descriptions, real alt text, structured data that is true, and
content worth reading — is in place and listed below. **The remaining work is
not technical.** It is Gate 2b (permission to name client work) and getting
linked to from elsewhere, and neither is fixed by editing this repository.

---

## 1. Can Google find it

| Thing | Where | State |
|---|---|---|
| `robots.txt` | `src/app/robots.ts` | `Allow: /`, sitemap declared. Verified live. |
| Sitemap | `src/app/sitemap.ts` → `/sitemap.xml` | Six URLs today. Verified live. |
| Indexability | `robots` block in `src/app/layout.tsx` | `index, follow`, with explicit `googleBot` snippet and preview limits |
| Sitemap submitted | Search Console → Sitemaps | **operator task** — see `docs/SEARCH-CONSOLE.md` §2 |
| Inbound links | not in this repo | the real gap; see §8 |

**The pair that must move together.** `robots.ts` and the `robots` block in
`layout.tsx` are two halves of one decision. An `Allow: /` with a `noindex` in
the markup means every page is crawled and none indexed, and Search Console
reports it as *Excluded by 'noindex' tag* — which reads like a bug and is not
one. A page-level `robots` in any `page.tsx` silently overrides the root, which
is the same trap one level down. Change both, or neither.

## 2. Can Google see what a visitor sees

Yes, and there is very little machinery between the two. The export ships
HTML with the text already in it; nothing is fetched after load; the CSP allows
nothing from anywhere else, so there is no third-party resource for a crawler
to be blocked from. No content varies by the visitor's country, so what Google
sees from the United States is what everybody sees.

Confirm with **URL Inspection → Test live URL → View crawled page** in Search
Console rather than by reasoning about it.

## 3. One URL per page

Four ways this site could have served one page under several addresses, and
what closes each:

| Duplicate | Closed by |
|---|---|
| `www.` and apex | 301 at the edge — `deploy/genmars.caddy` |
| `http` and `https` | 308 by Caddy, HSTS on top |
| `/services` and `/services/` | 308 — `deploy/container.Caddyfile`, the `@needsTrailingSlash` matcher |
| Anything else | absolute `alternates.canonical` on **every** route |

Canonicals are declared per page rather than once in the root layout. A
canonical in the layout is inherited, so a new page that forgets one would
quietly tell Google it *is* the home page. Explicit per route means a missing
canonical is merely missing.

`/request/` is a permanent 301 to `/services/`, not a 404, because links to it
exist in the world.

## 4. Titles and descriptions

Every route has both, verified live. The title template lives in `layout.tsx`;
each page supplies the short half (`Work` → `Work — Genmars Tech`). The home
page deliberately has no override — the default is already right for it.

**A description is a promise to somebody who has not clicked yet.** That is why
`/work/`'s description is derived from `clientWorkIsPublishable` rather than
written once: while no client permission is on file the page names no client,
and the old description advertised booking systems and payment paths to somebody
who would arrive at a holding notice. The snippet says what is actually there —
today, the Business Platform — and becomes the other sentence in the same commit
that flips the flag.

The page is now in the sitemap, which it was not while it held only a notice. A
sitemap is a request to spend crawl budget, and there was nothing to spend it
on; there is now.

## 5. Structured data

Two blocks, both only restating facts that are already visible on the page:

- **Organization**, in `src/app/layout.tsx` — name, location, contact point,
  and `sameAs` for the live social profiles. `sameAs` is what tells a search
  engine that the Instagram account calling itself Genmars and this domain are
  the same organisation; without it they are two unrelated things sharing a
  name, which is the gap an impersonator occupies.
- **WebSite**, in `src/app/page.tsx` — home page only, because that is the only
  place Google reads it. It is the documented way to control the **site name**
  shown above a result, in place of the bare domain.

Deliberately absent, and each for a reason:

| Not used | Why |
|---|---|
| `SearchAction` | It declares a URL a crawler can send a query to. There is no search endpoint — the command palette resolves in the browser. |
| `AggregateRating`, `Review` | No reviews exist. Charter 04 §IV applies to machine-readable claims exactly as it applies to visible copy. |
| `Product` / `Offer` on `/services/` | The prices are real and published, but this is not a shop: nothing here can be bought without a conversation, and marking it up as purchasable stock would misrepresent how the company actually sells. Revisit if that changes. |
| `LocalBusiness` | Requires a street address and opening hours. Neither is published, and inventing them to satisfy a schema is exactly the wrong direction. |
| `BreadcrumbList` | Seven pages, one level deep. There is no hierarchy to describe. |
| `identifier` (registration number) | Off the public site on purpose. Publishing it as metadata puts it back in the form that gets scraped rather than read. |

Check with the Rich Results Test after any change to either block.

## 6. Images

`src/components/Photo.tsx` handles all of it: AVIF, WebP and JPEG in preference
order, a real `srcset` and `sizes`, explicit width and height so nothing shifts
as the page loads, and lazy loading everywhere except the hero.

Alt text describes what is in the frame. The three photographs are **stock**,
show no people, and their alt text must never imply they are our team, our
office or our clients — and they must never appear on `/work/`.

The social card is `public/og.png`, declared explicitly in `layout.tsx` with
`og:image:alt`, which Next's file convention does not emit in a static export.
Bump the `?v=` when the image changes or Slack and WhatsApp will serve the old
one for weeks.

## 7. What the guide says not to bother with

Recorded so nobody spends a day re-litigating it: meta keywords are ignored;
keyword density is not a thing to tune; the words in a domain name carry
essentially no ranking weight; there is no target word count; headings do not
have to be in a particular number or order to be understood; `changefreq` and
`priority` in a sitemap are advisory at best and Google largely ignores both
(ours are left in place because they cost nothing, not because they do
anything); and E-E-A-T is a way of describing what makes content good, not a
dial in an algorithm.

Two of those are worth stating positively, because they are the actual work:
write the page for the reader, and be the kind of company other sites link to.

## 8. The two things that would actually move this site

Neither is a code change, which is why they sit at the bottom of a technical
document.

1. **Links from elsewhere.** Google finds and weighs pages largely through
   links from pages it already trusts. This domain has almost none pointing at
   it. The honest sources available today: the two delivered client sites (a
   credit link, *with written permission*), a Kenyan business directory or two,
   the social profiles already in `sameAs`, and anywhere the founder writes or
   speaks. Bought links and link exchanges are against Google's spam policies
   and against how this company describes itself; do not.
2. **`/work/`, unblocked.** It is the page a prospect actually wants and the
   only page carrying evidence. It is empty because no client has been asked, in
   writing, whether we may name them — Charter 04 §V. One email each unblocks
   the strongest page on the site. It is Gate 2b in `docs/PRE-LAUNCH.md`.

## 9. Recurring, and rare

**Monthly**, in Search Console: Pages report for anything newly excluded,
Sitemaps for the last read date and any error, Performance for which queries
are actually arriving. Ten minutes.

**When page copy meaningfully changes:** bump `CONTENT_REVIEWED` in
`src/app/sitemap.ts`. It is a hand-set constant, not the build time, because
`lastmod` that changes on every deploy is `lastmod` Google stops trusting.

**When a page is added:** give it `alternates.canonical`, a title and a
description, add it to `sitemap.ts`, and check no page-level `robots` block
crept in with it.

**Never, without deciding it deliberately:** a page-level `noindex`, a change to
`robots.ts` alone, or a third-party script. The last one costs more than SEO —
`/privacy/` tells visitors their browser contacts nobody else while loading this
site, and that sentence is only true while it stays true.

## 10. Verifying, from a terminal

```bash
curl -s https://genmars.co.ke/robots.txt
curl -s https://genmars.co.ke/sitemap.xml | grep -c '<loc>'
curl -s https://genmars.co.ke/ | grep -o 'rel="canonical" href="[^"]*"'
curl -s https://genmars.co.ke/ | grep -o '"@type":"[A-Za-z]*"'
curl -s -o /dev/null -w '%{http_code}\n' https://genmars.co.ke/no-such-page/   # 404, not 200
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://genmars.co.ke/services
```

The fifth line is the one people forget. A missing page that answers `200` with
a friendly "not found" screen is a *soft 404*: Google indexes it as a real page.
`handle_errors` in `deploy/container.Caddyfile` is what makes it a true 404, and
it is worth re-checking after any change to that file.

---

## Related

- `docs/SEARCH-CONSOLE.md` — the property, verification, sitemap submission
- `docs/PRE-LAUNCH.md` — the gates, including 2b (permission to name work)
- `deploy/container.Caddyfile` — redirects, 404 handling, cache headers
- `internals-tm` → Settings → Engineering → Search visibility — the operator's view
