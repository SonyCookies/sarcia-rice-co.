"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";

import AuthShell from "@/app/(public)/(auth)/_components/auth-shell";

type ResetResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

export default function ResetPasswordCard() {
  const FIELD_LIMITS = {
    email: 254,
    password: 72,
  } as const;

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<"email" | "password" | "confirmPassword" | "token", string>>
  >({});

  const passwordChecks = useMemo(
    () => [
      {
        label: "At least 8 characters",
        met: password.length >= 8,
      },
      {
        label: "One uppercase letter",
        met: /[A-Z]/.test(password),
      },
      {
        label: "One number",
        met: /\d/.test(password),
      },
      {
        label: "Passwords match",
        met: confirmPassword.length > 0 && password === confirmPassword,
      },
    ],
    [confirmPassword, password]
  );

  const getInputClassName = (hasError: boolean) =>
    `w-full rounded-xl border bg-[#fffef9] py-3 pl-11 pr-4 text-sm text-[#2f3b1f] outline-none transition placeholder:text-[#9b9a7b] ${
      hasError
        ? "border-[#c76d4f] bg-[#fff8f4] focus:border-[#a14c34] focus:ring-1 focus:ring-[#a14c34] focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,#a14c34_20%,transparent)]"
        : "border-[#d8d4be] focus:border-[var(--color-rice-green)] focus:ring-1 focus:ring-[var(--color-rice-green)] focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-rice-green)_20%,transparent)]"
    }`;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmissionError("");
    setFieldErrors({});

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          email,
          password,
          password_confirmation: confirmPassword,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | ResetResponse
        | null;

      if (!response.ok) {
        setSubmissionError(data?.message ?? "Unable to reset your password.");
        setFieldErrors({
          email: data?.errors?.email?.[0],
          password: data?.errors?.password?.[0],
          confirmPassword: data?.errors?.password_confirmation?.[0],
          token: data?.errors?.token?.[0],
        });
        return;
      }

      setIsComplete(true);

      window.setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch {
      setSubmissionError("Something went wrong while resetting your password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Set a fresh password and get back to your next rice delivery."
      description="Use your secure reset link to choose a new password. Once saved, you can sign in again with confidence."
      stats={[
        { label: "Reset link expiry", value: "60 min" },
        { label: "Password minimum", value: "8 chars" },
        { label: "Security status", value: "Protected" },
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
          Reset your password
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#6d7452]">
          Choose a strong new password for{" "}
          <span className="font-semibold text-[#364127]">
            {email || "your account"}
          </span>
          .
        </p>
      </div>

      {!token ? (
        <div className="rounded-2xl border border-[#e9cabb] bg-[#fff4ef] px-4 py-4 text-sm text-[#a14c34]">
          This reset link is incomplete. Please request a new password reset
          from the forgot password page.
        </div>
      ) : null}

      {isComplete ? (
        <div className="space-y-5">
          <div className="rounded-[1.5rem] border border-[#d6e2c3] bg-[#f3f7ed] p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white p-2 text-[var(--color-rice-green)] shadow-[0_8px_24px_rgba(74,92,54,0.08)]">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#364127]">
                  Password updated successfully
                </p>
                <p className="mt-1 text-sm leading-6 text-[#43612e]">
                  Your new password has been saved. We&apos;re sending you back
                  to login now.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/login"
            className="group inline-flex w-full items-center justify-center rounded-xl bg-[var(--color-rice-green)] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[color-mix(in_srgb,var(--color-rice-green)_82%,black)]"
          >
            Continue to Login
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 ml-1 block text-xs font-medium uppercase tracking-[0.18em] text-[#7c7b55]">
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#8d8f69]">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <input
                type="email"
                value={email}
                maxLength={FIELD_LIMITS.email}
                readOnly
                className={`${getInputClassName(Boolean(fieldErrors.email))} cursor-not-allowed bg-[#f4f1e4] text-[#6d7452]`}
              />
            </div>
            {fieldErrors.email ? (
              <p className="mt-1.5 ml-1 text-sm text-[#a14c34]">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 ml-1 block text-xs font-medium uppercase tracking-[0.18em] text-[#7c7b55]">
              New Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#8d8f69]">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a secure password"
                value={password}
                maxLength={FIELD_LIMITS.password}
                onChange={(event) => setPassword(event.target.value)}
                className={`${getInputClassName(Boolean(fieldErrors.password))} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8d8f69] transition hover:text-[var(--color-rice-green)]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-[18px] w-[18px]" />
                ) : (
                  <Eye className="h-[18px] w-[18px]" />
                )}
              </button>
            </div>
            {fieldErrors.password ? (
              <p className="mt-1.5 ml-1 text-sm text-[#a14c34]">
                {fieldErrors.password}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 ml-1 block text-xs font-medium uppercase tracking-[0.18em] text-[#7c7b55]">
              Confirm Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#8d8f69]">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                maxLength={FIELD_LIMITS.password}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={`${getInputClassName(Boolean(fieldErrors.confirmPassword))} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8d8f69] transition hover:text-[var(--color-rice-green)]"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-[18px] w-[18px]" />
                ) : (
                  <Eye className="h-[18px] w-[18px]" />
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword ? (
              <p className="mt-1.5 ml-1 text-sm text-[#a14c34]">
                {fieldErrors.confirmPassword}
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-[#e7e1c8] bg-[#faf7ee] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7c7b55]">
              Password Requirements
            </p>
            <div className="mt-3 space-y-2">
              {passwordChecks.map((check) => (
                <div
                  key={check.label}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    check.met ? "text-[#4d6b35]" : "text-[#9b9a7b]"
                  }`}
                >
                  <CheckCircle2
                    className={`h-4 w-4 ${
                      check.met
                        ? "text-[var(--color-rice-green)]"
                        : "text-[#b8b49a]"
                    }`}
                  />
                  <span>{check.label}</span>
                </div>
              ))}
            </div>
          </div>

          {fieldErrors.token ? (
            <div className="rounded-2xl border border-[#e9cabb] bg-[#fff4ef] px-4 py-3 text-sm text-[#a14c34]">
              {fieldErrors.token}
            </div>
          ) : null}

          {submissionError ? (
            <div className="rounded-2xl border border-[#e9cabb] bg-[#fff4ef] px-4 py-3 text-sm text-[#a14c34]">
              {submissionError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || !token}
            className="group relative flex w-full items-center justify-center rounded-xl bg-[var(--color-rice-green)] py-3.5 text-sm font-semibold text-white transition hover:bg-[color-mix(in_srgb,var(--color-rice-green)_82%,black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-rice-green)_25%,transparent)] disabled:cursor-not-allowed disabled:opacity-90"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span className="animate-pulse">Updating password...</span>
              </span>
            ) : (
              <>
                <span>Update Password</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      )}

      <div className="mt-8 flex flex-col gap-3 text-sm text-[#6d7452] sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 font-medium transition hover:text-[var(--color-rice-green)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <Link
          href="/forgot-password"
          className="font-semibold text-[var(--color-rice-green)] underline-offset-4 transition hover:text-[var(--color-rich-gold)] hover:underline"
        >
          Request another reset link
        </Link>
      </div>
    </AuthShell>
  );
}
