"use client";

import {
  BellRing,
  ChevronRight,
  KeyRound,
  LaptopMinimal,
  LockKeyhole,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";

import CustomerShell from "@/app/(user)/_components/customer-shell";
import { useAuthStore } from "@/app/_stores/auth-store";

const securitySections = [
  {
    title: "Login & Security",
    description:
      "Protect your account access, update your password, and keep your login methods current.",
    items: [
      {
        title: "Change Password",
        caption: "Update your password and keep your sign-in secure.",
        icon: KeyRound,
        status: "Recommended",
      },
      {
        title: "Trusted Devices",
        caption: "Review recent devices and session activity.",
        icon: LaptopMinimal,
        status: "Coming soon",
      },
    ],
  },
  {
    title: "Contact Information",
    description:
      "Manage the details tied to verification, delivery updates, and account recovery.",
    items: [
      {
        title: "Email Address",
        caption: "Change your email and re-verify when needed.",
        icon: Mail,
        status: "Verification required",
      },
      {
        title: "Mobile Number",
        caption: "Update your number for OTP and rider notifications.",
        icon: Phone,
        status: "Verification required",
      },
    ],
  },
];

const supportItems = [
  {
    title: "Privacy & Account Care",
    caption: "Read how your profile, orders, and verification data are handled.",
    icon: ShieldCheck,
  },
  {
    title: "Alerts & Notifications",
    caption: "Control account reminders, order alerts, and delivery notices.",
    icon: BellRing,
  },
];

export default function SettingsPageContent() {
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  return (
    <CustomerShell
      subtitle="Security, sign-in details, and account controls in one dedicated place."
      searchPlaceholder="Search security settings, email updates, or account controls"
    >
      <section className="overflow-hidden rounded-[2rem] border border-[#d8d4be] bg-white/92 shadow-[0_30px_80px_rgba(44,60,29,0.12)]">
        <div className="relative bg-[linear-gradient(135deg,#2c441d_0%,#3d5a2b_52%,#5d7f42_100%)] px-5 py-7 text-white sm:px-7 sm:py-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--color-rich-gold)_22%,transparent),transparent_24%),radial-gradient(circle_at_bottom_right,color-mix(in_srgb,#ffffff_10%,transparent),transparent_28%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-rich-gold)]">
                Settings
              </p>
              <h1 className="mt-3 font-poppins text-3xl font-semibold sm:text-4xl">
                Security and account controls deserve their own calm space.
              </h1>
              <p className="mt-4 text-sm leading-7 text-[#eef2de] sm:text-base">
                Sensitive updates like email, mobile number, and password changes
                belong here so they can follow stricter verification and recovery
                flows.
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-white/12 bg-white/10 p-4 backdrop-blur-sm sm:min-w-[280px]">
              <p className="text-xs uppercase tracking-[0.18em] text-[#d9e4be]">
                Active account
              </p>
              <div className="mt-3 flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/14 text-white">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {user?.name ?? "Guest User"}
                  </p>
                  <p className="mt-1 text-sm text-[#eef2de]">
                    {user?.email ?? "customer@sarciariceco.com"}
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
              className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
                {section.title}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6d7452]">
                {section.description}
              </p>

              <div className="mt-5 space-y-3">
                {section.items.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    className="flex w-full items-start gap-4 rounded-[1.45rem] border border-[#e5e0cc] bg-[#faf7ee] px-4 py-4 text-left transition hover:bg-[#f4efdf]"
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
                    <ChevronRight className="mt-1 h-5 w-5 text-[#8e8c70]" />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="grid gap-5">
          <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
              Security Snapshot
            </p>

            <div className="mt-5 grid gap-3">
              <div className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#9a987b]">
                  Email status
                </p>
                <p className="mt-2 text-sm font-semibold text-[#2f3b1f]">
                  {user?.email_verified_at ? "Verified and active" : "Needs verification"}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#9a987b]">
                  Mobile status
                </p>
                <p className="mt-2 text-sm font-semibold text-[#2f3b1f]">
                  {user?.mobile_verified_at ? "Verified and active" : "Needs verification"}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#9a987b]">
                  Password
                </p>
                <p className="mt-2 text-sm font-semibold text-[#2f3b1f]">
                  Last updated through secure credential flow
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-[#ddd9c6] bg-[linear-gradient(135deg,#fffdf7_0%,#f3ecd8_100%)] p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
              Account Care
            </p>
            <div className="mt-4 space-y-3">
              {supportItems.map((item) => (
                <button
                  key={item.title}
                  type="button"
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
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-[#ddd7c4] bg-white/85 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#253119] text-white">
                  <LockKeyhole className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#364127]">
                    Sensitive changes belong here
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[#6d7452]">
                    We can keep account profile pages focused and friendly while
                    this space handles stricter verification and security rules.
                  </p>
                </div>
              </div>
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
    </CustomerShell>
  );
}

