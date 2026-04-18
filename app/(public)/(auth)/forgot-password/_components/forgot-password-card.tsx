"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  Mail,
  MessageSquareText,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useState } from "react";

import AuthShell from "@/app/(public)/(auth)/_components/auth-shell";

type RecoveryMethod = "email" | "mobile";

export default function ForgotPasswordCard() {
  const FIELD_LIMITS = {
    email: 254,
    mobile: 16,
  } as const;

  const [recoveryMethod, setRecoveryMethod] = useState<RecoveryMethod>("email");
  const [identifier, setIdentifier] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const formatMobileNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const localDigits = digits.startsWith("63") ? digits.slice(2) : digits;
    const trimmedDigits = localDigits.slice(0, 10);
    const normalizedDigits =
      trimmedDigits.length > 0 && trimmedDigits[0] === "0"
        ? trimmedDigits.slice(1)
        : trimmedDigits;

    const part1 = normalizedDigits.slice(0, 4);
    const part2 = normalizedDigits.slice(4, 7);
    const part3 = normalizedDigits.slice(7, 10);

    let formatted = "+63";

    if (part1) {
      formatted += ` ${part1}`;
    } else {
      formatted += " ";
    }

    if (part2) {
      formatted += `-${part2}`;
    }

    if (part3) {
      formatted += `-${part3}`;
    }

    return formatted;
  };

  const handleRecoveryMethodChange = (nextMethod: RecoveryMethod) => {
    setRecoveryMethod(nextMethod);
    setIdentifier(nextMethod === "mobile" ? "+63 " : "");
    setSubmissionError("");
    setStatusMessage("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmissionError("");
    setStatusMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: recoveryMethod,
          identifier,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | {
            message?: string;
            errors?: Record<string, string[]>;
          }
        | null;

      if (!response.ok) {
        setSubmissionError(
          data?.message ?? "Unable to send reset instructions right now."
        );
        return;
      }

      setStatusMessage(
        data?.message ??
          "If an account matches those details, reset instructions have been prepared."
      );
    } catch {
      setSubmissionError(
        "Something went wrong while requesting reset instructions."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const recoverySteps = [
    {
      icon: Mail,
      title: "Tell us where to send it",
      description:
        "Use the email or mobile number already connected to your account.",
    },
    {
      icon: MessageSquareText,
      title: "Prepare secure reset instructions",
      description:
        "We'll prepare a reset link after matching the email or mobile number on your account.",
    },
    {
      icon: ShieldCheck,
      title: "Set a new password",
      description:
        "Choose a fresh password so you can get back to ordering quickly.",
    },
  ];

  return (
    <AuthShell
      title="Recover your account and get back to your next rice delivery."
      description="Account recovery should feel reassuring, not stressful. Use the contact details already on file and we'll send a secure reset option right away."
      stats={[
        { label: "Average recovery time", value: "2 min" },
        { label: "Reset requests completed", value: "1.2k" },
        { label: "Secure verification rate", value: "99.8%" },
      ]}
    >
      <div className="mb-8 text-center lg:text-left">
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
        <h1 className="text-2xl font-semibold tracking-tight text-[#2f3b1f]">
          Forgot your password?
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#6d7452]">
          No problem. Choose how you want to receive your reset instructions,
          and we&apos;ll guide you through it.
        </p>
      </div>

      <div className="mb-5 grid gap-3 rounded-[1.5rem] border border-[#e7e1c8] bg-[#faf7ee] p-4">
        {recoverySteps.map((step) => (
          <div key={step.title} className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-white p-2 text-[var(--color-rice-green)] shadow-[0_8px_24px_rgba(74,92,54,0.08)]">
              <step.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#364127]">{step.title}</p>
              <p className="mt-1 text-sm leading-6 text-[#7b7a60]">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <p className="mb-2 ml-1 text-xs font-medium uppercase tracking-[0.18em] text-[#7c7b55]">
            Recovery Method
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleRecoveryMethodChange("email")}
              aria-pressed={recoveryMethod === "email"}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                recoveryMethod === "email"
                  ? "border-[var(--color-rice-green)] bg-[#f3f7ed] shadow-[0_12px_28px_rgba(74,92,54,0.08)]"
                  : "border-[#d8d4be] bg-[#fffef9] hover:bg-[#f7f3e7]"
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-[#364127]">
                <Mail className="h-4 w-4" />
                Email
              </div>
              <p className="mt-2 text-xs leading-5 text-[#7b7a60]">
                Send a reset link to your inbox.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleRecoveryMethodChange("mobile")}
              aria-pressed={recoveryMethod === "mobile"}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                recoveryMethod === "mobile"
                  ? "border-[var(--color-rice-green)] bg-[#f3f7ed] shadow-[0_12px_28px_rgba(74,92,54,0.08)]"
                  : "border-[#d8d4be] bg-[#fffef9] hover:bg-[#f7f3e7]"
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-[#364127]">
                <Smartphone className="h-4 w-4" />
                Mobile
              </div>
              <p className="mt-2 text-xs leading-5 text-[#7b7a60]">
                Use your registered phone number to find your account details.
              </p>
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 ml-1 block text-xs font-medium uppercase tracking-[0.18em] text-[#7c7b55]">
            {recoveryMethod === "email" ? "Email Address" : "Mobile Number"}
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#8d8f69]">
              {recoveryMethod === "email" ? (
                <Mail className="h-4 w-4" />
              ) : (
                <Smartphone className="h-4 w-4" />
              )}
            </div>
            <input
              type={recoveryMethod === "email" ? "email" : "text"}
              inputMode={recoveryMethod === "email" ? "email" : "numeric"}
              autoComplete={recoveryMethod === "email" ? "email" : "tel"}
              placeholder={
                recoveryMethod === "email"
                  ? "customer@gmail.com"
                  : "+63 9266-301-717"
              }
              value={identifier}
              onChange={(event) => {
                const nextValue = event.target.value;

                if (recoveryMethod === "email") {
                  setSubmissionError("");
                  setStatusMessage("");
                  setIdentifier(nextValue);
                  return;
                }

                setSubmissionError("");
                setStatusMessage("");
                setIdentifier(formatMobileNumber(nextValue));
              }}
              onFocus={() => {
                if (recoveryMethod === "mobile" && identifier.trim() === "") {
                  setIdentifier("+63 ");
                }
              }}
              maxLength={
                recoveryMethod === "email"
                  ? FIELD_LIMITS.email
                  : FIELD_LIMITS.mobile
              }
              className="w-full rounded-xl border border-[#d8d4be] bg-[#fffef9] py-3 pl-11 pr-4 text-sm text-[#2f3b1f] outline-none transition placeholder:text-[#9b9a7b] focus:border-[var(--color-rice-green)] focus:ring-1 focus:ring-[var(--color-rice-green)] focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-rice-green)_20%,transparent)]"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[#efe6cb] bg-[linear-gradient(135deg,#fffdf7_0%,#f6f1df_100%)] p-4">
          <p className="text-sm font-semibold text-[#364127]">
            What happens next
          </p>
          <p className="mt-2 text-sm leading-6 text-[#6d7452]">
            For your security, we&apos;ll only confirm that instructions were sent
            if the contact detail matches an existing account.
          </p>
        </div>

        {submissionError ? (
          <div className="rounded-2xl border border-[#e9cabb] bg-[#fff4ef] px-4 py-3 text-sm text-[#a14c34]">
            {submissionError}
          </div>
        ) : null}

        {statusMessage ? (
          <div className="rounded-2xl border border-[#d6e2c3] bg-[#f3f7ed] px-4 py-3 text-sm text-[#43612e]">
            {statusMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative flex w-full items-center justify-center rounded-xl bg-[var(--color-rice-green)] py-3.5 text-sm font-semibold text-white transition hover:bg-[color-mix(in_srgb,var(--color-rice-green)_82%,black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-rice-green)_25%,transparent)] disabled:cursor-not-allowed disabled:opacity-90"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              <span className="animate-pulse">Sending reset instructions...</span>
            </span>
          ) : (
            <>
              <span>Send Reset Instructions</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 flex flex-col gap-3 text-sm text-[#6d7452] sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 font-medium transition hover:text-[var(--color-rice-green)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <Link
          href="/register"
          className="font-semibold text-[var(--color-rice-green)] underline-offset-4 transition hover:text-[var(--color-rich-gold)] hover:underline"
        >
          Need a new account?
        </Link>
      </div>
    </AuthShell>
  );
}
