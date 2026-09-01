import type { Metadata } from "next";
import { PolicyPlaceholder } from "@/components/PolicyPlaceholder";

export const metadata: Metadata = {
  /* Absolute canonical, resolved against metadataBase in layout.tsx.
     Without one, /terms and /terms/ and www. and non-www are four URLs
     for one page as far as a crawler is concerned. */
  alternates: { canonical: "/terms/" },
  title: "Terms of service",
  description: "Genmars Tech terms of service.",
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <PolicyPlaceholder
      title="Terms of service"
      documentLabel="The terms of service"
      source="05-policies/Genmars-Policy-Pack-v0.1.pdf — Document B"
    />
  );
}
