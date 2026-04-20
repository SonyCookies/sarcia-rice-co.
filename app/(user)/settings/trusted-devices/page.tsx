import type { Metadata } from "next";

import TrustedDevicesContent from "@/app/(user)/settings/trusted-devices/_components/trusted-devices-content";

export const metadata: Metadata = {
  title: "Trusted Devices | Sarcia Rice Co.",
  description:
    "Review trusted devices and session activity for your Sarcia Rice Co. account.",
};

export default function TrustedDevicesPage() {
  return <TrustedDevicesContent />;
}
