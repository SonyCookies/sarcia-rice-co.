import type { Metadata } from "next";

import ChangePasswordContent from "@/app/(user)/settings/change-password/_components/change-password-content";

export const metadata: Metadata = {
  title: "Change Password | Sarcia Rice Co.",
  description:
    "Update your Sarcia Rice Co. password from your authenticated account settings.",
};

export default function ChangePasswordPage() {
  return <ChangePasswordContent />;
}
