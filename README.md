# gen-website

The marketing website for **Genmars Tech Limited** — [genmars.co.ke](https://genmars.co.ke).

> **Not cleared to publish.** The site is built and working, but held behind
> three gates: the privacy policy and terms are still drafts (Charter 03 §IV
> Tier 1), `info@genmars.co.ke` is not yet confirmed live, and no client has
> given written permission to be named (Charter 04 §V). `robots.txt` disallows
> everything and the pages carry `noindex` until those close.
> See [`docs/PRE-LAUNCH.md`](docs/PRE-LAUNCH.md).

---

## Running it

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

> The `/work/` page currently renders its holding state. Set `permissionOnFile`
> to `true` for every entry in `src/lib/company.ts` — once permission genuinely
> exists — to see the project list.

| Command | Does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build → static export in `out/` |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint |
| `npm run check:theme` | Guards against brand constants used as themeable values |
| `npm run clean` | Removes `.next` and `out`. OneDrive occasionally turns `.next/cache` into a cloud placeholder and breaks the build — this clears it |
| `npm run docker:up` | Build and run the container on `127.0.0.1:3000` |
| `npm run docker:smoke` | Validate the Caddyfiles, then smoke-test the running container |
| `npm run docker:down` | Stop it |
| `npm run verify` | check:theme + typecheck + build. Run before pushing |

---

## Stack

Per **Charter 03 §I**, which sets the web frontend as **Next.js / TypeScript**.

- **Next.js 15**, App Router, `output: "export"` — a static site, no server
- **TypeScript**, strict
- **Plain CSS** with custom properties and CSS Modules

No CSS framework and no animation library, deliberately. Charter 03 §I: *"A new
technology enters the stack only when an existing tool genuinely cannot do the
job, and only with a written note explaining why. It is then supported forever,
or deliberately removed."* CSS does this job, so nothing was added.

The 3D hero is CSS 3D transforms rather than WebGL, for the same reason — see the
note at the top of `src/components/OrbitSystem.tsx`.

---

## Layout

```
src/
├── app/
│   ├── layout.tsx          Root layout, Jost via next/font, metadata
│   ├── page.tsx            Home
│   ├── services/           The four offers
│   ├── work/               Delivered client work — gated on written permission
│   ├── request/            Service request builder
│   ├── approach/           Stack, definition of done, security tiers, incidents
│   ├── contact/            How to reach us
│   ├── privacy/ terms/     Placeholders — see docs/PRE-LAUNCH.md
│   ├── robots.ts           Currently disallows everything, on purpose
│   └── sitemap.ts          Ready for launch day
├── components/
│   ├── Brand.tsx           Orbit G mark + wordmark with the barless A
│   ├── OrbitSystem.tsx     The 3D hero
│   ├── PlanetCore.tsx      The wireframe system running inside the planet
│   ├── CommandPalette.tsx  Cmd/Ctrl+K navigation
│   ├── LoadingMark.tsx     The Orbit G in motion — the loading animation
│   ├── RouteProgress.tsx   Navigation indicator (delayed, see below)
│   ├── routeProgressBus.ts Lets router.push raise the indicator
│   ├── RequestBuilder.tsx  Composes a mailto — nothing is submitted
│   ├── ThemeToggle.tsx     Light / auto / dark
│   ├── theme.ts            Theme helpers + the no-flash script
│   ├── Reveal.tsx          Scroll reveal
│   ├── SiteHeader.tsx      Sticky, condenses on scroll, mobile disclosure nav
│   └── SiteFooter.tsx
└── lib/
    └── company.ts          Every published fact, with its charter citation
```

### `src/lib/company.ts` is the contract

Every claim the site makes lives there, each one traceable to a company document
by a comment. **If you cannot cite a charter for it, it does not go on the site.**

That file also records what is deliberately *absent* and why — prices, response
times, team size, client names. Read the comments before adding anything back.

---

## The rules this site is built under

**Charter 04 §VI** sets the brief for this surface exactly:

> genmars.co.ke — what we do, proof, how to reach us. No fabricated depth.

**Charter 04 §IV**, the standing rule that governs every line of copy:

> Everything on a Genmars surface must be true today. Not aspirational, not
> "true once we sign the client." True today, and defensible if a prospect asks
> a follow-up question.

### What is deliberately not here

| Absent | Why |
|---|---|
| Prices | Still open. The Playbook's price bands are blank; the pricing floor is the founder's sole call (Charter 02 §I) |
| Response times, SLAs | Charter 03 §IV standing rule — never advertise a commitment not tested in practice. Tier 2 is not met |
| Team page | Charter 04 §IV forbids inventing one. Revisit at Stage 1 |
| Client logos, testimonials, metrics | Logos need written permission (Charter 04 §V). No metrics are published for any project — we do not have evidenced numbers |
| Stock photography | Charter 04 §IV |
| AuthGate or any product | Charter 04 §IV — never announce a product before it can be used |
| A submitting contact form | Would route personal data through a third-party processor with no processing agreement (Charter 03 §V). `/request/` composes a `mailto:` client-side instead — nothing leaves the browser |
| Client names on `/work/` | Charter 04 §V — credited only with **written permission**, not yet obtained. `workIsPublishable` gates the whole page |

Adding any of these back is a charter decision, not a design decision.

---

## Brand

Palette, type and mark come from `../06-brand/README.md`. The tokens are mirrored
into `src/app/globals.css` — change them there and nowhere else.

**The two rules that do not bend:** never re-space the wordmark below +300
tracking, and never bar the A. The wordmark is drawn as inline SVG split into
`GENM` + custom glyph + `RS` precisely so the A stays barless.

### Two kinds of colour token — get this right

This distinction caused a real bug: a section rendered as a light panel with
light text in dark mode. `npm run check:theme` now fails the build on it.

**Brand constants** never change between themes. `--deep-well`, `--mahogany`,
`--imperial-topaz`, `--wild-ginger`, `--ignition`, `--surface`, `--canvas`.
They exist to *define* the semantic tokens and belong only in `globals.css`.

**Semantic tokens** flip with the theme. Use these everywhere else:

| Token | For |
|---|---|
| `--bg` | Page ground |
| `--bg-raised` | Inset cards, callout panels |
| `--bg-band` | Full-width section bands — recessed in light, **lifted** in dark, so it stays distinct from both the page and the dark footer |
| `--ink` / `--ink-muted` / `--ink-faint` | Text |
| `--accent-text` | Accent on **small text**. Mahogany in light, Ignition in dark |
| `--accent` | Accent on rules, borders, marks — never small text |

### Contrast

Ignition `#DB7B51` is **2.64:1** on the light surface — it fails WCAG AA for body
text, which is why `--accent-text` exists and resolves to Mahogany in light. On
dark grounds Ignition reaches 4.61–5.44:1 and is safe for text, so `--accent-text`
becomes Ignition there.

Verified on the section band in both themes: heading 10.93 / 12.18, muted text
5.37 / 7.04, small accent 5.19 / 4.61, button 12.18 / 14.38. All pass AA.

---

## Features

| Feature | Notes |
|---|---|
| **Theme** | Light / auto / dark. "Auto" is a real option, not a fallback — a two-way toggle silently strands people who want to follow their OS. Inline no-flash script; `try/catch` around all storage access |
| **Command palette** | `Cmd`/`Ctrl`+`K`. Pages, services, theme, copy-email. Focus-trapped, Escape closes, trigger restored on close. Every destination is also a normal link |
| **Request builder** | `/request/` — four questions from the Playbook's qualification set, composing a `mailto:` live. Deep-linkable: `/request/?service=payments` |
| **3D hero** | CSS 3D orbital system, no WebGL. See `OrbitSystem.tsx` |
| **Planet core** | A wireframe globe with service nodes and traces running inside the body — `PlanetCore.tsx`. Deliberately wordless: see below |
| **Mobile nav** | Disclosure panel below 56rem with staggered items; locks page scroll, closes on route change and Escape |
| **Structured data** | `Organization` JSON-LD — only facts already on the page. No aggregate ratings, no invented founding date |
| **Loading animation** | The Orbit G with a light travelling its trajectory. Used for route changes and the email handoff |

### Why there is no terminal in the orb

The obvious way to show "software inside" is a small terminal with log lines
scrolling in it. Every plausible line is a claim — a transaction count, a
latency figure, a green "deploy succeeded" — and Charter 04 §IV forbids putting
anything on a Genmars surface that is not true today. Decorative fake telemetry
is exactly what a prospect would be right to ask a follow-up question about.

So the core is abstract: latitude lines, drifting meridians, pulsing service
nodes and traces between them. It shows structure and activity and asserts no
numbers. There is not a single `<text>` element inside the sphere, and a build
check confirms it.

If real metrics ever become publishable — with evidence — that is the moment to
revisit this, not before.

**How it works.** Parallels are static horizontal ellipses following the circle
(`rx = sqrt(r² − k²)`); on a rotating globe, latitude does not move. Meridians
and nodes sit in a group tiled twice and translated by exactly one tile width on
a loop, clipped to the sphere — a seamless cycle that reads as rotation at no 3D
cost. The core renders *under* the terminator, so the night side dims the
wireframe just as it dims the surface; that one detail is most of why it looks
like it is on a sphere rather than pasted over one.

---

### The loading indicator, and why you may rarely see it

`RouteProgress` does **not** appear on every navigation, on purpose.

This is a static export with prefetching, so most page changes resolve in a few
milliseconds. A loader that appears and vanishes in 30ms reads as a glitch, not
as feedback. Two thresholds prevent that:

| Constant | Value | Does |
|---|---|---|
| `SHOW_DELAY` | 140ms | Nothing appears before this. Fast navigations show nothing at all |
| `MIN_VISIBLE` | 420ms | Once shown, it stays this long, so it cannot flash off |
| `SAFETY_TIMEOUT` | 8s | Clears the indicator if a navigation somehow never resolves |

**To see it:** throttle the network in devtools (Slow 3G) and navigate. On a
fast connection it is correctly invisible.

The App Router has no global navigation-event API, so the indicator intercepts
link clicks and treats a `usePathname()` change as the resolution. It ignores
modified clicks, `target="_blank"`, downloads, `mailto:`/`tel:`, external
origins, and same-page hash jumps — all cases where no navigation resolves and
the indicator would otherwise hang. `router.push()` callers signal it explicitly
through `routeProgressBus`.

The `mailto:` handoff state is labelled "Opening your email app" rather than
shown as progress: there is no completion event for handing off to the OS, so
claiming to track it would be a small lie.

---

## Accessibility and motion

- Every animation is transform/opacity only, and all of it stops under
  `prefers-reduced-motion: reduce`
- `Reveal` renders content **visible by default** and only hides it once JS has
  confirmed it can show it again — nothing is ever stranded invisible
- Skip link, focus-visible outlines, semantic landmarks, `aria-current` on the
  active nav item, `aria-pressed` on chips, `role="radiogroup"` on the theme control
- Both themes were contrast-checked. Dark: ink 14.4:1, muted 8.3:1, Ignition
  5.4:1 on the base ground — all pass AA
- Print stylesheet strips chrome and expands link URLs

---

## Deployment

Static export served by Caddy in a container on **`127.0.0.1:3000`**, with a
second Caddy on the host terminating TLS and proxying inward. Charter 03 §I:
Docker Compose, Caddy, Hetzner.

```bash
npm run docker:up      # http://127.0.0.1:3000
npm run docker:smoke   # validate + assert routing, headers, posture
```

The runtime image contains **no Node and no application code** — only a web
server and a directory of files. A static site cannot have a runtime dependency
CVE, because it has no runtime dependencies.

Full notes, host setup, TLS, rollback and the CSP compromise:
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

---

## Licence

GPL-3.0-or-later. See [LICENSE](LICENSE).
