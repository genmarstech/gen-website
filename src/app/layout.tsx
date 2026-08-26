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
  },
  robots: {
    /**
     * The site is NOT cleared to publish: Charter 03 §IV Tier 1 requires a
     * privacy policy and terms of service, and both are still drafts awaiting
     * advocate review. Indexing stays off until docs/PRE-LAUNCH.md is complete.
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
