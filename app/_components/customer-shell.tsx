"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Gift,
  Home,
  LogOut,
  Package,
  Search,
  Settings,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useAuthStore } from "@/app/_stores/auth-store";

type NavItem = {
  href: string;
  id: string;
  label: string;
  icon: typeof Home;
};

const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: Home, href: "/" },
  { id: "orders", label: "Orders", icon: Package, href: "/orders" },
  { id: "shop", label: "Shop", icon: ShoppingBag, href: "/shop" },
  { id: "rewards", label: "Rewards", icon: Gift, href: "/rewards" },
  { id: "account", label: "Account", icon: UserRound, href: "/account" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
];

type CustomerShellProps = {
  children: React.ReactNode;
  searchPlaceholder?: string;
  subtitle: string;
};

export default function CustomerShell({
  children,
  searchPlaceholder = "Search rice variants, past orders, or delivery notes",
  subtitle,
}: CustomerShellProps) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);

  const firstName = useMemo(() => {
    const fallbackName = "Rice Lover";
    const name = user?.name?.trim();

    if (!name) {
      return fallbackName;
    }

    return name.split(" ")[0] || fallbackName;
  }, [user?.name]);

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

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
    <div className="relative flex min-h-screen bg-[linear-gradient(180deg,#f8f6ea_0%,#eef0dd_55%,#e4e9cf_100%)] text-[#253119]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--color-rich-gold)_18%,transparent),transparent_26%),radial-gradient(circle_at_bottom_right,color-mix(in_srgb,var(--color-rice-green)_12%,transparent),transparent_30%)]" />

      <aside className="no-scrollbar sticky top-0 hidden h-screen w-[280px] flex-col overflow-y-auto border-r border-[#d9d7c3] bg-[#f7f4e9]/85 px-6 py-8 backdrop-blur xl:flex">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl px-4 py-3">
            <Image
              src="/logo/sarciariceco.svg"
              alt="Sarcia Rice Co."
              width={190}
              height={46}
              className="h-10 w-auto"
              style={{ width: "auto" }}
              priority
            />
          </div>
        </div>

        <div className="mt-2 rounded-[1.75rem] border border-[#d7d3ba] bg-white/85 p-5 shadow-[0_18px_44px_rgba(78,95,58,0.1)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
            Welcome Back
          </p>
          <p className="mt-3 font-poppins text-2xl font-semibold text-[#2f3b1f]">
            {firstName}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#6d7452]">{subtitle}</p>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveLink(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                  isActive
                    ? "bg-[var(--color-rice-green)] text-white shadow-[0_18px_38px_rgba(77,107,53,0.24)]"
                    : "text-[#536042] hover:bg-white/80"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-[1.75rem] border border-[#ddd7c4] bg-[linear-gradient(135deg,#fffdf7_0%,#f3ecd8_100%)] p-5">
          <p className="text-sm font-semibold text-[#364127]">
            Need a quick reorder?
          </p>
          <p className="mt-2 text-sm leading-6 text-[#6d7452]">
            Your last preferred bag size and delivery notes are already saved.
          </p>
          <button
            type="button"
            className="mt-4 w-full rounded-xl bg-[#253119] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1c2512]"
          >
            Open Smart Reorder
          </button>
        </div>
      </aside>

      <div className="relative flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-[#ddd9c6] bg-[#f8f6ea]/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 xl:px-8">
            <div className="xl:hidden">
              <Image
                src="/logo/sarciariceco.svg"
                alt="Sarcia Rice Co."
                width={132}
                height={32}
                className="h-8 w-auto"
                style={{ width: "auto" }}
                priority
              />
            </div>

            <div className="hidden min-w-0 flex-1 items-center gap-3 rounded-2xl border border-[#dbd7c2] bg-white/85 px-4 py-3 shadow-[0_10px_24px_rgba(78,95,58,0.06)] md:flex">
              <Search className="h-4 w-4 text-[#8b8d70]" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-sm text-[#2f3b1f] outline-none placeholder:text-[#9a9b7d]"
              />
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#dbd7c2] bg-white/85 text-[#526042] shadow-[0_10px_24px_rgba(78,95,58,0.06)] transition hover:bg-white"
              >
                <Bell className="h-5 w-5" />
              </button>
              <div className="hidden items-center gap-3 rounded-2xl border border-[#dbd7c2] bg-white/90 px-3 py-2.5 shadow-[0_10px_24px_rgba(78,95,58,0.06)] sm:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#4d6b35,#769158)] text-sm font-semibold text-white">
                  {firstName.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#2f3b1f]">
                    {user?.name ?? "Guest User"}
                  </p>
                  <p className="truncate text-xs text-[#7b7a60]">
                    {user?.email ?? "customer@sarciariceco.com"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="hidden items-center gap-2 rounded-2xl bg-[#253119] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1c2512] disabled:cursor-not-allowed disabled:opacity-70 lg:inline-flex"
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Signing Out..." : "Logout"}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-4 py-5 pb-28 sm:px-6 md:gap-6 md:py-6 md:pb-32 xl:px-8 xl:pb-10">
          {children}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#d9d6c2] bg-[#faf7ee]/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur xl:hidden">
          <div className="mx-auto grid max-w-3xl grid-cols-6 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveLink(item.href);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2.5 text-[11px] font-semibold transition ${
                    isActive
                      ? "bg-[var(--color-rice-green)] text-white shadow-[0_12px_28px_rgba(77,107,53,0.2)]"
                      : "text-[#697355]"
                  }`}
                >
                  <Icon className="mb-1 h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="hidden items-center gap-2 border-t border-[#ddd9c6] bg-[#f8f6ea] px-6 py-3 text-sm text-[#6d7452] lg:flex xl:hidden">
          <Settings className="h-4 w-4" />
          Desktop sidebar appears on extra-large screens. Mobile and tablet keep the bottom-first navigation pattern.
        </div>
      </div>
    </div>
  );
}
