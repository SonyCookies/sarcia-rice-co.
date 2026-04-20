"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, KeyRound, LoaderCircle, RotateCw } from "lucide-react";

import AuthShell from "@/app/(public)/(auth)/_components/auth-shell";
import {
  clearPendingTwoFactorChallenge,
  getPendingTwoFactorChallenge,
  type PendingTwoFactorAction,
  type PendingTwoFactorChallenge,
} from "@/app/_lib/pending-two-factor-challenge";
import { useAuthStore } from "@/app/_stores/auth-store";

const RESEND_COOLDOWN_SECONDS = 30;

type VerifyResponse = {
  message?: string;
  errors?: Record<string, string[]>;
  user?: ReturnType<typeof useAuthStore.getState>["user"];
};

function appendSuccessParam(url: string, value: string) {
  const separator = url.includes("?") ? "&" : "?";

  return `${url}${separator}success=${encodeURIComponent(value)}`;
}

async function completePendingAction(action?: PendingTwoFactorAction) {
  if (!action) {
    return { ok: true, successKey: "verified", user: null };
  }

  if (action.type === "change_password") {
    const response = await fetch("/api/account/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(action.payload),
    });

    const data = (await response.json().catch(() => null)) as
      | VerifyResponse
      | null;

    return {
      ok: response.ok,
      message: data?.message ?? "Unable to change your password right now.",
      successKey: "password-updated",
      user: data?.user ?? null,
    };
  }

  if (action.type === "update_email") {
    const response = await fetch("/api/account/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(action.payload),
    });

    const data = (await response.json().catch(() => null)) as
      | VerifyResponse
      | null;

    return {
      ok: response.ok,
      message: data?.message ?? "Unable to update your email right now.",
      successKey: "email-updated",
      user: data?.user ?? null,
    };
  }

  if (action.type === "update_mobile") {
    const response = await fetch("/api/account/mobile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(action.payload),
    });

    const data = (await response.json().catch(() => null)) as
      | VerifyResponse
      | null;

    return {
      ok: response.ok,
      message: data?.message ?? "Unable to update your mobile number right now.",
      successKey: "mobile-updated",
      user: data?.user ?? null,
    };
  }

  const response = await fetch("/api/auth/two-factor", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(action.payload),
  });

  const data = (await response.json().catch(() => null)) as
    | VerifyResponse
    | null;

  return {
    ok: response.ok,
    message: data?.message ?? "Unable to update your two-factor settings right now.",
    successKey: "two-factor-updated",
    user: data?.user ?? null,
  };
}

export default function TwoFactorChallengeCard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [challenge] = useState<PendingTwoFactorChallenge | null>(() =>
    getPendingTwoFactorChallenge()
  );
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [trustDevice, setTrustDevice] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!challenge) {
      router.replace("/settings");
    }
  }, [challenge, router]);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setResendCooldown((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [resendCooldown]);

  const submitOtp = async () => {
    if (!challenge) {
      return;
    }

    setIsSubmitting(true);
    setOtpError("");
    setSubmissionError("");
    setStatusMessage("");

    try {
      const verifyResponse = await fetch("/api/auth/two-factor/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          purpose: challenge.purpose,
          otp,
          trust_device: challenge.purpose === "login" ? trustDevice : undefined,
        }),
      });

      const verifyData = (await verifyResponse.json().catch(() => null)) as
        | VerifyResponse
        | null;

      if (!verifyResponse.ok) {
        setSubmissionError(
          verifyData?.message ?? "Unable to verify the security code."
        );
        setOtpError(verifyData?.errors?.otp?.[0] ?? "");
        return;
      }

      if (challenge.purpose === "login") {
        if (verifyData?.user) {
          setUser(verifyData.user);
        }

        clearPendingTwoFactorChallenge();
        router.replace(challenge.returnTo);
        return;
      }

      const completion = await completePendingAction(challenge.action);

      if (!completion.ok) {
        setSubmissionError(
          completion.message ??
            "Your identity was confirmed, but the original action could not be completed."
        );
        return;
      }

      if (completion.user) {
        setUser(completion.user);
      }

      clearPendingTwoFactorChallenge();
      router.replace(
        appendSuccessParam(challenge.returnTo, completion.successKey)
      );
    } catch {
      setSubmissionError(
        "Something went wrong while confirming your security code."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendOtp = async () => {
    if (!challenge) {
      return;
    }

    setIsResending(true);
    setSubmissionError("");
    setStatusMessage("");
    setOtpError("");

    try {
      const response = await fetch("/api/auth/two-factor/challenge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          purpose: challenge.purpose,
          method: challenge.method,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | {
            message?: string;
          }
        | null;

      if (!response.ok) {
        setSubmissionError(
          data?.message ?? "Unable to resend the security code."
        );
        return;
      }

      setStatusMessage(data?.message ?? "A new security code was sent.");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      setSubmissionError("Something went wrong while resending your code.");
    } finally {
      setIsResending(false);
    }
  };

  const destinationLabel =
    challenge?.purpose === "change_password"
      ? "finish changing your password"
      : challenge?.purpose === "change_email"
        ? "finish changing your email"
        : challenge?.purpose === "change_mobile"
          ? "finish changing your mobile number"
      : challenge?.purpose === "login"
        ? "finish signing in"
        : "save your two-factor settings";

  const contactLabel =
    challenge?.method === "phone"
      ? challenge?.mobile
        ? `+63 ${challenge.mobile}`
        : user?.mobile
          ? `+63 ${user.mobile}`
          : "your mobile number"
      : challenge?.email ?? user?.email ?? "your email";

  return (
    <AuthShell
      title="Enter the 6-digit security code to continue."
      description="We sent a one-time code to your selected two-factor method so we can confirm this sensitive account change."
      stats={[
        { label: "Code length", value: "6 digits" },
        { label: "Expires in", value: "10 min" },
        { label: "Security window", value: "5 min" },
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
          Confirm it&apos;s really you
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#6d7452]">
          Enter the security code sent to{" "}
          <span className="font-semibold text-[#364127]">{contactLabel}</span>{" "}
          so you can {destinationLabel}.
        </p>

        <div className="mt-8">
          <label className="mb-1.5 ml-1 block text-xs font-medium uppercase tracking-[0.18em] text-[#7c7b55]">
            6-Digit Security Code
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              onKeyDown={(event) => {
                if (event.key === "Backspace" && otp.length > 0) {
                  setOtp((current) => current.slice(0, -1));
                  event.preventDefault();
                }
              }}
              className="pointer-events-none absolute inset-0 opacity-0"
              aria-label="Security code"
            />

            <button
              type="button"
              onClick={() => inputRef.current?.focus()}
              className="w-full"
            >
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 6 }, (_, index) => {
                  const digit = otp[index] ?? "";
                  const isActive = index === otp.length && otp.length < 6;
                  const isFilled = digit !== "";

                  return (
                    <div
                      key={index}
                      className={`flex aspect-square items-center justify-center rounded-2xl border text-xl font-semibold transition ${
                        otpError
                          ? "border-[#c76d4f] bg-[#fff8f4] text-[#a14c34]"
                          : isActive
                            ? "border-[var(--color-rice-green)] bg-[#f3f7ed] text-[#2f3b1f] shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-rice-green)_18%,transparent)]"
                            : isFilled
                              ? "border-[#cfd7bc] bg-[#fffef9] text-[#2f3b1f]"
                              : "border-[#d8d4be] bg-[#fffef9] text-[#9b9a7b]"
                      }`}
                    >
                      {digit || (isActive ? <span className="h-6 w-px animate-pulse bg-[#4d6b35]" /> : "")}
                    </div>
                  );
                })}
              </div>
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm text-[#7b7a60]">
            <KeyRound className="h-4 w-4 text-[#8d8f69]" />
            <span>Tap the boxes and type your code.</span>
          </div>
          {otpError ? (
            <p className="mt-1.5 ml-1 text-sm text-[#a14c34]">{otpError}</p>
          ) : null}
        </div>

        {submissionError ? (
          <div className="mt-5 rounded-2xl border border-[#e9cabb] bg-[#fff4ef] px-4 py-3 text-sm text-[#a14c34]">
            {submissionError}
          </div>
        ) : null}

        {statusMessage ? (
          <div className="mt-5 rounded-2xl border border-[#d6e2c3] bg-[#f3f7ed] px-4 py-3 text-sm text-[#43612e]">
            {statusMessage}
          </div>
        ) : null}

        {challenge?.purpose === "login" ? (
          <label className="mt-5 flex items-start gap-3 rounded-2xl border border-[#e5e0cc] bg-[#faf7ee] px-4 py-4 text-left">
            <input
              type="checkbox"
              checked={trustDevice}
              onChange={(event) => setTrustDevice(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[#cfc9b0] text-[var(--color-rice-green)] focus:ring-[var(--color-rice-green)]"
            />
            <span className="text-sm leading-6 text-[#6d7452]">
              Trust this device for 30 days so future logins here can skip the extra code.
            </span>
          </label>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={submitOtp}
            disabled={isSubmitting || otp.length !== 6 || !challenge}
            className="group inline-flex items-center justify-center rounded-xl bg-[var(--color-rice-green)] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[color-mix(in_srgb,var(--color-rice-green)_82%,black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-rice-green)_25%,transparent)] disabled:cursor-not-allowed disabled:opacity-90"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span className="animate-pulse">Confirming...</span>
              </span>
            ) : (
              <>
                <span>Confirm and Continue</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={resendOtp}
            disabled={isResending || !challenge || resendCooldown > 0}
            className="inline-flex items-center justify-center rounded-xl border border-[#d8d4be] bg-[#fffef9] px-5 py-3.5 text-sm font-medium text-[#4b5137] transition hover:bg-[#f7f3e7] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isResending ? (
              <span className="flex items-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span className="animate-pulse">Resending code...</span>
              </span>
            ) : resendCooldown > 0 ? (
              <>
                <RotateCw className="mr-2 h-4 w-4" />
                {`Resend in ${resendCooldown}s`}
              </>
            ) : (
              <>
                <RotateCw className="mr-2 h-4 w-4" />
                Resend Code
              </>
            )}
          </button>
        </div>

        <p className="mt-6 text-sm text-[#6d7452]">
          <Link
            href={challenge?.returnTo ?? "/settings"}
            className="font-semibold text-[var(--color-rice-green)] underline-offset-4 transition hover:text-[var(--color-rich-gold)] hover:underline"
          >
            Back to your previous page
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
