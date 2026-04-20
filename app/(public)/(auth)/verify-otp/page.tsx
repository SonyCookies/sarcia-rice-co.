import { Suspense } from "react";
import type { Metadata } from "next";

import VerifyOtpCard from "@/app/(public)/(auth)/register/verify-otp/_components/verify-otp-card";

export const metadata: Metadata = {
  title: "Verify Account",
  description: "Enter the 6-digit OTP to verify your Sarcia Rice Co. account.",
};

export default function VerifyOtpPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8f6ea_0%,#eef0dd_48%,#dde3c2_100%)] px-4 py-6 md:px-6 md:py-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5c-1.5 5-4 9-8 12s-8 4-13 5c5 1 9 4 12 8s4 8 5 13c1-5 4-9 8-12s8-4 13-5c-5-1-9-4-12-8s-4-8-5-13z' fill='%234d6b35' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--color-rich-gold)_14%,transparent),transparent_28%),radial-gradient(circle_at_bottom_right,color-mix(in_srgb,var(--color-rice-green)_10%,transparent),transparent_26%)]" />
      <div className="pointer-events-none absolute left-0 top-0 h-[28rem] w-[28rem] -translate-x-1/3 -translate-y-1/3 rounded-full bg-[color:color-mix(in_srgb,var(--color-rich-gold)_12%,transparent)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[26rem] w-[26rem] translate-x-1/4 translate-y-1/4 rounded-full bg-[color:color-mix(in_srgb,var(--color-rice-green)_12%,transparent)] blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl items-center justify-center">
        <Suspense fallback={null}>
          <VerifyOtpCard />
        </Suspense>
      </div>
    </div>
  );
}
