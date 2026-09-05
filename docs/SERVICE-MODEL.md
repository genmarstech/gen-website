# Service model v2.0 — reconciling it with what already ships

Two internal documents were added on **2026-09-04**: the Service System Model
v2.0 and the Product, Infrastructure & Portfolio Strategy v2.0. Both are marked
confidential and stay in the company folder.

**This repository is public.** What follows is only the client-facing structure
and the decisions it forces. Pricing rules, qualification criteria, revenue
design, guardrails and capacity constraints are deliberately excluded and must
not be added.

> This is **not** a from-scratch specification. The site already implements a
> full tiered service catalogue, built from an earlier model. What v2.0 changes
> is narrower than it first appears, and two of the changes are conflicts that
> need a decision rather than a patch.

---

## 1. What ships today

`src/lib/company.ts` → `offers`, nine entries: seven `available: "now"`, two
`"building"`.

| Offer | State |
|---|---|
| Implementation & configuration | now |
| Integrations & custom development | now |
| Application managed services | now |
| Genmars SecureCare | now |
| Digital transformation advisory | now |
| ComplianceReady | now |
| Product training | now |
| Genmars Business Platform | building |
| Industry solutions | building |

Each carries three tiers with published *from* prices and an `open: true` top
tier with no ceiling, plus `pricingNote` explaining that the real number follows
discovery.

---

## 2. Two taxonomies, and they are not the same thing

v2.0 §02 defines **nine divisions**. The site has **nine offers**. The
coincidence is misleading — they are different axes:

| | Divisions (v2.0) | Offers (shipping) |
|---|---|---|
| Answers | *What can Genmars do?* | *What can I buy?* |
| Example | API & Integration | Integrations & custom development |
| Example | Support & Maintenance | Application managed services · SecureCare |
| Example | Software Development | Implementation & configuration · Industry solutions |

The nine divisions are:

| Division | Outcome |
|---|---|
| Software Development | Production business software |
| SaaS Development | Commercial software products |
| Mobile Development | Customer or operational mobile apps |
| Business Automation | Reduced manual operations |
| API & Integration | Connected business systems |
| Cloud & Infrastructure | Reliable production infrastructure |
| Data & Analytics | Operational intelligence |
| AI Engineering | Automated or intelligent workflows |
| Support & Maintenance | Ongoing system reliability |

**Recommendation: keep the offers as the purchasable surface and do not
restructure the site around divisions.** v2.0's own focus discipline says a
nine-division menu reads as a company that specialises in nothing. Divisions are
useful as a capability vocabulary — for proposals, for the Work page's
"capabilities demonstrated", and for deciding which work to take — not as a
navigation structure.

If divisions are added to `company.ts` at all, add them as a separate export
alongside `offers`, never as a replacement.

---

## 3. Tier names — DECIDED 2026-09-05: keep the shipping names

**Decision: option 1. The published per-offer names stand, and v2.0 §03 is
amended to match rather than departed from silently — which is what the
document itself asks for.**

Nothing on the site, in the portal, or in any proposal already sent changes.
`Foundation / Growth / Scale` does not appear in client-facing copy.

The record of what was weighed is kept below, because a decision without its
reasoning gets re-litigated by whoever reads the two documents next and notices
they disagree.

| | Names |
|---|---|
| v2.0 §03 | **Foundation · Growth · Scale** |
| Shipping | `Essential Setup · Business Setup · Enterprise Setup`, `Basic · Advanced · Enterprise`, `Care · Business Care · Enterprise Care`, … |

The site's names vary per offer and are already published with prices attached.
The portal copies these tier prices (see the portal's `ServiceTier`), so a
rename is not a one-file change — it touches published pricing, the portal's
data, and any proposal already sent.

Three options, in the order they were considered:

1. **Keep the shipping names.** ← chosen They are live, priced, and per-offer names read
   better on a card than one abstract triple. Amend v2.0 to match — the document
   says explicitly that it should be amended in writing rather than departed
   from silently.
2. **Adopt Foundation/Growth/Scale as an internal classification only**, kept out
   of client-facing copy. Costs nothing, gains a shared vocabulary.
3. **Rename everything.** Only worth it if the published names are actually
   causing confusion. They do not appear to be.

Until this is settled, **do not half-apply it** — a site with `Foundation` on
one card and `Essential Setup` on the next is worse than either alone.

What v2.0 *does* settle, and is worth adopting regardless, is the four
dimensions that legitimately separate tiers. Anything else is inflation:

| Dimension | Lower | Middle | Upper |
|---|---|---|---|
| Problem scope | One workflow | A connected set | A system others depend on |
| Integrations | Minimal or none | A defined set | Multiple, including failure-prone external ones |
| Environments | Production | Staging and production | Full separation, rehearsed rollback |
| Support | Defined window | Monitoring and priority handling | Proactive monitoring, reserved capacity |

---

## 4. Genuinely new — anchor and attachments

Not currently expressed anywhere on the site, and worth adding because it is the
honest description of what a proposal contains. Engagements are sold as **one
anchor with attached scope**, never as a menu the client assembles.

| Anchor | Natural attachments |
|---|---|
| Custom business system | Integration work, infrastructure and deployment, support plan |
| Payment / M-Pesa integration | Reconciliation, reporting, monitoring, support plan |
| SaaS platform | Multi-tenancy, billing, infrastructure, ongoing retainer |
| Automation project | Integration work, dashboards, support plan |

The site already implies this — every offer's `note` mentions what falls outside
scope — but never names the shape.

---

## 5. Genuinely new — the Work page is now governed

`work` currently holds two items (Avinterra, Clips Serenity Spa), both with
`permissionOnFile: false`, so `workIsPublishable` is `false` and the section is
hidden. That remains correct and is now backed by a second document.

When permission does arrive, v2.0 §08/§10/§11 govern what goes up.

### Every item carries a label

| If the system is… | Label |
|---|---|
| Owned and operated by Genmars | **Genmars product** |
| Built for internal use | **Internal system** |
| Designed but not deployed | **Concept** — architecture and design only |
| A technical experiment | **R&D project** |
| Delivered for a client | **Client system, published with consent** |

`WorkItem` has no `label` field. Add one, required, before anything is
published — a default would defeat the purpose.

### The six-part case study

1. **Problem** — concrete enough that a reader recognises it
2. **Solution** — what was built, and the approach chosen over the obvious one
3. **Architecture** — components, data flow, technologies, *with the reasoning*
4. **Capabilities** — the workflows that actually matter
5. **Engineering** — reliability, security, scalability, integration. Usually the most persuasive part
6. **Results** — measurable outcomes **only where real data exists**; omitted otherwise rather than filled with adjectives

`WorkItem` today has `summary`, `detail` and `capabilities` — roughly parts 1, 2
and 4. Parts 3, 5 and 6 have no home.

> If the write-up would still interest an engineer with the screenshots removed,
> it is a case study. If not, it is a gallery.

### Categories

A menu to choose from, not a build list — three well-documented systems beat six
shallow ones.

Fintech · Logistics · Commerce · Healthcare · Education · Data

Pick the ones closest to the work Genmars actually wants, and leave the rest off
the page rather than represented weakly.

---

## 6. Already true — the honesty standard

v2.0 §11 restates what Charter 04 §IV already enforces through `company.ts`.
Never stated on this site:

- Client names or logos without written permission
- User, transaction or uptime figures that were not measured
- Revenue, funding or growth claims of any kind
- Team size, or capability implied to be larger than it is
- A concept described in language that implies it is in production

Where a metric does not exist, **replace it with technical specificity** — the
architecture, the failure handling, the trade-off and why. Specificity convinces
more than a number a reader cannot verify.

No response-time commitment appears anywhere, and none may be added: Charter 03
§IV and v2.0 §10 agree that response windows are set against the worst week, not
the best.

---

## 7. What to do

| # | Action | Blocked on |
|---|---|---|
| 1 | Decide the tier-name question (§3) | **Done** — 2026-09-05, keep shipping names |
| 2 | Add the four tier dimensions | **Done** — `tierDimensions`, on `/services/` |
| 3 | Add anchor/attachment language to `/services/` | **Done** — `anchors` |
| 4 | Add a required `label` to `WorkItem` | **Done** — `WorkLabel`, no default |
| 5 | Extend `WorkItem` for architecture / engineering / results | **Done** — all three optional |
| 6 | Add divisions as a capability vocabulary, not navigation | **Done** — `divisions`, not rendered as nav |

All six are implemented. The dimensions table uses **Lower / Middle / Upper**
rather than any tier names, so it describes the ladder without asserting a
naming scheme the cards above it do not use. Keep `company.ts` the single source of
truth with a citation on every value — that rule is what has kept invented
claims off this site.

**Related:** `docs/PORTAL-INTEGRATION.md` · `gen-portal/docs/SERVICE-MODEL.md`
