import type { Metadata } from "next";

import AdminTwoFactorAuthenticationContent from "@/app/admin/settings/two-factor-authentication/_components/two-factor-authentication-content";

export const metadata: Metadata = {
  title: "Admin Two-Factor Authentication | Sarcia Rice Co.",
  description:
    "Manage two-factor authentication methods for your Sarcia Rice Co. admin account.",
};

export default function AdminTwoFactorAuthenticationPage() {
  return <AdminTwoFactorAuthenticationContent />;
}
