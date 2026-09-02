/**
 * Company facts — single source of truth for the site.
 *
 * STANDING RULE (Charter 04 §IV): everything on a Genmars surface must be true
 * TODAY. Not aspirational, not "true once we sign the client." True today, and
 * defensible if a prospect asks a follow-up question.
 *
 * Every value here is traceable to a company document in ../../.. — the charter
 * reference is in the comment. If you cannot cite one, it does not belong on the
 * site. Values marked TODO are unresolved and must be settled before launch;
 * see docs/PRE-LAUNCH.md.
 */

export const company = {
  /** Charter 04 §I — name by context. */
  legalName: "Genmars Tech Limited",
  formalName: "Genmars Tech",
  shortName: "Genmars",

  /** Registration on every document cover page. */
  registrationNumber: "BN-93S95J2J",

  /** Charter 04 §I — primary domain. */
  domain: "genmars.co.ke",
  url: "https://genmars.co.ke",

  /** Charter 01 §VII — Stage 0, remote, Nairobi-based. */
  city: "Nairobi",
  country: "Kenya",

  /** Brand tagline — 06-brand/README.md. */
  tagline: "Next-generation software",
} as const;

/**
 * Contact details.
 *
 * Charter 04 §VI: "firstname@genmars.co.ke. No free-mail addresses on company
 * correspondence." info@ is the published general inbox so the site does not
 * depend on one person's mailbox; see ../../../09-communication/README.md for
 * the full address scheme and who monitors each one.
 *
 * TODO(pre-launch): confirm info@ exists and is monitored. A contact address on
 * a live site that bounces is worse than no address at all.
 */
export const contact = {
  email: "info@genmars.co.ke",
  founderEmail: "edwin@genmars.co.ke",
  /** Vulnerability reports — see 09-communication/README.md. */
  securityEmail: "security@genmars.co.ke",
  /** Data protection enquiries under the Kenyan DPA (Charter 03 §V). */
  privacyEmail: "privacy@genmars.co.ke",

  /**
   * TODO(pre-launch): decide whether a phone number is published at all.
   * Publishing one creates an expectation of answering it. Charter 03 §IV Tier 2
   * requires a support channel with a *stated response time* — we do not have
   * one yet, so no response time is claimed anywhere on this site.
   */
  phone: null as string | null,
} as const;

/** Charter 01 §I — the two engines. */
export const engines = [
  {
    name: "Services",
    summary:
      "Custom software, mobile-money and payments integration, and infrastructure work, delivered to paying clients.",
    role: "This engine funds the company. It is not a side business; it is the balance sheet.",
  },
  {
    name: "Products",
    summary:
      "Genmars-owned software built for specific East African verticals.",
    role: "This engine compounds. It is where enterprise value accumulates over time.",
  },
] as const;

/**
 * Charter 01 §III / §IV — what the company is, and what it is not.
 * The negative list is deliberate. Charter 04 §III: admit limits early, it is
 * the cheapest credibility available.
 */
export const positioning = {
  is: [
    {
      claim: "A software company, not an agency",
      detail:
        "We own our architecture decisions, and our reputation rests on systems that stay up.",
    },
    {
      claim: "Infrastructure-serious",
      detail:
        "We deploy, monitor, and maintain what we build. Handing over a repository is not delivery.",
    },
    {
      claim: "Local-first, not local-limited",
      detail:
        "We build for Kenyan market realities — mobile money, intermittent connectivity, real price sensitivity — because that constraint produces better software, not lesser software.",
    },
    {
      claim: "Long-dated",
      detail:
        "Every decision is made as if we will still be maintaining the result in five years, because we intend to be.",
    },
  ],
  isNot: [
    "A body shop — we do not sell developer-hours by the seat",
    "A reseller of someone else's platform under our logo",
    "A company that ships things it would not run itself",
    "A chaser of every vertical",
  ],
} as const;

/**
 * Charter 02 — the company's shape.
 *
 * NOT PUBLISHED ON THE SITE. Founder's decision (Charter 02 §I — public
 * statements, brand and website are the founder's sole call): the headcount is
 * kept internal for now. Nothing on any page states or implies team size.
 *
 * Kept here because it still governs what we can honestly take on, and because
 * the decision to publish it may be revisited at Stage 1.
 */
export const team = {
  headcount: 3,
  shape: "one delivery engineer and two commercial partners",
  /**
   * No team page. Charter 04 §IV forbids inventing one, and we do not publish
   * colleagues' names and photographs without their agreement. Revisit at
   * Stage 1 (Charter 01 §VII) when there are engineers to introduce.
   */
  hasTeamPage: false,
} as const;

/**
 * Charter 03 §I — the stack. Listed publicly because it is genuinely what we
 * run; Charter 04 §IV forbids claiming technology we do not run in production.
 */
export const stack = [
  { layer: "Backend", standard: "Django / Django REST Framework" },
  { layer: "Performance-critical services", standard: "Rust / Axum" },
  { layer: "Web frontend", standard: "Next.js / TypeScript" },
  { layer: "Mobile", standard: "Flutter" },
  { layer: "Database", standard: "PostgreSQL" },
  { layer: "Cache & queue", standard: "Redis, Celery" },
  { layer: "Runtime & deploy", standard: "Docker Compose, Caddy, Hetzner" },
  { layer: "CI/CD & registry", standard: "GitHub Actions, GHCR" },
] as const;

/** Charter 03 §II — definition of done. Partially done is not done. */
export const definitionOfDone = [
  "It works against realistic data, not the happy path only",
  "Automated tests cover the critical paths, and they pass in CI",
  "It is deployed to the target environment, not just to a branch",
  "Errors surface in monitoring rather than in a client phone call",
  "The deploy and rollback procedure is written down",
  "The client can perform the task the feature was built for, unaided",
] as const;

/** Charter 03 §IV — security baseline. Each tier is a gate, not a wish list. */
export const securityTiers = [
  {
    tier: "Tier 1",
    when: "Before any client system goes live",
    items: [
      "Secure authentication and authorisation, with least-privilege roles",
      "TLS everywhere; no plaintext transport, internal or external",
      "Automated backups with a tested restore — an untested backup is not a backup",
      "Error monitoring and alerting that reaches a human",
      "Documented development and deployment process",
      "Privacy policy and terms of service published",
    ],
  },
  {
    tier: "Tier 2",
    when: "Within 90 days of the first paying user",
    items: [
      "Support channel with a stated response time",
      "Personal data encrypted at rest; payment credentials never stored by us",
      "Access control reviewed and reduced to least privilege",
      "Written incident response runbook, with who is called and in what order",
      "Audit logging on sensitive actions",
    ],
  },
  {
    tier: "Tier 3",
    when: "Before making enterprise claims",
    items: [
      "Service-level commitments with defined credits",
      "Disaster recovery with a stated recovery time and recovery point objective",
      "Scheduled security reviews and dependency audits",
      "Data-controller registration and a documented data-processing basis",
    ],
  },
] as const;

/**
 * The service catalogue — Technical Team Service & Pricing Model, §15.
 *
 * ── THIS REPLACED FOUR HAND-WRITTEN "OFFERS" ────────────────────────────────
 *
 * The old list described a custom software agency. The pricing model opens by
 * rejecting that outright: "Genmars should operate as a product company with a
 * services layer — not as a general-purpose custom software agency." So the
 * catalogue is now the real portfolio, in the model's own words and numbers.
 *
 * ── WHY THERE ARE PRICES HERE NOW ───────────────────────────────────────────
 *
 * This file used to say, in capitals, that there were no prices — the bands
 * were an open decision and publishing one would have boxed in a floor that is
 * the founder's sole call (Charter 02 §I). That decision has since been made.
 * §14 of the pricing model settles it: "Website: show simple 'from' pricing and
 * package positioning." Detailed tier matrices, add-ons and discounts stay with
 * sales; the site shows the entry point and says it is an entry point.
 *
 * ── `available` IS LOAD-BEARING, NOT DECORATION ─────────────────────────────
 *
 * Charter 04 §IV: nothing untrue on a Genmars surface. The Business Platform
 * and the vertical solutions are the target model — §16 lists multi-tenant
 * architecture, subscription billing and modular features as things the team
 * must still BUILD. A live price table for them would read as "subscribe
 * today" for something nobody can subscribe to.
 *
 * So each entry declares whether it can be bought now. "building" entries are
 * rendered apart, labelled, and route to a conversation rather than a signup.
 * If that ever stops being true, change the flag — do not change the label.
 */
export type Availability = "now" | "building";

export const offers = [
  /* ── available now: the services layer ──────────────────────────────────── */
  {
    slug: "implementation",
    name: "Implementation & configuration",
    available: "now",
    /* "From" pricing per §14. The number is the floor of the Essential Setup
       tier, and the copy never implies it is the whole price. */
    from: "KES 25,000",
    unit: "one-time",
    lead: "Setup, configuration, data migration and go-live, as a fixed-price project.",
    body: "Three sizes: Essential for a straightforward single-location setup, Business where there is real data to migrate and workflows to configure, Enterprise where it spans locations and systems. Every one begins with discovery and ends with a documented go-live.",
    forYouIf: "You have bought software before and watched it never quite get switched on.",
    /* §5 of the model, stated publicly because it is the clause that protects
       both sides. It is the same promise Charter 05 §I already makes. */
    note: "Anything outside the signed implementation scope becomes a change request or a separate engagement. We would rather write that down than discover it in month three.",
  },
  {
    slug: "custom-development",
    name: "Integrations & custom development",
    available: "now",
    from: "KES 50,000",
    unit: "starting",
    lead: "Paid engineering for the things the standard product does not do.",
    body: "One low-complexity integration at the basic tier; multiple integrations with custom interfaces and reporting above that; large workflows, portals and high-assurance work at the top. Discovery is separated from implementation on anything substantial.",
    forYouIf: "Your systems do not talk to each other and someone is the integration.",
    note: "We do not promise feasibility or a delivery date before technical review. A date given before anyone has looked is not a commitment, it is a guess with a deadline attached.",
  },
  {
    slug: "managed-services",
    name: "Application managed services",
    available: "now",
    from: "KES 10,000",
    unit: "per month",
    lead: "Monitoring, backups, patching and support for systems already running.",
    body: "Care covers monitoring, daily backups, updates and business-hours support. Business Care adds extended support, performance work, a monthly report and a named contact. Enterprise Care adds a 24/7 option and a custom SLA.",
    forYouIf: "Something important is in production and nobody is watching it.",
    note: "Hosting and infrastructure are bounded or billed separately. An unlimited resource commitment inside a fixed monthly fee is a promise that gets quietly broken.",
  },
  {
    slug: "securecare",
    name: "Genmars SecureCare",
    available: "now",
    from: "KES 15,000",
    unit: "per month",
    lead: "Security and data-protection readiness: assessments, access reviews, MFA guidance and incident support.",
    body: "Quarterly assessment and reporting at the basic tier, monthly at Business with incident support, continuous at Plus with executive reporting.",
    forYouIf: "You have been asked how you protect client data and did not enjoy answering.",
    /* The model is explicit: "not a blanket legal compliance guarantee."
       Charter 04 §IV — this is the difference between a service and a claim. */
    note: "This is security and data-protection readiness with technical support. It is not a blanket guarantee of legal compliance, and we will not describe it as one.",
  },
  {
    slug: "advisory",
    name: "Digital transformation advisory",
    available: "now",
    from: "KES 35,000",
    unit: "starting",
    lead: "Assessment, process mapping and a costed roadmap you own either way.",
    body: "An assessment produces a business, process and technology review with a basic roadmap. A transformation plan adds process mapping and a twelve-month roadmap with budget. Strategic advisory runs to twenty-four months with vendor evaluation and workshops.",
    forYouIf: "You have been asked for a budget figure and have no defensible way to produce one.",
    note: "You own the output. If you take the roadmap to another firm it still works — that is what makes it worth paying for rather than a sales exercise.",
  },
  {
    slug: "complianceready",
    name: "ComplianceReady",
    available: "now",
    from: "KES 35,000",
    unit: "starting",
    lead: "Data mapping, gap analysis, policy templates and controls review.",
    body: "A compliance check gives an initial assessment and gap analysis. Compliance Ready adds data mapping, policy templates and a roadmap. A compliance programme adds staff awareness and implementation support.",
    forYouIf: "You hold personal data and have never written down where it lives.",
    /* Again the model's own framing, and again Charter 04 §IV. We are not
       lawyers and the site must not let anyone infer that we are. */
    note: "This is readiness and support work. Formal legal advice is coordinated with qualified legal professionals — we do not provide it ourselves.",
  },
  {
    slug: "training",
    name: "Product training",
    available: "now",
    from: "KES 15,000",
    unit: "per session",
    lead: "Enablement for the people who actually have to use the thing.",
    body: "A single two-hour session for up to ten people, three longer sessions with recordings, admin training and certification, or a custom curriculum built around your own configuration.",
    forYouIf: "The software is fine and nobody is using it properly.",
  },

  /* ── in development ─────────────────────────────────────────────────────────
     Shown because they are what the company is for, and priced because §14 says
     to. Marked `building` because nobody can buy one today, and a page that let
     someone believe otherwise would breach Charter 04 §IV. */
  {
    slug: "business-platform",
    name: "Genmars Business Platform",
    available: "building",
    from: "KES 3,500",
    unit: "per month",
    lead: "A reusable core platform for SMEs — reports, inventory, permissions and integrations.",
    body: "Starter covers up to five users with the core modules and basic reporting. Business adds advanced reports and permissions, limited custom workflows and one integration. Enterprise adds custom workflows, multiple integrations, a dedicated environment and a custom SLA.",
    forYouIf: "You are running a growing operation on spreadsheets and goodwill.",
  },
  {
    slug: "industry-solutions",
    name: "Industry solutions",
    available: "building",
    from: "KES 5,000",
    unit: "per month",
    lead: "The same platform, configured for a sector: schools, clinics, retail, logistics, professional services.",
    body: "Sector modules and reporting at the essential tier; advanced workflows and portals or payments where they apply at professional; custom workflows, integrations and a dedicated environment at enterprise.",
    forYouIf: "Every vendor who has pitched you sells the same generic system with your industry's logo on it.",
  },
] as const;

/**
 * What the `from` prices mean, said once and shown wherever they are.
 *
 * §14 and the model's closing note both require this: pricing is indicative,
 * enterprise tiers deliberately have no public ceiling, and a final number
 * follows technical discovery. Charter 04 §IV means the caveat travels with
 * the number rather than living in a footer nobody reads.
 */
export const pricingNote =
  "Starting prices, in Kenyan shillings. What you actually pay depends on scope, and we quote it after discovery rather than before — enterprise tiers deliberately have no published ceiling.";


/** Charter 01 §V — founding principles worth stating publicly. */
export const principles = [
  {
    title: "Production or nothing",
    detail: "Work is not real until it serves real users under real load.",
  },
  {
    title: "Your outcome outranks our elegant solution",
    detail:
      "We optimise for what makes you money, not for what makes us feel clever.",
  },
  {
    title: "Own the stack we choose",
    detail: "Deep in a small number of tools beats shallow in many.",
  },
  {
    title: "Nothing ships without a named owner",
    detail: "If nobody's name is on it, it does not get built.",
  },
  {
    title: "Reputation is the only durable asset",
    detail:
      "One badly maintained deployment costs more than five signed contracts.",
  },
  {
    title: "Write it down",
    detail:
      "Agreements, decisions, incidents, and architecture. An undocumented company cannot be handed to anyone.",
  },
] as const;

/**
 * Charter 03 §VI — incident handling.
 *
 * DELIBERATELY OMITS RESPONSE TIMES. The charter sets them internally (SEV-1:
 * client informed within 1 hour; SEV-2: same business day; SEV-3: next release
 * cycle), but they are NOT published here.
 *
 * Two reasons, both binding:
 *   1. Charter 03 §IV STANDING RULE — "Never put a service-level commitment in
 *      a proposal that has not been tested in practice. A missed SLA on paper is
 *      worse than no SLA at all." Nothing here has been tested against a live
 *      client system, because there is not one yet.
 *   2. A stated response time is a Tier 2 gate (within 90 days of the first
 *      paying user). Tier 2 is not met.
 *
 * What is published is the *practice* — severity classification and blameless
 * post-mortems — which is true today. Response times move onto the site when
 * Tier 2 is genuinely met, and not before. See docs/PRE-LAUNCH.md.
 */
export const incidentPractice = {
  severities: [
    { severity: "SEV-1", definition: "System down, or data at risk" },
    { severity: "SEV-2", definition: "Major function broken, workaround exists" },
    { severity: "SEV-3", definition: "Minor defect, cosmetic issue" },
  ],
  postMortem:
    "Every SEV-1 produces a written post-mortem: what happened, why, and what prevents recurrence. Post-mortems are blameless, and they are kept permanently.",
} as const;


/**
 * Delivered work.
 *
 * ⚠ PERMISSION GATE — Charter 04 §V: "Client-owned software carries the
 * client's brand; Genmars is credited only with WRITTEN PERMISSION." §IV adds:
 * never "list client logos we do not have written permission to display."
 *
 * Every entry below needs written permission from that client before this page
 * is published. `permissionOnFile: false` means exactly that — not yet obtained.
 * docs/PRE-LAUNCH.md blocks launch on it. Set the flag only when the permission
 * genuinely exists, in writing, and can be produced if challenged.
 *
 * Descriptions state what the live site observably does. No invented metrics,
 * no "increased conversions by X%", no claims about the client's business
 * results that we cannot evidence. Charter 04 §III — specific over impressive.
 */
export type WorkItem = {
  slug: string;
  client: string;
  url: string;
  domain: string;
  sector: string;
  year: string;
  summary: string;
  detail: string;
  capabilities: readonly string[];
  permissionOnFile: boolean;
};

export const work: readonly WorkItem[] = [
  {
    slug: "avinterra",
    client: "Avinterra Expeditions",
    url: "https://avinterra.tours",
    domain: "avinterra.tours",
    sector: "Travel & tourism",
    year: "2026",
    summary:
      "A booking and enquiry site for a Kenyan travel house running guided safaris, coastal trips and international departures.",
    detail:
      "Trip packages with duration, location and dual-currency pricing; an interactive departure map across eight-plus regions; instalment payment options; and M-Pesa paybill details alongside WhatsApp enquiry routing, which is how this market actually books.",
    capabilities: [
      "Multi-currency pricing",
      "Interactive map",
      "M-Pesa paybill",
      "WhatsApp enquiry routing",
    ],
    permissionOnFile: false,
  },
  {
    slug: "clips-serenity-spa",
    client: "Clips Serenity Spa",
    url: "https://clipsserenityspa.co.ke",
    domain: "clipsserenityspa.co.ke",
    sector: "Health & wellness",
    year: "2026",
    summary:
      "An online booking system for a Nairobi hair, beauty and wellness spa open seven days a week.",
    detail:
      "Appointment reservation with therapist selection and confirmation, a published service menu with transparent pricing, staff profiles, embedded maps for a physical location, and M-Pesa, card and cash payment paths. Walk-ins still work; the booking flow exists to guarantee a slot.",
    capabilities: [
      "Appointment booking",
      "Therapist selection",
      "M-Pesa & card payments",
      "Maps integration",
    ],
    permissionOnFile: false,
  },
] as const;

/**
 * Is the work section safe to publish?
 *
 * Every item must have written permission. One missing permission hides the
 * whole section rather than publishing a partial list that implies the rest.
 */
export const workIsPublishable = work.every((w) => w.permissionOnFile);

export const nav = [
  { href: "/services/", label: "Services" },
  { href: "/work/", label: "Work" },
  { href: "/approach/", label: "Approach" },
  { href: "/contact/", label: "Contact" },
] as const;
