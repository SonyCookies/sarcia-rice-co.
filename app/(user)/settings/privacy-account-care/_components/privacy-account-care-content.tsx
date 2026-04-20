"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Database,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";

import CustomerShell from "@/app/(user)/_components/customer-shell";

const privacySections = [
  {
    title: "Profile Information",
    caption:
      "Your name, email address, and mobile number are used to keep your account accessible, send order updates, and support account recovery.",
    icon: ShieldCheck,
  },
  {
    title: "Orders & Deliveries",
    caption:
      "Order history, saved addresses, delivery notes, and schedule preferences help us process purchases and make future checkouts smoother.",
    icon: PackageCheck,
  },
  {
    title: "Verification & Security",
    caption:
      "Verification codes, trusted devices, password updates, and two-factor settings are used only to protect sign-ins and sensitive account changes.",
    icon: LockKeyhole,
  },
  {
    title: "Delivery Coordination",
    caption:
      "Mobile details and address-related preferences may be used for rider coordination, delivery timing, and order follow-up communication.",
    icon: Truck,
  },
];

const careNotes = [
  "Keep your email and mobile number up to date so recovery and OTP delivery stay reliable.",
  "Review trusted devices regularly and remove anything you no longer recognize.",
  "Use two-factor authentication if you want extra protection on sign-in and sensitive account changes.",
  "Only verified contact methods can be used for recovery and two-factor authentication.",
];

export default function PrivacyAccountCareContent() {
  return (
    <CustomerShell
      subtitle="A simple overview of how your account details support security, orders, and delivery communication."
      searchPlaceholder="Search privacy, account care, or data handling help"
    >
      <div>
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 rounded-full border border-[#d8d4be] bg-[#faf7ee] px-4 py-2 text-sm font-semibold text-[var(--color-rice-green)] transition hover:bg-[#f4efdf] hover:text-[color:color-mix(in_srgb,var(--color-rice-green)_85%,black)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to settings overview
        </Link>
      </div>

      <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
        <div className="flex items-start gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
              Privacy & Account Care
            </p>
            <p className="mt-1 text-sm leading-6 text-[#6d7452]">
              Here&apos;s a practical summary of how Sarcia Rice Co. uses your account details to support orders, deliveries, and account protection.
            </p>
          </div>
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
                Good account care habits
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
    </CustomerShell>
  );
}
