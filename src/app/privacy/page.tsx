import type { Metadata } from "next";
import { PolicyPlaceholder } from "@/components/PolicyPlaceholder";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "Genmars Tech privacy policy.",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <PolicyPlaceholder
      title="Privacy policy"
      documentLabel="The privacy policy"
      source="05-policies/Genmars-Policy-Pack-v0.1.pdf — Document A"
    />
  );
}
