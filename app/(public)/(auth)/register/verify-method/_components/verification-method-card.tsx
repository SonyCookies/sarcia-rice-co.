"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, LoaderCircle, Mail, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

import AuthShell from "@/app/(public)/(auth)/_components/auth-shell";
import {
  getPendingVerificationUser,
  type PendingVerificationUser,
} from "@/app/(public)/(auth)/register/_lib/pending-verification";

type VerificationMethod = "email" | "phone";

export default function VerificationMethodCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user] = useState<PendingVerificationUser | null>(() =>
    getPendingVerificationUser()
  );
  const [selectedMethod, setSelectedMethod] =
    useState<VerificationMethod>("email");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const sourceParam = searchParams.get("source");
  const source =
    sourceParam === "login" || sourceParam === "account"
      ? sourceParam
      : user?.source ?? "register";
  const fallbackRoute =
    source === "account"
      ? "/account"
      : source === "login"
        ? "/login"
        : "/register";
  const title =
    source === "register"
      ? "Choose how you'd like to verify your new account."
      : "Choose how you'd like to verify your account.";
  const description =
    source === "register"
      ? "We'll send a 6-digit code to the method you choose. Email works right away, and phone is ready for your SMS provider once you plug it in."
      : "Pick where you want us to send your one-time password so we can verify your account securely.";
  const backLabel =
    source === "account"
      ? "Back to Account"
      : source === "login"
        ? "Back to Login"
        : "Back to Register";

  useEffect(() => {
    if (!user) {
      router.replace(fallbackRoute);
    }
  }, [fallbackRoute, router, user]);

  const handleSendOtp = async () => {
    if (!user) {
      return;
    }

    setIsSubmitting(true);
    setSubmissionError("");

    try {
      const response = await fetch("/api/auth/verification/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          method: selectedMethod,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | {
            message?: string;
          }
        | null;

      if (!response.ok) {
        setSubmissionError(
          data?.message ?? "Unable to send the verification code."
        );
        return;
      }

      router.push(`/verify-otp?method=${selectedMethod}&source=${source}`);
    } catch {
      setSubmissionError("Something went wrong while sending your code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title={title}
      description="We’ll send a 6-digit code to the method you choose. Email works right away, and phone is ready for your SMS provider once you plug it in."
      {...{ description }}
      stats={[
        { label: "Code length", value: "6 digits" },
        { label: "Code expiry", value: "10 min" },
        { label: "Delivery methods", value: "2" },
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
            priority
          />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-[#2f3b1f]">
          Choose verification method
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#6d7452]">
          Pick where you want us to send your one-time password so we can
          verify your account securely.
        </p>

        {user ? (
          <div className="mt-5 rounded-2xl border border-[#e7e1c8] bg-[#faf7ee] p-4 text-sm text-[#6d7452]">
            We&apos;ll use <span className="font-semibold text-[#364127]">{user.email}</span> or{" "}
            <span className="font-semibold text-[#364127]">{user.mobile}</span>.
          </div>
        ) : null}

        <div className="mt-8 grid gap-3">
          <button
            type="button"
            onClick={() => setSelectedMethod("email")}
            className={`rounded-2xl border px-4 py-4 text-left transition ${
              selectedMethod === "email"
                ? "border-[var(--color-rice-green)] bg-[#f3f7ed] shadow-[0_12px_28px_rgba(74,92,54,0.08)]"
                : "border-[#d8d4be] bg-[#fffef9] hover:bg-[#f7f3e7]"
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-[#364127]">
              <Mail className="h-4 w-4" />
              Verify via Email
            </div>
            <p className="mt-2 text-sm leading-6 text-[#7b7a60]">
              Send the 6-digit code to your registered email address.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMethod("phone")}
            className={`rounded-2xl border px-4 py-4 text-left transition ${
              selectedMethod === "phone"
                ? "border-[var(--color-rice-green)] bg-[#f3f7ed] shadow-[0_12px_28px_rgba(74,92,54,0.08)]"
                : "border-[#d8d4be] bg-[#fffef9] hover:bg-[#f7f3e7]"
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-[#364127]">
              <Smartphone className="h-4 w-4" />
              Verify via Phone
            </div>
            <p className="mt-2 text-sm leading-6 text-[#7b7a60]">
              Generate the same 6-digit code flow for SMS delivery once your
              provider is connected.
            </p>
          </button>
        </div>

        {submissionError ? (
          <div className="mt-5 rounded-2xl border border-[#e9cabb] bg-[#fff4ef] px-4 py-3 text-sm text-[#a14c34]">
            {submissionError}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={isSubmitting || !user}
            className="group inline-flex items-center justify-center rounded-xl bg-[var(--color-rice-green)] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[color-mix(in_srgb,var(--color-rice-green)_82%,black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-rice-green)_25%,transparent)] disabled:cursor-not-allowed disabled:opacity-90"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span className="animate-pulse">Sending code...</span>
              </span>
            ) : (
              <>
                <span>Send 6-Digit Code</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

          <Link
            href={fallbackRoute}
            className="inline-flex items-center justify-center rounded-xl border border-[#d8d4be] bg-[#fffef9] px-5 py-3.5 text-sm font-medium text-[#4b5137] transition hover:bg-[#f7f3e7]"
          >
            {backLabel}
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
