"use client";

import {
  AlertTriangle,
  Clock3,
  LayoutDashboard,
  ShieldCheck,
  UsersRound,
  Warehouse,
} from "lucide-react";

import AdminShell from "@/app/admin/_components/admin-shell";
import { useAuthStore } from "@/app/_stores/auth-store";

export default function AdminDashboard() {
  const user = useAuthStore((state) => state.user);
  const firstName = user?.name?.trim().split(" ")[0] || "Admin";

  const overviewStats = [
    {
      label: "Orders needing review",
      value: "14",
      note: "Prioritize exceptions, edits, and manual follow-ups first.",
      icon: AlertTriangle,
    },
    {
      label: "Staff-ready today",
      value: "8",
      note: "Admin and operations accounts currently active for the shift.",
      icon: UsersRound,
    },
    {
      label: "Stock watch items",
      value: "5",
      note: "Low-inventory lines to review before the next order wave.",
      icon: Warehouse,
    },
  ];

  const actionCards = [
    {
      title: "Admin Account Review",
      description: "Check your security posture, recovery methods, and personal details.",
      icon: ShieldCheck,
    },
    {
      title: "Operations Queue",
      description: "Monitor unresolved items that need human review today.",
      icon: Clock3,
    },
    {
      title: "Oversight Snapshot",
      description: "Keep important admin controls visible without leaving the dashboard.",
      icon: LayoutDashboard,
    },
  ];

  return (
    <AdminShell
      subtitle="Your operations-focused workspace for oversight, security, and daily admin control."
      searchPlaceholder="Search admin sections, security controls, or dashboard tools"
    >
      <section className="overflow-hidden rounded-[2rem] border border-[#d8d4be] bg-[#28411c] text-white shadow-[0_30px_80px_rgba(44,60,29,0.22)]">
        <div className="grid gap-6 px-5 py-6 sm:px-6 md:grid-cols-[1.15fr_0.85fr] md:px-8 md:py-8">
          <div className="relative">
            <div className="absolute -left-6 top-0 h-28 w-28 rounded-full bg-[color:color-mix(in_srgb,var(--color-rich-gold)_22%,transparent)] blur-2xl" />
            <p className="relative text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-rich-gold)]">
              Admin Dashboard
            </p>
            <h1 className="relative mt-3 max-w-xl font-poppins text-3xl font-semibold leading-tight sm:text-4xl">
              Oversight, security, and admin readiness in one dedicated workspace.
            </h1>
            <p className="relative mt-4 max-w-2xl text-sm leading-7 text-[#eef2de] sm:text-base">
              Welcome back, {firstName}. This dashboard is designed to keep your account secure while helping you stay close to daily operations and review priorities.
            </p>
          </div>

          <div
            id="operations-overview"
            className="grid gap-3 sm:grid-cols-3 md:grid-cols-1"
          >
            {overviewStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[1.6rem] border border-white/10 bg-white/8 p-4 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#e8edd7]">{stat.label}</p>
                  <stat.icon className="h-4 w-4 text-[var(--color-rich-gold)]" />
                </div>
                <p className="mt-4 font-poppins text-3xl font-semibold">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#dbe4c1]">
                  {stat.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="quick-actions"
        className="grid gap-4 md:grid-cols-3"
      >
        {actionCards.map((card) => (
          <article
            key={card.title}
            className="overflow-hidden rounded-[1.75rem] border border-[#ddd9c6] bg-white/90 p-4 shadow-[0_18px_40px_rgba(78,95,58,0.08)] sm:p-5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#4d6b35,#6f8b54)] text-white shadow-[0_14px_30px_rgba(77,107,53,0.18)]">
              <card.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[#2f3b1f]">
              {card.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6d7452]">
              {card.description}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
            Admin Priorities
          </p>
          <div className="mt-5 space-y-3">
            {[
              {
                title: "Security checks",
                caption: "Keep password, two-factor authentication, and trusted devices reviewed regularly.",
              },
              {
                title: "Recovery readiness",
                caption: "Make sure email and mobile details stay current for account recovery and verification prompts.",
              },
              {
                title: "Daily oversight",
                caption: "Use this side of the app to stay oriented before deeper order and inventory tools are added.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[1.45rem] border border-[#e5e0cc] bg-[#faf7ee] px-4 py-4"
              >
                <p className="text-sm font-semibold text-[#2f3b1f]">
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#6d7452]">
                  {item.caption}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-[#ddd9c6] bg-[linear-gradient(135deg,#fffdf7_0%,#f3ecd8_100%)] p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
            Admin Snapshot
          </p>
          <div className="mt-4 rounded-[1.5rem] bg-white/90 p-4">
            <p className="text-sm text-[#7b7a60]">Signed in as</p>
            <p className="mt-2 text-xl font-semibold text-[#2f3b1f]">
              {user?.name ?? "Admin User"}
            </p>
            <p className="mt-1 text-sm text-[#6d7452]">
              {user?.email ?? "admin@sarciariceco.com"}
            </p>
            <p className="mt-1 text-sm capitalize text-[#6d7452]">
              Role: {user?.role ?? "admin"}
            </p>
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
