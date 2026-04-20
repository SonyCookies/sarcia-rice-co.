"use client";

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
import { useEffect, useMemo, useState } from "react";

import AdminShell from "@/app/admin/_components/admin-shell";
import { savePendingTwoFactorChallenge } from "@/app/_lib/pending-two-factor-challenge";

type ChangePasswordResponse = {
  message?: string;
  errors?: Record<string, string[]>;
  requires_two_factor?: boolean;
  purpose?: "change_password";
  two_factor_method?: "email" | "phone";
};

const FIELD_LIMITS = {
  password: 72,
} as const;

export default function AdminChangePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<"currentPassword" | "password" | "confirmPassword", string>>
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
    `w-full rounded-xl border bg-[#fffef9] py-3 pl-11 pr-11 text-sm text-[#2f3b1f] outline-none transition placeholder:text-[#9b9a7b] ${
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
      const response = await fetch("/api/account/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: currentPassword,
          password,
          password_confirmation: confirmPassword,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | ChangePasswordResponse
        | null;

      if (!response.ok) {
        if (
          data?.requires_two_factor &&
          data?.purpose &&
          data?.two_factor_method
        ) {
          const challengeResponse = await fetch("/api/auth/two-factor/challenge", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              purpose: data.purpose,
              method: data.two_factor_method,
            }),
          });

          const challengeData = (await challengeResponse.json().catch(() => null)) as
            | {
                message?: string;
              }
            | null;

          if (!challengeResponse.ok) {
            setSubmissionError(
              challengeData?.message ??
                "Unable to send the security confirmation code."
            );
            return;
          }

          savePendingTwoFactorChallenge({
            purpose: data.purpose,
            method: data.two_factor_method,
            returnTo: "/admin/settings/change-password",
            action: {
              type: "change_password",
              payload: {
                current_password: currentPassword,
                password,
                password_confirmation: confirmPassword,
              },
            },
          });

          router.push("/two-factor-challenge");
          return;
        }

        setSubmissionError(
          data?.message ?? "Unable to change your password right now."
        );
        setFieldErrors({
          currentPassword: data?.errors?.current_password?.[0],
          password: data?.errors?.password?.[0],
          confirmPassword: data?.errors?.password_confirmation?.[0],
        });
        return;
      }

      setIsComplete(true);
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setSubmissionError(
        "Something went wrong while changing your password."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (searchParams.get("success") !== "password-updated") {
      return;
    }

    setIsComplete(true);
    setCurrentPassword("");
    setPassword("");
    setConfirmPassword("");
    setSubmissionError("");
    setFieldErrors({});
  }, [searchParams]);

  return (
    <AdminShell
      subtitle="Use a dedicated admin security page for credential updates and protected-account access."
      searchPlaceholder="Search admin password help or sign-in security"
    >
      <div>
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-2 rounded-full border border-[#d8d4be] bg-[#faf7ee] px-4 py-2 text-sm font-semibold text-[var(--color-rice-green)] transition hover:bg-[#f4efdf] hover:text-[color:color-mix(in_srgb,var(--color-rice-green)_85%,black)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to settings overview
        </Link>
      </div>

      <section>
        <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
              Change Password
            </p>
            <p className="mt-1 text-sm text-[#6d7452]">
              Confirm your current password, then choose a stronger one for admin access.
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-[#e7e1c8] bg-[#faf7ee] p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white p-2 text-[var(--color-rice-green)] shadow-[0_8px_24px_rgba(74,92,54,0.08)]">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#364127]">
                  Password change cooldown
                </p>
                <p className="mt-1 text-sm leading-6 text-[#6d7452]">
                  After a successful password change, you&apos;ll need to wait 1 hour before changing it again.
                </p>
              </div>
            </div>
          </div>

          {isComplete ? (
            <div className="mt-6 space-y-5">
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
                      Your new admin password is active now. You can head back to
                      settings or continue managing secure access controls.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => router.push("/admin/settings")}
                  className="group inline-flex flex-1 items-center justify-center rounded-xl bg-[var(--color-rice-green)] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[color-mix(in_srgb,var(--color-rice-green)_82%,black)]"
                >
                  Back to Admin Settings
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1.5 ml-1 block text-xs font-medium uppercase tracking-[0.18em] text-[#7c7b55]">
                  Current Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#8d8f69]">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter your current password"
                    value={currentPassword}
                    maxLength={FIELD_LIMITS.password}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className={getInputClassName(Boolean(fieldErrors.currentPassword))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8d8f69] transition hover:text-[var(--color-rice-green)]"
                    aria-label={
                      showCurrentPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>
                {fieldErrors.currentPassword ? (
                  <p className="mt-1.5 ml-1 text-sm text-[#a14c34]">
                    {fieldErrors.currentPassword}
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
                    className={getInputClassName(Boolean(fieldErrors.password))}
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
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    maxLength={FIELD_LIMITS.password}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className={getInputClassName(Boolean(fieldErrors.confirmPassword))}
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

              {submissionError ? (
                <div className="rounded-2xl border border-[#e9cabb] bg-[#fff4ef] px-4 py-3 text-sm text-[#a14c34]">
                  {submissionError}
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
        </section>
      </section>
    </AdminShell>
  );
}
