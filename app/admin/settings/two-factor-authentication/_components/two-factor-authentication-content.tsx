"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  LoaderCircle,
  Mail,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import AdminShell from "@/app/admin/_components/admin-shell";
import { SettingsSectionSkeleton } from "@/app/(user)/settings/_components/settings-page-skeleton";
import { savePendingTwoFactorChallenge } from "@/app/_lib/pending-two-factor-challenge";
import { useAuthStore } from "@/app/_stores/auth-store";

type TwoFactorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
  two_factor_enabled?: boolean;
  two_factor_method?: "email" | "phone" | null;
  requires_two_factor?: boolean;
  purpose?: "manage_two_factor";
  user?: ReturnType<typeof useAuthStore.getState>["user"];
};

export default function AdminTwoFactorAuthenticationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"email" | "phone" | null>(
    null
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        const response = await fetch("/api/auth/two-factor", {
          cache: "no-store",
        });

        const data = (await response.json().catch(() => null)) as
          | TwoFactorResponse
          | null;

        if (!response.ok) {
          if (isMounted) {
            setError(
              data?.message ?? "Unable to load your two-factor settings."
            );
          }
          return;
        }

        if (!isMounted) {
          return;
        }

        setEnabled(Boolean(data?.two_factor_enabled));
        setSelectedMethod(data?.two_factor_method ?? null);

        if (data?.user) {
          setUser(data.user);
        }
      } catch {
        if (isMounted) {
          setError("Something went wrong while loading your two-factor settings.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, [setUser]);

  const canUseEmail = Boolean(user?.email_verified_at);
  const canUsePhone = Boolean(user?.mobile_verified_at);
  const hasVerifiedMethod = canUseEmail || canUsePhone;

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/auth/two-factor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabled,
          method: enabled ? selectedMethod : null,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | TwoFactorResponse
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
            setError(
              challengeData?.message ??
                "Unable to send the security confirmation code."
            );
            return;
          }

          savePendingTwoFactorChallenge({
            purpose: data.purpose,
            method: data.two_factor_method,
            returnTo: "/admin/settings/two-factor-authentication",
            action: {
              type: "update_two_factor",
              payload: {
                enabled,
                method: selectedMethod,
              },
            },
          });

          router.push("/two-factor-challenge");
          return;
        }

        setError(
          data?.errors?.method?.[0] ??
            data?.message ??
            "Unable to update your two-factor settings."
        );
        return;
      }

      setEnabled(Boolean(data?.two_factor_enabled));
      setSelectedMethod(data?.two_factor_method ?? null);
      setMessage(
        data?.message ?? "Two-factor authentication settings updated."
      );

      if (data?.user) {
        setUser(data.user);
      }
    } catch {
      setError("Something went wrong while saving your two-factor settings.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (searchParams.get("success") !== "two-factor-updated") {
      return;
    }

    setMessage("Two-factor authentication settings updated.");
    setError("");
  }, [searchParams]);

  return (
    <AdminShell
      subtitle="Add an extra verification step to protect admin account sign-ins."
      searchPlaceholder="Search admin two-factor help or verification settings"
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
            Two-Factor Authentication
          </p>
          <p className="mt-1 text-sm leading-6 text-[#6d7452]">
            Add a second check after your password using email or mobile.
          </p>
        </div>

        {isLoading ? (
          <div className="mt-6">
            <SettingsSectionSkeleton rows={4} />
          </div>
        ) : (
          <>
            <div className="mt-6 rounded-[1.5rem] border border-[#e5e0cc] bg-[#faf7ee] p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#2f3b1f]">
                    {enabled ? "Two-factor authentication is on" : "Two-factor authentication is off"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#6d7452]">
                    {enabled
                      ? `Your admin account currently sends sign-in codes through ${
                          selectedMethod === "phone" ? "your verified mobile number" : "your verified email"
                        }.`
                      : "Turn this on to add an extra layer of protection when you sign in to the admin console."}
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
                    enabled
                      ? "bg-[#edf4e4] text-[#4d6b35]"
                      : "bg-[#f1eee2] text-[#7b7a60]"
                  }`}
                >
                  {enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <button
                type="button"
                onClick={() => canUseEmail && setSelectedMethod("email")}
                disabled={!canUseEmail}
                className={`flex items-start gap-4 rounded-[1.45rem] border px-4 py-4 text-left transition ${
                  selectedMethod === "email"
                    ? "border-[#b9caa1] bg-[#f2f7ea]"
                    : "border-[#e5e0cc] bg-[#faf7ee]"
                } ${
                  canUseEmail ? "hover:bg-[#f4efdf]" : "cursor-not-allowed opacity-70"
                }`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--color-rice-green)] shadow-[0_10px_24px_rgba(78,95,58,0.08)]">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[#2f3b1f]">Email</p>
                    <span className="rounded-full bg-[#edf4e4] px-2.5 py-1 text-[11px] font-semibold text-[#4d6b35]">
                      {canUseEmail ? "Verified" : "Verify first"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#6d7452]">
                    Send admin sign-in verification codes to {user?.email ?? "your email"}.
                  </p>
                </div>
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-[#d5dbc7] bg-white">
                  {selectedMethod === "email" ? (
                    <CheckCircle2 className="h-5 w-5 text-[var(--color-rice-green)]" />
                  ) : (
                    <Circle className="h-4 w-4 text-[#a9af96]" />
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => canUsePhone && setSelectedMethod("phone")}
                disabled={!canUsePhone}
                className={`flex items-start gap-4 rounded-[1.45rem] border px-4 py-4 text-left transition ${
                  selectedMethod === "phone"
                    ? "border-[#b9caa1] bg-[#f2f7ea]"
                    : "border-[#e5e0cc] bg-[#faf7ee]"
                } ${
                  canUsePhone ? "hover:bg-[#f4efdf]" : "cursor-not-allowed opacity-70"
                }`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--color-rice-green)] shadow-[0_10px_24px_rgba(78,95,58,0.08)]">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[#2f3b1f]">Mobile</p>
                    <span className="rounded-full bg-[#edf4e4] px-2.5 py-1 text-[11px] font-semibold text-[#4d6b35]">
                      {canUsePhone ? "Verified" : "Verify first"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#6d7452]">
                    Send admin sign-in verification codes to {user?.mobile ? `+63 ${user.mobile}` : "your mobile number"}.
                  </p>
                </div>
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-[#d5dbc7] bg-white">
                  {selectedMethod === "phone" ? (
                    <CheckCircle2 className="h-5 w-5 text-[var(--color-rice-green)]" />
                  ) : (
                    <Circle className="h-4 w-4 text-[#a9af96]" />
                  )}
                </div>
              </button>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-[#ddd7c4] bg-white/85 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#253119] text-white">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#364127]">
                    Verified methods only
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[#6d7452]">
                    For now, admin two-factor authentication can only use email or mobile methods that you&apos;ve already verified.
                  </p>
                </div>
              </div>
            </div>

            {!hasVerifiedMethod ? (
              <div className="mt-5 rounded-2xl border border-[#e9cabb] bg-[#fff4ef] px-4 py-3 text-sm text-[#a14c34]">
                Verify your email or mobile number first before turning on two-factor authentication.
              </div>
            ) : null}

            {error ? (
              <div className="mt-5 rounded-2xl border border-[#e9cabb] bg-[#fff4ef] px-4 py-3 text-sm text-[#a14c34]">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="mt-5 rounded-2xl border border-[#d6e2c3] bg-[#f3f7ed] px-4 py-3 text-sm text-[#43612e]">
                {message}
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              {!enabled ? (
                <button
                  type="button"
                  onClick={() => {
                    setEnabled(true);
                    setMessage("");
                    setError("");
                  }}
                  disabled={!hasVerifiedMethod || isSaving}
                  className="inline-flex w-full items-center justify-center rounded-[1.4rem] border border-[#d8d4be] bg-white px-4 py-3 text-sm font-semibold text-[#364127] transition hover:bg-[#f4efdf] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Turn On Two-Factor Authentication
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEnabled(false);
                    setMessage("");
                    setError("");
                  }}
                  disabled={isSaving}
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-[#e5d4cb] bg-[#fff7f3] px-4 py-3 text-sm font-semibold text-[#9a543c] transition hover:bg-[#fff0e8] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Turn Off Two-Factor Authentication
                </button>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || (enabled && !selectedMethod)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#253119] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1c2512] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : enabled ? (
                  "Save Two-Factor Settings"
                ) : (
                  "Save and Keep Two-Factor Off"
                )}
              </button>
            </div>
          </>
        )}
      </section>
    </AdminShell>
  );
}
