"use client";
import Link from "next/link";
import {
  BellRing,
  ChevronRight,
  KeyRound,
  LaptopMinimal,
  LoaderCircle,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  ShieldPlus,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { savePendingVerificationUser } from "@/app/(public)/(auth)/register/_lib/pending-verification";
import AdminShell from "@/app/admin/_components/admin-shell";
import { useAuthStore } from "@/app/_stores/auth-store";

const supportItems = [
  {
    title: "Privacy & Account Care",
    caption: "Read how admin profile, verification, and account-care data are handled.",
    icon: ShieldCheck,
    href: "/admin/settings/privacy-account-care",
  },
  {
    title: "Alerts & Notifications",
    caption: "Control admin reminders, security alerts, and browser notification preferences.",
    icon: BellRing,
    href: "/admin/settings/alerts-notifications",
  },
];

export default function AdminSettingsPageContent() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [activeVerificationMethod, setActiveVerificationMethod] = useState<
    "email" | "phone" | null
  >(null);

  const securitySections = [
    {
      id: "login-security",
      title: "Login & Security",
      items: [
        {
          title: "Change Password",
          caption: "Update your password and keep admin sign-in secure.",
          icon: KeyRound,
          status: "Recommended",
          href: "/admin/settings/change-password",
        },
        {
          title: "Trusted Devices",
          caption: "Review devices and sessions that should remain recognized.",
          icon: LaptopMinimal,
          status: "Review regularly",
          href: "/admin/settings/trusted-devices",
        },
        {
          title: "Two-Factor Authentication",
          caption:
            "Add an extra step for sign-in and sensitive admin account changes.",
          icon: ShieldPlus,
          status: user?.two_factor_enabled ? "Enabled" : "Recommended",
          href: "/admin/settings/two-factor-authentication",
        },
      ],
    },
    {
      id: "admin-identity",
      title: "Admin Identity",
      items: [
        {
          title: "Email Address",
          caption: "Use a verified email that can receive recovery and security prompts.",
          icon: Mail,
          status: user?.email_verified_at ? "Verified" : "Needs verification",
          href: "/admin/settings/change-email",
        },
        {
          title: "Mobile Number",
          caption: "Keep a verified mobile number ready for OTP and fallback recovery.",
          icon: Phone,
          status: user?.mobile_verified_at ? "Verified" : "Needs verification",
          href: "/admin/settings/change-mobile",
        },
      ],
    },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      clearUser();
      window.location.href = "/login";
    }
  };

  const handleStartVerification = async (method: "email" | "phone") => {
    if (!user) {
      return;
    }

    setVerificationError("");
    setActiveVerificationMethod(method);

    try {
      savePendingVerificationUser(user, {
        source: "settings",
        returnTo: "/admin/settings",
      });

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
        setVerificationError(
          data?.message ?? "Unable to send the verification code."
        );
        return;
      }

      router.push(
        `/verify-otp?method=${method}&source=settings&returnTo=${encodeURIComponent("/admin/settings")}`
      );
    } catch {
      setVerificationError(
        "Something went wrong while sending the verification code."
      );
    } finally {
      setActiveVerificationMethod(null);
    }
  };

  return (
    <AdminShell
      subtitle="Security, recovery readiness, and admin account controls in one dedicated place."
      searchPlaceholder="Search admin security, verification, or account care"
    >
      <section className="overflow-hidden rounded-[2rem] border border-[#d8d4be] bg-white/92 shadow-[0_30px_80px_rgba(44,60,29,0.12)]">
        <div className="relative bg-[linear-gradient(135deg,#2c441d_0%,#3d5a2b_52%,#5d7f42_100%)] px-5 py-7 text-white sm:px-7 sm:py-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--color-rich-gold)_22%,transparent),transparent_24%),radial-gradient(circle_at_bottom_right,color-mix(in_srgb,#ffffff_10%,transparent),transparent_28%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-rich-gold)]">
                Admin Settings
              </p>
              <h1 className="mt-3 font-poppins text-3xl font-semibold sm:text-4xl">
                Admin security and identity controls deserve their own focused workspace.
              </h1>
              <p className="mt-4 text-sm leading-7 text-[#eef2de] sm:text-base">
                This page keeps admin security, verified recovery methods, and account-care tools close together without customer delivery preferences mixed in.
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-white/12 bg-white/10 p-4 backdrop-blur-sm sm:min-w-[280px]">
              <p className="text-xs uppercase tracking-[0.18em] text-[#d9e4be]">
                Active admin
              </p>
              <div className="mt-3 flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/14 text-white">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {user?.name ?? "Admin User"}
                  </p>
                  <p className="mt-1 text-sm text-[#eef2de]">
                    {user?.email ?? "admin@sarciariceco.com"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="grid gap-5">
          {securitySections.map((section) => (
            <section
              key={section.title}
              id={section.id}
              className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
                {section.title}
              </p>

              <div className="mt-5 space-y-3">
                {section.items.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href ?? "#"}
                    aria-disabled={!item.href}
                    onClick={(event) => {
                      if (!item.href) {
                        event.preventDefault();
                      }
                    }}
                    className={`flex w-full items-start gap-4 rounded-[1.45rem] border border-[#e5e0cc] px-4 py-4 text-left transition ${
                      item.href
                        ? "bg-[#faf7ee] hover:bg-[#f4efdf]"
                        : "cursor-default bg-[#f8f5ea] opacity-90"
                    }`}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--color-rice-green)] shadow-[0_10px_24px_rgba(78,95,58,0.08)]">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-[#2f3b1f]">
                          {item.title}
                        </p>
                        <span className="rounded-full bg-[#edf4e4] px-2.5 py-1 text-[11px] font-semibold text-[#4d6b35]">
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#6d7452]">
                        {item.caption}
                      </p>
                    </div>
                    {item.href ? (
                      <ChevronRight className="mt-1 h-5 w-5 text-[#8e8c70]" />
                    ) : null}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="grid gap-5">
          <section
            id="verifications"
            className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
              Verifications
            </p>

            <div className="mt-5 grid gap-3">
              <div className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#9a987b]">
                      Email Verification
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#2f3b1f]">
                      {user?.email_verified_at ? "Verified" : "Pending verification"}
                    </p>
                  </div>
                  {!user?.email_verified_at ? (
                    <button
                      type="button"
                      onClick={() => handleStartVerification("email")}
                      disabled={activeVerificationMethod !== null}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-[#253119] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1c2512] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:min-w-[120px]"
                    >
                      {activeVerificationMethod === "email" ? (
                        <span className="flex items-center gap-2">
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        "Verify Email"
                      )}
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#9a987b]">
                      Mobile Number Verification
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#2f3b1f]">
                      {user?.mobile_verified_at ? "Verified" : "Pending verification"}
                    </p>
                  </div>
                  {!user?.mobile_verified_at ? (
                    <button
                      type="button"
                      onClick={() => handleStartVerification("phone")}
                      disabled={activeVerificationMethod !== null}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-[#253119] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1c2512] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:min-w-[124px]"
                    >
                      {activeVerificationMethod === "phone" ? (
                        <span className="flex items-center gap-2">
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        "Verify Mobile Number"
                      )}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {verificationError ? (
              <div className="mt-4 rounded-2xl border border-[#e9cabb] bg-[#fff4ef] px-4 py-3 text-sm text-[#a14c34]">
                {verificationError}
              </div>
            ) : null}
          </section>

          <section
            id="account-care"
            className="rounded-[2rem] border border-[#ddd9c6] bg-[linear-gradient(135deg,#fffdf7_0%,#f3ecd8_100%)] p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
              Account Care
            </p>
            <div className="mt-4 space-y-3">
              {supportItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href ?? "#"}
                  aria-disabled={!item.href}
                  onClick={(event) => {
                    if (!item.href) {
                      event.preventDefault();
                    }
                  }}
                  className="flex w-full items-start gap-3 rounded-[1.4rem] border border-[#e5e0cc] bg-white/90 px-4 py-4 text-left transition hover:bg-[#faf7ee]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#faf7ee] text-[var(--color-rice-green)]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#2f3b1f]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[#6d7452]">
                      {item.caption}
                    </p>
                  </div>
                  <ChevronRight className="mt-1 h-5 w-5 text-[#8e8c70]" />
                </Link>
              ))}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[1.4rem] bg-[#253119] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1c2512] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? "Signing Out..." : "Logout"}
            </button>
          </section>
        </div>
      </section>
    </AdminShell>
  );
}
