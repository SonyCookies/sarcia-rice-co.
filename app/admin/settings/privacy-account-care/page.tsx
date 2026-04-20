import type { Metadata } from "next";

import AdminPrivacyAccountCareContent from "@/app/admin/settings/privacy-account-care/_components/privacy-account-care-content";

export const metadata: Metadata = {
  title: "Admin Privacy & Account Care | Sarcia Rice Co.",
  description:
    "Understand how Sarcia Rice Co. handles admin profile, verification, and account-care information.",
};

export default function AdminPrivacyAccountCarePage() {
  return <AdminPrivacyAccountCareContent />;
}
