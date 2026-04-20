"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BellRing,
  Database,
  LockKeyhole,
  UserRound,
  Workflow,
} from "lucide-react";

import AdminShell from "@/app/admin/_components/admin-shell";

const privacySections = [
  {
    title: "Admin Profile Information",
    caption:
      "Your admin name, email address, and mobile number are used to identify your access level, support account recovery, and keep security communication reliable.",
    icon: UserRound,
  },
  {
    title: "Verification & Security",
    caption:
      "Verification codes, password changes, trusted devices, and two-factor settings are used only to protect sign-ins and sensitive admin account changes.",
    icon: LockKeyhole,
  },
  {
    title: "Operational Alerts",
    caption:
      "Admin reminders, security notices, and browser push preferences help deliver timely updates about account activity and important admin-facing events.",
    icon: BellRing,
  },
  {
    title: "Account-Care Workflows",
    caption:
      "Session activity, verified recovery methods, and account-care preferences support safe admin access and smoother follow-up when security actions are needed.",
    icon: Workflow,
  },
];

const careNotes = [
  "Keep your admin email and mobile number current so recovery and OTP delivery stay dependable.",
  "Review trusted devices regularly and remove anything you no longer recognize.",
  "Use two-factor authentication for stronger protection on admin sign-in and sensitive account changes.",
  "Only verified contact methods should be relied on for recovery, alerts, and two-factor authentication.",
];

export default function AdminPrivacyAccountCareContent() {
  return (
    <AdminShell
      subtitle="A simple overview of how admin identity, verification, and account-care details support secure access."
      searchPlaceholder="Search admin privacy, account care, or data handling help"
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
            Privacy & Account Care
          </p>
          <p className="mt-1 text-sm leading-6 text-[#6d7452]">
            Here&apos;s a practical summary of how Sarcia Rice Co. uses admin account details to support secure access, verification, and account-care communication.
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          {privacySections.map((section) => (
            <div
              key={section.title}
              className="rounded-[1.5rem] border border-[#e5e0cc] bg-[#faf7ee] p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--color-rice-green)] shadow-[0_10px_24px_rgba(78,95,58,0.08)]">
                  <section.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#2f3b1f]">
                    {section.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#6d7452]">
                    {section.caption}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[1.6rem] border border-[#ddd7c4] bg-white/85 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#253119] text-white">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#364127]">
                Good admin account-care habits
              </p>
              <div className="mt-3 space-y-2">
                {careNotes.map((note) => (
                  <p
                    key={note}
                    className="text-sm leading-6 text-[#6d7452]"
                  >
                    {note}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
