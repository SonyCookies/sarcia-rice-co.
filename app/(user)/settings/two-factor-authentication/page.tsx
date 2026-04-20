import type { Metadata } from "next";

import TwoFactorAuthenticationContent from "@/app/(user)/settings/two-factor-authentication/_components/two-factor-authentication-content";

export const metadata: Metadata = {
  title: "Two-Factor Authentication | Sarcia Rice Co.",
  description:
    "Manage two-factor authentication methods for your Sarcia Rice Co. account.",
};

export default function TwoFactorAuthenticationPage() {
  return <TwoFactorAuthenticationContent />;
}
