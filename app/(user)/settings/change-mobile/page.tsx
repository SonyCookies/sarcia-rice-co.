import type { Metadata } from "next";

import ChangeMobileContent from "@/app/(user)/settings/change-mobile/_components/change-mobile-content";

export const metadata: Metadata = {
  title: "Change Mobile Number | Sarcia Rice Co.",
  description:
    "Update your Sarcia Rice Co. mobile number and re-verify it for OTP and delivery notifications.",
};

export default function ChangeMobilePage() {
  return <ChangeMobileContent />;
}
