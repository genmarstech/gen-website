import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Sans, Jost } from "next/font/google";
import { company, contact, liveSocials } from "@/lib/company";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppChat } from "@/components/WhatsAppChat";
import { RouteProgress } from "@/components/RouteProgress";
import { NO_FLASH_SCRIPT } from "@/components/theme";
import "./globals.css";

/**
 * Jost, self-hosted at build time by next/font.
 *
 * Self-hosting matters beyond performance: no request leaves the visitor's
 * browser for a third-party font CDN, which keeps the privacy policy's claims
 * simple and true. Weights match the brand kit; 300 Light and 400 Regular carry
 * the wordmark and tagline.
 */
const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
  variable: "--font-jost",
});

/**
 * Three faces, and the split is a decision the company already made.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * JOST IS THE GENMARS VOICE. IT IS NOT THE PAGE'S VOICE.
 *
 * business-os reached this first and wrote down why: "Running the whole
 * product in it made the company and the product indistinguishable, which
 * served neither." This site had the same problem and had not had the same
 * fix — every word on it, from the wordmark to a caption, was Jost.
 *
 * So Jost now appears where Genmars speaks: the wordmark, eyebrows, and the
 * small uppercase labels. Everything else belongs to the two faces below.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ── FRAUNCES CARRIES THE HEADINGS, AND IT IS A CHOICE NOT A DEFAULT ───────
 *
 * A soft serif with real character — and variable, which is what earns it
 * here rather than merely decorating: `SOFT` rounds the terminals and `WONK`
 * swaps in the splayed, slightly odd letterforms at display sizes. Set at
 * optical size 48 for headings, the shapes are warm rather than corporate,
 * which is the same thing the mahogany-and-ignition palette is doing.
 *
 * It is also nothing like the faces an unconsidered site reaches for. That
 * matters for a software company whose whole pitch is that it does not ship
 * the generic thing.
 *
 * ── PLEX SANS TAKES EVERYTHING READ TO MAKE A DECISION ────────────────────
 *
 * Same reasoning business-os gives: its 1, l, I and 0, O are genuinely
 * distinct and a serif's are not at 12px. Prices, scopes and exclusions are
 * read to decide something, and this is the face that survives being read
 * quickly on a phone.
 *
 * Choosing the same text face as the product is deliberate. Somebody moving
 * from genmars.co.ke to the platform should feel one company, and the shared
 * face is most of how that happens.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  /*
   * No `weight`, deliberately — next/font refuses `axes` alongside a fixed
   * weight list, because asking for axes IS asking for the variable cut. So
   * the whole weight range ships and the headings vary along it, which is
   * also what makes 400 and 600 available without shipping two files.
   */
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(company.url),
  title: {
    default: `${company.formalName} — Production software for African businesses`,
    template: `%s — ${company.formalName}`,
  },
  description:
    "Genmars Tech builds custom software, mobile-money and payments integration, and the infrastructure to keep it running. Nairobi, Kenya.",
  applicationName: company.formalName,
  authors: [{ name: company.legalName }],
  openGraph: {
    type: "website",
    locale: "en_KE",
    siteName: company.formalName,
    url: company.url,
    title: `${company.formalName} — Production software for African businesses`,
    description:
      "Custom software, mobile-money and payments integration, and the infrastructure to keep it running. Nairobi, Kenya.",
    /**
     * Declared explicitly rather than via Next's `opengraph-image.png` file
     * convention. The convention emits og:image, :type, :width and :height —
     * but NOT og:image:alt from the adjacent .alt.txt, at least not in a static
     * export, which was checked in `out/` rather than assumed. Alt text is the
     * only part a screen-reader user of a social platform actually gets, so it
     * is worth the explicitness.
     *
     * `?v=` is the cache bust the file convention gave for free. Bump it when
     * the image changes, or Slack, WhatsApp and Twitter will serve the old one
     * for weeks.
     */
    images: [
      {
        url: "/og.png?v=2026-09-01",
        width: 1200,
        height: 630,
        alt: "Genmars Tech — production software, not prototypes. Nairobi, Kenya.",
        type: "image/png",
      },
    ],
  },
  /**
   * Twitter reads its own tags and falls back to Open Graph inconsistently.
   * `summary_large_image` is what turns a link into the 1200x630 card rather
   * than a thumbnail beside two lines of text. The image is the same
   * public/og.png declared above, named again here rather than left to fall
   * back to og:image — there is no src/app/twitter-image.png and no file
   * convention in play, whatever an older version of this comment claimed.
   */
  twitter: {
    card: "summary_large_image",
    title: `${company.formalName} — Production software for African businesses`,
    description:
      "Custom software, mobile-money and payments integration, and the infrastructure to keep it running. Nairobi, Kenya.",
    images: [
      {
        url: "/og.png?v=2026-09-01",
        alt: "Genmars Tech — production software, not prototypes. Nairobi, Kenya.",
      },
    ],
  },

  /**
   * Search Console verification.
   *
   * Empty unless NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION is set at BUILD time —
   * this is a static export, so there is no runtime to read it later. Next
   * omits the tag entirely when the value is undefined, which is correct: an
   * empty verification meta tag is worse than none, because Search Console
   * reports it as "found but wrong" rather than "not found".
   *
   * PREFER THE DNS METHOD. A TXT record on genmars.co.ke verifies a *domain
   * property*, which covers app., api. and ops. and both http and https in one
   * go — and it cannot be lost by a redeploy, which an HTML tag can. This is
   * here for the case where DNS is not available to whoever is verifying.
   * See docs/SEARCH-CONSOLE.md.
   */
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,

  robots: {
    /**
     * OPEN TO INDEXING SINCE 2026-09-05.
     *
     * This was `false, false` from the first deploy: Charter 03 §IV Tier 1
     * requires a published privacy policy and terms of service, and until that
     * date /terms/ was a page saying "this document is not yet published".
     * Both are now written, verified against the running system, and live.
     *
     * MUST STAY IN STEP WITH src/app/robots.ts. An allow in robots.txt with
     * noindex here means Google crawls all seven pages and indexes none, and
     * reports it as "Excluded by 'noindex' tag" — which reads like a bug and is
     * not one. Change both or neither.
     *
     * `googleBot` is set explicitly rather than inherited so the snippet and
     * preview limits are ours rather than a default that can move. -1 means "no
     * limit we are imposing", which is what you want for a seven-page site whose
     * whole job is to be read.
     */
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  /** Matches the two theme grounds so the browser chrome does not clash. */
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4efec" },
    { media: "(prefers-color-scheme: dark)", color: "#211e27" },
  ],
};

/**
 * Organization schema.
 *
 * Only facts already stated on the page — name, registration, location, contact.
 * No aggregate ratings, no invented founding date, no employee count. Charter 04
 * §IV applies to structured data exactly as it applies to visible copy; search
 * engines are a Genmars surface too.
 */
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: company.legalName,
  alternateName: company.formalName,
  url: company.url,
  slogan: company.tagline,
  // No `identifier`. The registration number is off the public site, and
  // publishing it as machine-readable metadata would put it back — in the
  // one form that gets scraped rather than read.
  description:
    "Custom software, mobile-money and payments integration, and infrastructure work for businesses in Kenya and East Africa.",
  address: {
    "@type": "PostalAddress",
    addressLocality: company.city,
    addressCountry: "KE",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    email: contact.email,
    areaServed: "KE",
    availableLanguage: ["en", "sw"],
  },
  /*
   * ── WHY sameAs MATTERS MORE THAN THE FOOTER LINKS DO ──────────────────────
   *
   * This is how a search engine decides that the Instagram account calling
   * itself Genmars and this domain are the same organisation. Without it they
   * are two unrelated things that happen to share a name — which is exactly
   * the gap somebody impersonating us would occupy.
   *
   * LIVE ACCOUNTS ONLY. An entry here asserting a profile that shows a login
   * wall is a claim in machine-readable form — Charter 04 §IV, and the form
   * that gets believed without being read.
   */
  sameAs: liveSocials.map((social) => social.url),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-KE"
      className={`${jost.variable} ${fraunces.variable} ${plexSans.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/*
          Runs before the first paint so a dark-theme visitor never sees a white
          flash. Inline and synchronous by necessity — a deferred script is a
          frame too late.
        */}
        <script
          dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }}
        />

        <a className="skip-link" href="#main">
          Skip to content
        </a>

        <RouteProgress />
        <SiteHeader />

        <main id="main" className="page">
          {children}
        </main>

        <SiteFooter />

        {/*
          After the footer in the DOM, fixed on the screen. A launcher placed
          earlier is a thing a screen reader meets before the page it belongs
          to, and a thing the keyboard reaches before the navigation.
        */}
        <WhatsAppChat />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </body>
    </html>
  );
}
