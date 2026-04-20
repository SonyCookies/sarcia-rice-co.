import type { Metadata } from "next";

import PrivacyAccountCareContent from "@/app/(user)/settings/privacy-account-care/_components/privacy-account-care-content";

export const metadata: Metadata = {
  title: "Privacy & Account Care | Sarcia Rice Co.",
  description:
    "Understand how Sarcia Rice Co. handles your profile, order, delivery, and verification information.",
};

export default function PrivacyAccountCarePage() {
  return <PrivacyAccountCareContent />;
}
