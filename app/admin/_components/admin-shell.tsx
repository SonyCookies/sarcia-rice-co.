"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Package,
  Search,
  Settings,
  ShieldCheck,
  UsersRound,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useAuthStore } from "@/app/_stores/auth-store";

type NavItem = {
  description: string;
  href: string;
  id: string;
  label: string;
  keywords: string[];
  icon: typeof LayoutDashboard;
};

const navItems: NavItem[] = [
  {
    description: "Review the admin dashboard, operations summary, and quick actions.",
    href: "/admin",
    icon: LayoutDashboard,
    id: "admin-dashboard",
    keywords: ["admin", "dashboard", "overview", "operations", "summary"],
    label: "Dashboard",
  },
  {
    description: "Manage rice products, prices, stock availability, and archived items.",
    href: "/admin/products",
    icon: Package,
    id: "admin-products",
    keywords: ["inventory", "products", "stock", "rice", "catalog"],
    label: "Inventory",
  },
  {
    description: "Review every user account, role, and verification status in the system.",
    href: "/admin/users",
    icon: UsersRound,
    id: "admin-users",
    keywords: ["users", "customers", "accounts", "directory", "members", "all users"],
    label: "Users",
  },
  {
    description: "Manage your admin profile, access snapshot, and security readiness.",
    href: "/admin/account",
    icon: UserRound,
    id: "admin-account",
    keywords: [
      "admin account",
      "account",
      "profile",
      "identity",
      "admin profile",
      "security readiness",
      "access overview",
    ],
    label: "Account",
  },
  {
    description: "Review admin security settings, verifications, alerts, and account care links.",
    href: "/admin/settings",
    icon: Settings,
    id: "admin-settings",
    keywords: [
      "admin settings",
      "settings",
      "security",
      "verification",
      "alerts",
      "notifications",
      "trusted devices",
      "two factor",
      "2fa",
    ],
    label: "Settings",
  },
];

const searchItems: NavItem[] = [
  ...navItems,
  {
    description: "Change your admin password from the dedicated security page.",
    href: "/admin/settings/change-password",
    icon: Settings,
    id: "admin-settings-change-password",
    keywords: [
      "change password",
      "admin password",
      "password",
      "password update",
      "credential",
      "credentials",
    ],
    label: "Change Password",
  },
  {
    description: "Manage admin two-factor authentication and choose how sensitive actions are verified.",
    href: "/admin/settings/two-factor-authentication",
    icon: Settings,
    id: "admin-settings-two-factor",
    keywords: [
      "two factor",
      "2fa",
      "two-factor authentication",
      "admin 2fa",
      "otp",
      "verification method",
      "security code",
    ],
    label: "Two-Factor Authentication",
  },
  {
    description: "Update your admin email address and verify it again for recovery and security alerts.",
    href: "/admin/settings/change-email",
    icon: Settings,
    id: "admin-settings-change-email",
    keywords: [
      "change email",
      "email",
      "email address",
      "update email",
      "new email",
      "recovery email",
      "verify email",
      "email verification",
    ],
    label: "Change Email",
  },
  {
    description: "Update your admin mobile number and re-verify it for OTP and recovery prompts.",
    href: "/admin/settings/change-mobile",
    icon: Settings,
    id: "admin-settings-change-mobile",
    keywords: [
      "change mobile",
      "mobile",
      "phone",
      "number",
      "mobile number",
      "update mobile",
      "update phone",
      "otp number",
      "verify mobile",
      "mobile verification",
      "phone verification",
    ],
    label: "Change Mobile Number",
  },
  {
    description: "Read how admin profile, verification, and account-care details are handled.",
    href: "/admin/settings/privacy-account-care",
    icon: Settings,
    id: "admin-settings-privacy-account-care",
    keywords: [
      "privacy",
      "account care",
      "admin privacy",
      "data handling",
      "verification data",
      "admin profile data",
    ],
    label: "Privacy & Account Care",
  },
  {
    description: "Control admin reminders, security alerts, and browser notification preferences.",
    href: "/admin/settings/alerts-notifications",
    icon: Bell,
    id: "admin-settings-alerts-notifications",
    keywords: [
      "alerts",
      "notifications",
      "push notifications",
      "browser push",
      "security alerts",
      "admin reminders",
      "communication settings",
    ],
    label: "Alerts & Notifications",
  },
  {
    description: "Review browsers and devices that can skip admin login verification.",
    href: "/admin/settings/trusted-devices",
    icon: Settings,
    id: "admin-settings-trusted-devices",
    keywords: [
      "trusted devices",
      "trusted device",
      "device",
      "browser",
      "session",
      "recognized device",
      "admin device",
    ],
    label: "Trusted Devices",
  },
  {
    description: "Search all user accounts, roles, and verification status from one admin-only directory.",
    href: "/admin/users",
    icon: UsersRound,
    id: "admin-users-directory",
    keywords: [
      "users",
      "all users",
      "customers",
      "accounts",
      "members",
      "directory",
      "user list",
      "account list",
    ],
    label: "Users Directory",
  },
  {
    description: "See operations highlights, admin priorities, and daily oversight metrics.",
    href: "/admin#operations-overview",
    icon: LayoutDashboard,
    id: "admin-operations-overview",
    keywords: [
      "operations overview",
      "metrics",
      "admin metrics",
      "admin priorities",
      "overview",
    ],
    label: "Operations Overview",
  },
  {
    description: "Jump to quick admin actions for account care, reviews, and escalation workflows.",
    href: "/admin#quick-actions",
    icon: LayoutDashboard,
    id: "admin-quick-actions",
    keywords: ["quick actions", "admin actions", "escalation", "workflow"],
    label: "Quick Actions",
  },
  {
    description: "Review your admin identity and editable personal information.",
    href: "/admin/account#personal-information",
    icon: UserRound,
    id: "admin-personal-information",
    keywords: ["personal information", "admin name", "admin email", "admin mobile"],
    label: "Personal Information",
  },
  {
    description: "Check your admin access role, recovery readiness, and protected-account status.",
    href: "/admin/account#access-overview",
    icon: ShieldCheck,
    id: "admin-access-overview",
    keywords: [
      "access overview",
      "admin access",
      "admin role",
      "recovery",
      "protected account",
    ],
    label: "Access Overview",
  },
  {
    description: "Review security controls including password, trusted devices, and two-factor setup.",
    href: "/admin/settings#login-security",
    icon: Settings,
    id: "admin-login-security",
    keywords: [
      "login security",
      "change password",
      "trusted devices",
      "two factor",
      "2fa",
      "security controls",
    ],
    label: "Login & Security",
  },
  {
    description: "Open the admin identity section for email, mobile number, and recovery methods.",
    href: "/admin/settings#admin-identity",
    icon: Settings,
    id: "admin-identity",
    keywords: [
      "admin identity",
      "email address",
      "mobile number",
      "recovery method",
      "change email",
      "change mobile",
    ],
    label: "Admin Identity",
  },
  {
    description: "Go to the verification section for email and mobile status checks.",
    href: "/admin/settings#verifications",
    icon: Settings,
    id: "admin-verifications",
    keywords: [
      "verification",
      "verifications",
      "verify",
      "verified",
      "email verification",
      "mobile verification",
    ],
    label: "Verifications",
  },
  {
    description: "Review admin alerts, notifications, and privacy links.",
    href: "/admin/settings#account-care",
    icon: Settings,
    id: "admin-account-care",
    keywords: [
      "account care",
      "alerts",
      "notifications",
      "privacy",
      "admin alerts",
      "admin notifications",
    ],
    label: "Account Care",
  },
];

type AdminShellProps = {
  children: React.ReactNode;
  searchPlaceholder?: string;
  subtitle: string;
};

export default function AdminShell({
  children,
  searchPlaceholder = "Search admin settings, access controls, or account help",
  subtitle,
}: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);

  const firstName = useMemo(() => {
    const fallbackName = "Admin";
    const name = user?.name?.trim();

    if (!name) {
      return fallbackName;
    }

    return name.split(" ")[0] || fallbackName;
  }, [user?.name]);

  const isActiveLink = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  };

  const searchResults = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

    return searchItems
      .map((item) => {
        const haystacks = [
          item.label.toLowerCase(),
          ...item.keywords.map((keyword) => keyword.toLowerCase()),
        ];
        let score = 0;
        let matchedTerm = item.label;

        haystacks.forEach((term) => {
          if (term === normalizedQuery) {
            score += 120;
            matchedTerm = term;
            return;
          }

          if (term.startsWith(normalizedQuery)) {
            score += 85;
            matchedTerm = term;
            return;
          }

          if (term.includes(normalizedQuery)) {
            score += 60;
            matchedTerm = term;
            return;
          }

          if (queryTokens.every((token) => term.includes(token))) {
            score += 40;
            matchedTerm = term;
          }
        });

        if (item.description.toLowerCase().includes(normalizedQuery)) {
          score += 20;
        }

        return {
          ...item,
          matchedTerm,
          score,
        };
      })
      .filter((item) => item.score > 0)
      .sort((leftItem, rightItem) => rightItem.score - leftItem.score)
      .slice(0, 6);
  }, [searchQuery]);

  const showSearchPanel = isSearchFocused && searchQuery.trim().length > 0;

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

  const handleSelectSearchResult = (href: string) => {
    setSearchQuery("");
    setIsSearchFocused(false);
    router.push(href);
  };

  return (
    <div className="relative flex min-h-screen bg-[linear-gradient(180deg,#f7f3e8_0%,#ecefe0_55%,#e3e9d9_100%)] text-[#253119]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--color-rich-gold)_18%,transparent),transparent_28%),radial-gradient(circle_at_bottom_right,color-mix(in_srgb,var(--color-rice-green)_10%,transparent),transparent_30%)]" />

      <aside className="no-scrollbar sticky top-0 hidden h-screen w-[280px] flex-col overflow-y-auto border-r border-[#d9d7c3] bg-[#f7f4e9]/88 px-6 py-8 backdrop-blur xl:flex">
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
            Admin Console
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
            Admin priorities
          </p>
          <p className="mt-2 text-sm leading-6 text-[#6d7452]">
            Keep sign-in security, customer messaging, and account recovery settings ready for daily operations.
          </p>
          <button
            type="button"
            className="mt-4 w-full rounded-xl bg-[#253119] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1c2512]"
          >
            Review Today&apos;s Priorities
          </button>
        </div>
      </aside>

      <div className="relative flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-[#ddd9c6] bg-[#f8f6ea]/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl px-4 py-4 sm:px-6 xl:px-8">
            <div className="flex w-full items-center gap-3">
              <div
                className={`origin-left shrink-0 overflow-hidden transition-all duration-300 ease-out xl:hidden ${
                  isSearchFocused
                    ? "pointer-events-none max-w-0 scale-95 opacity-0"
                    : "max-w-[132px] scale-100 opacity-100"
                }`}
              >
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

              <div
                className={`relative min-w-0 transition-all duration-300 ease-out md:hidden ${
                  isSearchFocused ? "flex-[1.35]" : "flex-1"
                }`}
              >
                <div
                  className={`flex w-full items-center gap-3 rounded-2xl border border-[#dbd7c2] bg-white/85 px-4 py-3 shadow-[0_10px_24px_rgba(78,95,58,0.06)] transition-all duration-300 ease-out ${
                    isSearchFocused
                      ? "scale-[1.01] shadow-[0_16px_34px_rgba(78,95,58,0.12)]"
                      : "scale-100"
                  }`}
                >
                  <Search className="h-4 w-4 shrink-0 text-[#8b8d70]" />
                  <input
                    type="text"
                    value={searchQuery}
                    placeholder={searchPlaceholder}
                    onBlur={() => {
                      window.setTimeout(() => {
                        setIsSearchFocused(false);
                      }, 120);
                    }}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && searchResults[0]) {
                        event.preventDefault();
                        handleSelectSearchResult(searchResults[0].href);
                      }
                    }}
                    className="w-full min-w-0 bg-transparent text-sm text-[#2f3b1f] outline-none placeholder:text-[#9a9b7d]"
                  />
                </div>

                {showSearchPanel ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-30 overflow-hidden rounded-[1.4rem] border border-[#d8d4be] bg-white/95 shadow-[0_20px_44px_rgba(78,95,58,0.14)]">
                    {searchResults.length > 0 ? (
                      <div className="p-2">
                        {searchResults.map((item) => {
                          const Icon = item.icon;

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onMouseDown={() => handleSelectSearchResult(item.href)}
                              className="flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-[#f6f2e7]"
                            >
                              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f4efe0] text-[var(--color-rice-green)]">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-[#2f3b1f]">
                                  {item.label}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-[#6d7452]">
                                  {item.description}
                                </p>
                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9a987b]">
                                  Match: {item.matchedTerm}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-4 py-4 text-sm text-[#6d7452]">
                        No matching admin section found for &quot;{searchQuery.trim()}&quot;.
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="relative hidden min-w-0 flex-1 md:flex">
                <div className="flex w-full items-center gap-3 rounded-2xl border border-[#dbd7c2] bg-white/85 px-4 py-3 shadow-[0_10px_24px_rgba(78,95,58,0.06)]">
                  <Search className="h-4 w-4 text-[#8b8d70]" />
                  <input
                    type="text"
                    value={searchQuery}
                    placeholder={searchPlaceholder}
                    onBlur={() => {
                      window.setTimeout(() => {
                        setIsSearchFocused(false);
                      }, 120);
                    }}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && searchResults[0]) {
                        event.preventDefault();
                        handleSelectSearchResult(searchResults[0].href);
                      }
                    }}
                    className="w-full bg-transparent text-sm text-[#2f3b1f] outline-none placeholder:text-[#9a9b7d]"
                  />
                </div>

                {showSearchPanel ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] overflow-hidden rounded-[1.4rem] border border-[#d8d4be] bg-white/95 shadow-[0_20px_44px_rgba(78,95,58,0.14)]">
                    {searchResults.length > 0 ? (
                      <div className="p-2">
                        {searchResults.map((item) => {
                          const Icon = item.icon;

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onMouseDown={() => handleSelectSearchResult(item.href)}
                              className="flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-[#f6f2e7]"
                            >
                              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f4efe0] text-[var(--color-rice-green)]">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-[#2f3b1f]">
                                  {item.label}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-[#6d7452]">
                                  {item.description}
                                </p>
                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9a987b]">
                                  Match: {item.matchedTerm}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-4 py-4 text-sm text-[#6d7452]">
                        No matching admin section found for &quot;{searchQuery.trim()}&quot;.
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              <div
                className={`origin-right ml-auto flex items-center gap-2 transition-all duration-300 ease-out sm:gap-3 ${
                  isSearchFocused
                    ? "pointer-events-none max-w-0 scale-95 opacity-0 md:pointer-events-auto md:max-w-none md:scale-100 md:opacity-100"
                    : "max-w-[220px] scale-100 opacity-100 sm:max-w-[360px] md:max-w-none"
                }`}
              >
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
                      {user?.name ?? "Admin User"}
                    </p>
                    <p className="truncate text-xs text-[#7b7a60]">
                      {user?.email ?? "admin@sarciariceco.com"}
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
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-4 py-5 pb-28 sm:px-6 md:gap-6 md:py-6 md:pb-32 xl:px-8 xl:pb-10">
          {children}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#d9d6c2] bg-[#faf7ee]/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur xl:hidden">
          <div className="mx-auto grid max-w-3xl grid-cols-5 gap-1">
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
      </div>
    </div>
  );
}
