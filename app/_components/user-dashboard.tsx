"use client";

import {
  Clock3,
  Gift,
  HelpCircle,
  MapPinned,
  Package,
  ShoppingBag,
  Sprout,
  Star,
  Truck,
} from "lucide-react";

import CustomerShell from "@/app/_components/customer-shell";
import { useAuthStore } from "@/app/_stores/auth-store";

export default function UserDashboard() {
  const user = useAuthStore((state) => state.user);
  const firstName = user?.name?.trim().split(" ")[0] || "Rice Lover";

  const shortcuts = [
    {
      title: "Order Rice Again",
      description: "Repeat your last 25kg jasmine order in one tap.",
      icon: ShoppingBag,
      accent: "from-[#4d6b35] to-[#6f8b54]",
    },
    {
      title: "Track Delivery",
      description: "Your Saturday morning delivery is on schedule.",
      icon: Truck,
      accent: "from-[#a88955] to-[#c3a474]",
    },
    {
      title: "Saved Address",
      description: "Sarcia Residence, Zone 3, ready for checkout.",
      icon: MapPinned,
      accent: "from-[#7b8f4a] to-[#9db76a]",
    },
  ];

  const upcomingOrders = [
    {
      id: "RP-24016",
      product: "Premium Dinorado Rice",
      status: "Preparing",
      eta: "Today, 4:30 PM",
      quantity: "2 sacks",
    },
    {
      id: "RP-24010",
      product: "Well-Milled White Rice",
      status: "Scheduled",
      eta: "Saturday, 9:00 AM",
      quantity: "1 sack",
    },
  ];

  const insights = [
    {
      label: "Reward points",
      value: "1,480",
      note: "120 points away from free delivery",
      icon: Star,
    },
    {
      label: "Orders completed",
      value: "18",
      note: "Trusted by your household every month",
      icon: Package,
    },
    {
      label: "Freshness guarantee",
      value: "48h",
      note: "Packed and dispatched within two days",
      icon: Sprout,
    },
  ];

  const accountLinks = [
    {
      title: "Delivery Preferences",
      caption: "Morning slots, contactless handoff, gate notes",
      icon: Clock3,
    },
    {
      title: "Rewards Wallet",
      caption: "Review earned points, vouchers, and redemption history",
      icon: Gift,
    },
    {
      title: "Support Center",
      caption: "Need help with orders, payments, or delivery timing?",
      icon: HelpCircle,
    },
  ];

  return (
    <CustomerShell subtitle="Your pantry-friendly dashboard for orders, deliveries, and rewards.">
          <section className="overflow-hidden rounded-[2rem] border border-[#d8d4be] bg-[#28411c] text-white shadow-[0_30px_80px_rgba(44,60,29,0.22)]">
            <div className="grid gap-6 px-5 py-6 sm:px-6 md:grid-cols-[1.2fr_0.8fr] md:px-8 md:py-8">
              <div className="relative">
                <div className="absolute -left-6 top-0 h-28 w-28 rounded-full bg-[color:color-mix(in_srgb,var(--color-rich-gold)_22%,transparent)] blur-2xl" />
                <p className="relative text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-rich-gold)]">
                  Household Dashboard
                </p>
                <h1 className="relative mt-3 max-w-lg font-poppins text-3xl font-semibold leading-tight sm:text-4xl">
                  Fresh rice planning, delivery tracking, and rewards in one calm place.
                </h1>
                <p className="relative mt-4 max-w-xl text-sm leading-7 text-[#eef2de] sm:text-base">
                  {user?.name
                    ? `Welcome back, ${firstName}. Your account is ready for quick reorders, saved addresses, and delivery updates.`
                    : "Sign in to keep your orders, saved addresses, and rewards in sync across every visit."}
                </p>

                <div className="relative mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#253119] transition hover:bg-[#f4f0e3]"
                  >
                    Start a New Order
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
                  >
                    View Active Delivery
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
                {insights.map((insight) => (
                  <div
                    key={insight.label}
                    className="rounded-[1.6rem] border border-white/10 bg-white/8 p-4 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#e8edd7]">{insight.label}</p>
                      <insight.icon className="h-4 w-4 text-[var(--color-rich-gold)]" />
                    </div>
                    <p className="mt-4 font-poppins text-3xl font-semibold">
                      {insight.value}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#dbe4c1]">
                      {insight.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {shortcuts.map((shortcut) => (
              <article
                key={shortcut.title}
                className="overflow-hidden rounded-[1.75rem] border border-[#ddd9c6] bg-white/90 p-4 shadow-[0_18px_40px_rgba(78,95,58,0.08)] sm:p-5"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${shortcut.accent} text-white shadow-[0_14px_30px_rgba(77,107,53,0.18)]`}
                >
                  <shortcut.icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-[#2f3b1f]">
                  {shortcut.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#6d7452]">
                  {shortcut.description}
                </p>
              </article>
            ))}
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
                    Active Orders
                  </p>
                  <h2 className="mt-2 font-poppins text-2xl font-semibold text-[#2f3b1f]">
                    What&apos;s arriving next
                  </h2>
                </div>
                <button
                  type="button"
                  className="rounded-xl border border-[#d8d4be] bg-[#faf7ee] px-4 py-2 text-sm font-medium text-[#526042] transition hover:bg-[#f4efdf]"
                >
                  Order History
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {upcomingOrders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-[1.5rem] border border-[#e6e1cd] bg-[linear-gradient(180deg,#fffdf8_0%,#f7f3e8_100%)] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8e8c70]">
                          {order.id}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-[#2f3b1f]">
                          {order.product}
                        </h3>
                      </div>
                      <span className="rounded-full bg-[#edf4e4] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#4d6b35]">
                        {order.status}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 text-sm text-[#667052] sm:grid-cols-2">
                      <div className="rounded-2xl bg-white/90 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#9a987b]">
                          Estimated Arrival
                        </p>
                        <p className="mt-2 font-medium text-[#364127]">{order.eta}</p>
                      </div>
                      <div className="rounded-2xl bg-white/90 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#9a987b]">
                          Quantity
                        </p>
                        <p className="mt-2 font-medium text-[#364127]">
                          {order.quantity}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="grid gap-5">
              <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
                  Member Snapshot
                </p>
                <div className="mt-4 rounded-[1.5rem] bg-[linear-gradient(135deg,#f7f1df_0%,#fffdf7_100%)] p-4">
                  <p className="text-sm text-[#7b7a60]">Account Holder</p>
                  <p className="mt-2 text-xl font-semibold text-[#2f3b1f]">
                    {user?.name ?? "Guest User"}
                  </p>
                  <p className="mt-1 text-sm text-[#6d7452]">
                    {user?.email ?? "No email loaded yet"}
                  </p>
                  <p className="mt-1 text-sm text-[#6d7452]">
                    {user?.mobile ? `+63 ${user.mobile}` : "No mobile loaded yet"}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[#e3dfcb] bg-[#faf7ee] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#9a987b]">
                      Membership
                    </p>
                    <p className="mt-2 font-semibold text-[#364127] capitalize">
                      {user?.role ?? "customer"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#e3dfcb] bg-[#faf7ee] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#9a987b]">
                      Status
                    </p>
                    <p className="mt-2 font-semibold text-[#364127]">
                      Ready to order
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
                  Account Tools
                </p>
                <div className="mt-4 space-y-3">
                  {accountLinks.map((link) => (
                    <button
                      key={link.title}
                      type="button"
                      className="flex w-full items-start gap-3 rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] px-4 py-4 text-left transition hover:bg-[#f4efdf]"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--color-rice-green)] shadow-[0_10px_24px_rgba(78,95,58,0.08)]">
                        <link.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#2f3b1f]">
                          {link.title}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[#6d7452]">
                          {link.caption}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </section>
    </CustomerShell>
  );
}
