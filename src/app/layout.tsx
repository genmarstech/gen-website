import type { Metadata, Viewport } from "next";
import { Jost } from "next/font/google";
import { company, contact, liveSocials } from "@/lib/company";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
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
   * than a thumbnail beside two lines of text; the image itself comes from
   * src/app/twitter-image.png via Next's file convention.
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
     * noindex here means Google crawls all nine pages and indexes none, and
     * reports it as "Excluded by 'noindex' tag" — which reads like a bug and is
     * not one. Change both or neither.
     *
     * `googleBot` is set explicitly rather than inherited so the snippet and
     * preview limits are ours rather than a default that can move. -1 means "no
     * limit we are imposing", which is what you want for a nine-page site whose
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
    <html lang="en-KE" className={jost.variable} suppressHydrationWarning>
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
