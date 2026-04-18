"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, LoaderCircle, MailCheck, ShieldCheck } from "lucide-react";

import AuthShell from "@/app/(public)/(auth)/_components/auth-shell";

type VerificationSuccessCardProps = {
  method: "email" | "phone";
  source: "register" | "login" | "account";
};

export default function VerificationSuccessCard({
  method,
  source,
}: VerificationSuccessCardProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const primaryHref = source === "account" ? "/account" : "/login";
  const primaryLabel = source === "account" ? "Back to Account" : "Go to Login";
  const description =
    source === "account"
      ? "Verification is complete. Your account details are now updated and you can continue managing your profile, deliveries, and rewards."
      : "Verification is complete. You can now log in with confidence and start ordering, tracking deliveries, and managing your account.";
  const readyLabel =
    source === "account" ? "Back to your profile" : "Ready to sign in";
  const readyText =
    source === "account"
      ? "Return to your account page to continue managing your verified details."
      : "Head to the login page to access your verified account.";

  return (
    <AuthShell
      title="Your account is verified and ready for sign in."
      description={description}
      stats={[
        { label: "Status", value: "Verified" },
        { label: "Method used", value: method === "email" ? "Email" : "Phone" },
        { label: "Next step", value: source === "account" ? "Account" : "Login" },
      ]}
    >
      <div className="text-center lg:text-left">
        <div className="mb-6 inline-flex items-center justify-center">
          <Image
            src="/logo/sarciariceco.svg"
            alt="Sarcia Rice Co."
            width={420}
            height={102}
            className="h-24 w-auto"
            style={{ width: "auto" }}
            priority
          />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-[#2f3b1f]">
          Account verified successfully.
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#6d7452]">
          Your account has been verified via{" "}
          <span className="font-semibold text-[#364127]">
            {method === "email" ? "email" : "phone"}
          </span>
          . You can continue to login and start using RiceProject.
        </p>

        <div className="mt-8 grid gap-3 rounded-[1.5rem] border border-[#e7e1c8] bg-[#faf7ee] p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white p-2 text-[var(--color-rice-green)] shadow-[0_8px_24px_rgba(74,92,54,0.08)]">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#364127]">
                Verification recorded
              </p>
              <p className="mt-1 text-sm leading-6 text-[#7b7a60]">
                Your verification timestamp is now saved in the system.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white p-2 text-[var(--color-rice-green)] shadow-[0_8px_24px_rgba(74,92,54,0.08)]">
              <MailCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#364127]">
                {readyLabel}
              </p>
              <p className="mt-1 text-sm leading-6 text-[#7b7a60]">
                {readyText}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={primaryHref}
            onClick={() => setIsLeaving(true)}
            className="group inline-flex items-center justify-center rounded-xl bg-[var(--color-rice-green)] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[color-mix(in_srgb,var(--color-rice-green)_82%,black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-rice-green)_25%,transparent)]"
          >
            {isLeaving ? (
              <span className="flex items-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span className="animate-pulse">
                  {source === "account" ? "Opening account..." : "Opening login..."}
                </span>
              </span>
            ) : (
              <>
                <span>{primaryLabel}</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-[#d8d4be] bg-[#fffef9] px-5 py-3.5 text-sm font-medium text-[#4b5137] transition hover:bg-[#f7f3e7]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
