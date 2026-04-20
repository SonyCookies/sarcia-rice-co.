"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";

import AdminShell from "@/app/admin/_components/admin-shell";
import { savePendingTwoFactorChallenge } from "@/app/_lib/pending-two-factor-challenge";
import { useAuthStore } from "@/app/_stores/auth-store";

type ChangeMobileResponse = {
  message?: string;
  errors?: Record<string, string[]>;
  requires_two_factor?: boolean;
  purpose?: "change_mobile";
  two_factor_method?: "email" | "phone";
  user?: ReturnType<typeof useAuthStore.getState>["user"];
};

const FIELD_LIMITS = {
  mobile: 16,
} as const;

function formatMobileNumber(value: string) {
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
}

export default function AdminChangeMobileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [mobile, setMobile] = useState(user?.mobile ? `+63 ${user.mobile}` : "+63 ");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [fieldError, setFieldError] = useState("");

  useEffect(() => {
    setMobile(user?.mobile ? `+63 ${user.mobile}` : "+63 ");
  }, [user?.mobile]);

  useEffect(() => {
    if (searchParams.get("success") !== "mobile-updated") {
      return;
    }

    setIsComplete(true);
    setSubmissionError("");
    setFieldError("");
  }, [searchParams]);

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
    setFieldError("");

    try {
      const response = await fetch("/api/account/mobile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | ChangeMobileResponse
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
            returnTo: "/admin/settings/change-mobile",
            email: user?.email ?? "",
            mobile: user?.mobile ?? "",
            action: {
              type: "update_mobile",
              payload: {
                mobile,
              },
            },
          });

          router.push("/two-factor-challenge");
          return;
        }

        setSubmissionError(
          data?.message ?? "Unable to update your mobile number right now."
        );
        setFieldError(data?.errors?.mobile?.[0] ?? "");
        return;
      }

      if (data?.user) {
        setUser(data.user);
      }

      setIsComplete(true);
    } catch {
      setSubmissionError("Something went wrong while updating your mobile number.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminShell
      subtitle="Keep admin OTP delivery and fallback recovery tied to the right mobile number."
      searchPlaceholder="Search admin mobile update or OTP help"
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

      <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
            Change Mobile Number
          </p>
          <p className="mt-1 text-sm text-[#6d7452]">
            Update the number used for admin OTP delivery and fallback recovery follow-ups.
          </p>
        </div>

        <div className="mt-5 rounded-2xl border border-[#e7e1c8] bg-[#faf7ee] p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white p-2 text-[var(--color-rice-green)] shadow-[0_8px_24px_rgba(74,92,54,0.08)]">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#364127]">
                Mobile number change cooldown
              </p>
              <p className="mt-1 text-sm leading-6 text-[#6d7452]">
                After a successful mobile number change, you&apos;ll need to wait 24 hours before changing it again.
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
                    Mobile number updated successfully
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[#43612e]">
                    Your new admin mobile number is saved. Please verify it from admin settings before using it for OTP or two-factor sign-in.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/admin/settings")}
              className="group inline-flex w-full items-center justify-center rounded-xl bg-[var(--color-rice-green)] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[color-mix(in_srgb,var(--color-rice-green)_82%,black)]"
            >
              Back to Admin Settings
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a987b]">
                Current Mobile Number
              </p>
              <p className="mt-2 text-sm font-semibold text-[#2f3b1f] sm:text-base">
                {user?.mobile ? `+63 ${user.mobile}` : "No mobile number yet"}
              </p>
            </div>

            <div>
              <label className="mb-1.5 ml-1 block text-xs font-medium uppercase tracking-[0.18em] text-[#7c7b55]">
                New Mobile Number
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#8d8f69]">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  type="tel"
                  inputMode="tel"
                  placeholder="+63 9511-860-330"
                  value={mobile}
                  maxLength={FIELD_LIMITS.mobile}
                  onChange={(event) => setMobile(formatMobileNumber(event.target.value))}
                  className={getInputClassName(Boolean(fieldError))}
                />
              </div>
              {fieldError ? (
                <p className="mt-1.5 ml-1 text-sm text-[#a14c34]">{fieldError}</p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-[#e7e1c8] bg-[#faf7ee] p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-white p-2 text-[var(--color-rice-green)] shadow-[0_8px_24px_rgba(74,92,54,0.08)]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#364127]">
                    Re-verification required
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[#6d7452]">
                    Changing your mobile number clears its verified status. You can verify the new number again from admin settings after saving.
                  </p>
                </div>
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
                  <span className="animate-pulse">Updating mobile number...</span>
                </span>
              ) : (
                <>
                  <span>Update Mobile Number</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        )}
      </section>
    </AdminShell>
  );
}
