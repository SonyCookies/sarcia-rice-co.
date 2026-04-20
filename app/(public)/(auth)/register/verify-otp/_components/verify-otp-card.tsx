"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, KeyRound, LoaderCircle, RotateCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import AuthShell from "@/app/(public)/(auth)/_components/auth-shell";
import {
  clearPendingVerificationUser,
  getPendingVerificationUser,
  type PendingVerificationUser,
} from "@/app/(public)/(auth)/register/_lib/pending-verification";
import { useAuthStore } from "@/app/_stores/auth-store";

type VerificationMethod = "email" | "phone";
const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyOtpCard() {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const searchParams = useSearchParams();
  const method = (searchParams.get("method") === "phone"
    ? "phone"
    : "email") as VerificationMethod;

  const [user] = useState<PendingVerificationUser | null>(() =>
    getPendingVerificationUser()
  );
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const inputRef = useRef<HTMLInputElement>(null);
  const sourceParam = searchParams.get("source");
  const returnToParam = searchParams.get("returnTo");
  const source =
    sourceParam === "login" || sourceParam === "account" || sourceParam === "settings"
      ? sourceParam
      : user?.source ?? "register";
  const fallbackRoute =
    returnToParam ??
    user?.returnTo ??
    (source === "account"
      ? "/account"
      : source === "settings"
        ? "/settings"
        : source === "login"
          ? "/login"
          : "/register");
  const switchMethodHref = `/verify-method?source=${source}`;
  const backLabel =
    fallbackRoute === "/admin/settings"
      ? "Back to admin settings"
      : fallbackRoute === "/settings"
        ? "Back to settings"
        : fallbackRoute === "/account"
          ? "Back to account"
          : fallbackRoute === "/login"
            ? "Back to login"
            : "";

  useEffect(() => {
    if (!user) {
      router.replace(fallbackRoute);
    }
  }, [fallbackRoute, router, user]);

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
    if (!user) {
      return;
    }

    setIsSubmitting(true);
    setOtpError("");
    setSubmissionError("");
    setStatusMessage("");

    try {
      const response = await fetch("/api/auth/verification/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          method,
          otp,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | {
            message?: string;
            errors?: Record<string, string[]>;
            user?: Partial<PendingVerificationUser> & {
              primary_verification_method?: "email" | "phone" | null;
              two_factor_enabled?: boolean;
              two_factor_method?: "email" | "phone" | null;
            };
          }
        | null;

      if (!response.ok) {
        setSubmissionError(data?.message ?? "Unable to verify your account.");
        setOtpError(data?.errors?.otp?.[0] ?? "");
        return;
      }

      if (data?.user && (source === "account" || source === "settings")) {
        const baseUser = currentUser ?? user;

        if (baseUser) {
          setUser({
            id: baseUser.id,
            name: baseUser.name,
            email: baseUser.email,
            mobile: baseUser.mobile,
            role: baseUser.role,
            email_verified_at: data.user.email_verified_at ?? baseUser.email_verified_at ?? null,
            mobile_verified_at: data.user.mobile_verified_at ?? baseUser.mobile_verified_at ?? null,
            primary_verification_method:
              data.user.primary_verification_method ??
              ("primary_verification_method" in baseUser
                ? baseUser.primary_verification_method ?? null
                : null),
            two_factor_enabled:
              data.user.two_factor_enabled ??
              ("two_factor_enabled" in baseUser
                ? baseUser.two_factor_enabled
                : undefined),
            two_factor_method:
              data.user.two_factor_method ??
              ("two_factor_method" in baseUser
                ? baseUser.two_factor_method ?? null
                : null),
          });
        }
      }

      clearPendingVerificationUser();

      const successParams = new URLSearchParams({
        method,
        source,
      });

      if (returnToParam ?? user?.returnTo) {
        successParams.set("returnTo", returnToParam ?? user?.returnTo ?? "");
      }

      router.push(`/verification-success?${successParams.toString()}`);
    } catch {
      setSubmissionError("Something went wrong while verifying the code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendOtp = async () => {
    if (!user) {
      return;
    }

    setIsResending(true);
    setSubmissionError("");
    setStatusMessage("");
    setOtpError("");

    try {
      const response = await fetch("/api/auth/verification/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          method,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | {
            message?: string;
          }
        | null;

      if (!response.ok) {
        setSubmissionError(
          data?.message ?? "Unable to resend the verification code."
        );
        return;
      }

      setStatusMessage(data?.message ?? "A new verification code was sent.");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      setSubmissionError("Something went wrong while resending your code.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthShell
      title="Enter the 6-digit code to finish verifying your account."
      description="We sent a one-time password to the method you chose. Enter it below to activate your new account and continue to login."
      stats={[
        { label: "Code length", value: "6 digits" },
        { label: "Expires in", value: "10 min" },
        { label: "Resend", value: "Anytime" },
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
          Verify your {method === "email" ? "email" : "phone"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#6d7452]">
          Enter the code sent to{" "}
          <span className="font-semibold text-[#364127]">
            {user
              ? method === "email"
                ? user.email
                : user.mobile
              : "..."}
          </span>
          .
        </p>

        <div className="mt-8">
          <label className="mb-1.5 ml-1 block text-xs font-medium uppercase tracking-[0.18em] text-[#7c7b55]">
            6-Digit OTP
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
              aria-label="Verification code"
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

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={submitOtp}
            disabled={isSubmitting || otp.length !== 6 || !user}
            className="group inline-flex items-center justify-center rounded-xl bg-[var(--color-rice-green)] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[color-mix(in_srgb,var(--color-rice-green)_82%,black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-rice-green)_25%,transparent)] disabled:cursor-not-allowed disabled:opacity-90"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span className="animate-pulse">Verifying account...</span>
              </span>
            ) : (
              <>
                <span>Verify Account</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={resendOtp}
            disabled={isResending || !user || resendCooldown > 0}
            className="inline-flex items-center justify-center rounded-xl border border-[#d8d4be] bg-[#fffef9] px-5 py-3.5 text-sm font-medium text-[#4b5137] transition hover:bg-[#f7f3e7] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isResending
              ? (
                <span className="flex items-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  <span className="animate-pulse">Resending code...</span>
                </span>
              )
              : resendCooldown > 0
                ? (
                  <>
                    <RotateCw className="mr-2 h-4 w-4" />
                    {`Resend in ${resendCooldown}s`}
                  </>
                )
                : (
                  <>
                    <RotateCw className="mr-2 h-4 w-4" />
                    Resend Code
                  </>
                )}
          </button>
        </div>

        {source === "register" ? (
          <p className="mt-6 text-sm text-[#6d7452]">
            Need to switch methods?{" "}
            <Link
              href={switchMethodHref}
              className="font-semibold text-[var(--color-rice-green)] underline-offset-4 transition hover:text-[var(--color-rich-gold)] hover:underline"
            >
              Choose another verification option
            </Link>
          </p>
        ) : null}
        {source !== "register" ? (
          <p className="mt-3 text-sm text-[#6d7452]">
            <Link
              href={fallbackRoute}
              className="font-semibold text-[var(--color-rice-green)] underline-offset-4 transition hover:text-[var(--color-rich-gold)] hover:underline"
            >
              {backLabel}
            </Link>
          </p>
        ) : null}
      </div>
    </AuthShell>
  );
}
