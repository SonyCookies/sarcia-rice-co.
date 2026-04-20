import type { Metadata } from "next";

import ChangeEmailContent from "@/app/(user)/settings/change-email/_components/change-email-content";

export const metadata: Metadata = {
  title: "Change Email | Sarcia Rice Co.",
  description:
    "Update your Sarcia Rice Co. email address and re-verify it for recovery and two-factor security.",
};

export default function ChangeEmailPage() {
  return <ChangeEmailContent />;
}
