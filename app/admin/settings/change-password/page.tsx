import type { Metadata } from "next";

import AdminChangePasswordContent from "@/app/admin/settings/change-password/_components/change-password-content";

export const metadata: Metadata = {
  title: "Admin Change Password | Sarcia Rice Co.",
  description:
    "Update your Sarcia Rice Co. admin password from the dedicated authenticated security page.",
};

export default function AdminChangePasswordPage() {
  return <AdminChangePasswordContent />;
}
