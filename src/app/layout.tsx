import type { Metadata, Viewport } from "next";
import { Jost } from "next/font/google";
import { company, contact } from "@/lib/company";
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
     * The site is NOT cleared to publish: Charter 03 §IV Tier 1 requires a
     * privacy policy and terms of service, and both are still drafts awaiting
     * advocate review. Indexing stays off until docs/PRE-LAUNCH.md is complete.
     *
     * ⚠ VERIFICATION DOES NOT NEED THIS OFF. A property can be verified, and a
     * sitemap submitted, while the site is noindex — Search Console will simply
     * report the pages as excluded. So this stays as it is until the gates in
     * docs/PRE-LAUNCH.md are actually met; flipping it is a launch decision,
     * not an SEO task. docs/SEARCH-CONSOLE.md has the exact two-line change.
     */
    index: false,
    follow: false,
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
  identifier: company.registrationNumber,
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
