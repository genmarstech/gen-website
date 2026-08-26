import type { Metadata } from "next";
import { PolicyPlaceholder } from "@/components/PolicyPlaceholder";

export const metadata: Metadata = {
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
