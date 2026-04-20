import type { Metadata } from "next";

import AdminChangeEmailContent from "@/app/admin/settings/change-email/_components/change-email-content";

export const metadata: Metadata = {
  title: "Admin Change Email | Sarcia Rice Co.",
  description:
    "Update your Sarcia Rice Co. admin email address and re-verify it for recovery and two-factor security.",
};

export default function AdminChangeEmailPage() {
  return <AdminChangeEmailContent />;
}
