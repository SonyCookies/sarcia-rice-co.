import type { Metadata } from "next";

import AdminTrustedDevicesContent from "@/app/admin/settings/trusted-devices/_components/trusted-devices-content";

export const metadata: Metadata = {
  title: "Admin Trusted Devices | Sarcia Rice Co.",
  description:
    "Review trusted devices and admin session activity for your Sarcia Rice Co. account.",
};

export default function AdminTrustedDevicesPage() {
  return <AdminTrustedDevicesContent />;
}
