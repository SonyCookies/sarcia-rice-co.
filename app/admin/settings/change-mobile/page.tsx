import type { Metadata } from "next";

import AdminChangeMobileContent from "@/app/admin/settings/change-mobile/_components/change-mobile-content";

export const metadata: Metadata = {
  title: "Admin Change Mobile Number | Sarcia Rice Co.",
  description:
    "Update your Sarcia Rice Co. admin mobile number and re-verify it for OTP and fallback recovery.",
};

export default function AdminChangeMobilePage() {
  return <AdminChangeMobileContent />;
}
