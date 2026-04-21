"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Filter,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import AdminShell from "@/app/admin/_components/admin-shell";

type AdminDirectoryUser = {
  id: number;
  account_id?: string | null;
  name: string;
  email: string;
  mobile: string;
  role: string;
  role_label?: string;
  account_status?: "active" | "restricted";
  restricted_at?: string | null;
  email_verified_at?: string | null;
  mobile_verified_at?: string | null;
  two_factor_enabled?: boolean;
  primary_verification_method?: "email" | "phone" | null;
  created_at?: string | null;
};

type UsersResponse = {
  message?: string;
  users?: AdminDirectoryUser[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
  filters?: {
    q?: string;
    role?: string;
    verification?: string;
  };
  summary?: {
    total_users: number;
    admin_count: number;
    customer_count: number;
    verified_count: number;
    pending_count: number;
  };
};

const emptySummary = {
  total_users: 0,
  admin_count: 0,
  customer_count: 0,
  verified_count: 0,
  pending_count: 0,
};

const emptyPagination = {
  current_page: 1,
  last_page: 1,
  per_page: 12,
  total: 0,
  from: null as number | null,
  to: null as number | null,
};

function formatDate(value?: string | null) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Unknown"
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

export default function UsersPageContent() {
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<AdminDirectoryUser[]>([]);
  const [summary, setSummary] = useState(emptySummary);
  const [pagination, setPagination] = useState(emptyPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const debouncedSearch = useMemo(() => searchInput.trim(), [searchInput]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [debouncedSearch, roleFilter, verificationFilter]);

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      setIsLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          per_page: "12",
          role: roleFilter,
          verification: verificationFilter,
        });

        if (debouncedSearch !== "") {
          params.set("q", debouncedSearch);
        }

        const response = await fetch(`/api/admin/users?${params.toString()}`, {
          cache: "no-store",
        });

        const data = (await response.json().catch(() => null)) as
          | UsersResponse
          | null;

        if (!isMounted) {
          return;
        }

        if (!response.ok) {
          setError(
            data?.message ?? "Unable to load the admin user directory right now."
          );
          setUsers([]);
          return;
        }

        setUsers(data?.users ?? []);
        setSummary(data?.summary ?? emptySummary);
        setPagination(data?.pagination ?? emptyPagination);
      } catch {
        if (isMounted) {
          setError(
            "Something went wrong while loading the admin user directory."
          );
          setUsers([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadUsers();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, page, roleFilter, verificationFilter]);

  return (
    <AdminShell
      subtitle="Search, review, and monitor every account in the system from one admin-only directory."
      searchPlaceholder="Search users, emails, mobile numbers, or roles"
    >
      <section className="overflow-hidden rounded-[2rem] border border-[#d8d4be] bg-white/92 shadow-[0_30px_80px_rgba(44,60,29,0.12)]">
        <div className="relative bg-[linear-gradient(135deg,#2c441d_0%,#3d5a2b_52%,#5d7f42_100%)] px-5 py-7 text-white sm:px-7 sm:py-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--color-rich-gold)_22%,transparent),transparent_24%),radial-gradient(circle_at_bottom_right,color-mix(in_srgb,#ffffff_10%,transparent),transparent_28%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-rich-gold)]">
                Admin Users
              </p>
              <h1 className="mt-3 font-poppins text-3xl font-semibold sm:text-4xl">
                Review every account in the system from one protected admin directory.
              </h1>
              <p className="mt-4 text-sm leading-7 text-[#eef2de] sm:text-base">
                Search by name, email, mobile number, or role and quickly see who is verified, protected by 2FA, or still needs follow-up.
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-white/12 bg-white/10 p-4 backdrop-blur-sm sm:min-w-[280px]">
              <p className="text-xs uppercase tracking-[0.18em] text-[#d9e4be]">
                Directory summary
              </p>
              <div className="mt-3 grid gap-2 text-sm text-[#eef2de]">
                <div className="flex items-center justify-between gap-4">
                  <span>Total accounts</span>
                  <span className="font-semibold text-white">
                    {summary.total_users}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Verified users</span>
                  <span className="font-semibold text-white">
                    {summary.verified_count}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Pending follow-up</span>
                  <span className="font-semibold text-white">
                    {summary.pending_count}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {[
          {
            label: "All users",
            value: summary.total_users,
          },
          {
            label: "Admins",
            value: summary.admin_count,
          },
          {
            label: "Customers",
            value: summary.customer_count,
          },
          {
            label: "Fully verified",
            value: summary.verified_count,
          },
          {
            label: "Need follow-up",
            value: summary.pending_count,
          },
        ].map((card) => (
          <article
            key={card.label}
            className="rounded-[1.35rem] border border-[#ddd9c6] bg-white/90 p-3.5 shadow-[0_18px_40px_rgba(78,95,58,0.08)] sm:rounded-[1.6rem] sm:p-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8d8a70] sm:text-xs sm:tracking-[0.18em]">
              {card.label}
            </p>
            <p className="mt-2 font-poppins text-2xl font-semibold text-[#2f3b1f] sm:mt-3 sm:text-3xl">
              {card.value}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.4fr_0.4fr]">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#7b7a60]">
              Search users
            </span>
            <div className="flex items-center gap-3 rounded-2xl border border-[#dbd7c2] bg-[#fffef9] px-4 py-3 shadow-[0_10px_24px_rgba(78,95,58,0.04)]">
              <Search className="h-4 w-4 text-[#8b8d70]" />
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by name, email, mobile, or role"
                className="w-full bg-transparent text-sm text-[#2f3b1f] outline-none placeholder:text-[#9a9b7d]"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#7b7a60]">
              Role
            </span>
            <div className="flex items-center gap-2 rounded-2xl border border-[#dbd7c2] bg-[#fffef9] px-4 py-3">
              <Filter className="h-4 w-4 text-[#8b8d70]" />
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="w-full bg-transparent text-sm text-[#2f3b1f] outline-none"
              >
                <option value="all">All roles</option>
                <option value="admin">Admins</option>
                <option value="customer">Customers</option>
              </select>
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#7b7a60]">
              Verification
            </span>
            <div className="flex items-center gap-2 rounded-2xl border border-[#dbd7c2] bg-[#fffef9] px-4 py-3">
              <ShieldCheck className="h-4 w-4 text-[#8b8d70]" />
              <select
                value={verificationFilter}
                onChange={(event) => setVerificationFilter(event.target.value)}
                className="w-full bg-transparent text-sm text-[#2f3b1f] outline-none"
              >
                <option value="all">All statuses</option>
                <option value="verified">Fully verified</option>
                <option value="pending">Needs follow-up</option>
              </select>
            </div>
          </label>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-[#e9cabb] bg-[#fff4ef] px-4 py-3 text-sm text-[#a14c34]">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-6 grid gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-[1.6rem] border border-[#e5e0cc] bg-[#faf7ee] p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-white" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-40 rounded-full bg-[#ece7d6]" />
                    <div className="h-4 w-3/4 rounded-full bg-[#ece7d6]" />
                    <div className="h-4 w-1/2 rounded-full bg-[#ece7d6]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : users.length > 0 ? (
          <>
            <div className="mt-6 grid gap-4">
              {users.map((user) => {
                const isFullyVerified =
                  Boolean(user.email_verified_at) &&
                  Boolean(user.mobile_verified_at);

                return (
                  <article
                    key={user.id}
                    className="rounded-[1.6rem] border border-[#e5e0cc] bg-[#faf7ee] p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--color-rice-green)] shadow-[0_10px_24px_rgba(78,95,58,0.08)]">
                          <UsersRound className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-[#2f3b1f]">
                              {user.name}
                            </p>
                            <span className="rounded-full bg-[#edf4e4] px-2.5 py-1 text-[11px] font-semibold capitalize text-[#4d6b35]">
                              {user.role_label ?? user.role}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                isFullyVerified
                                  ? "bg-[#edf4e4] text-[#4d6b35]"
                                  : "bg-[#faf1e4] text-[#8a6633]"
                              }`}
                            >
                              {isFullyVerified ? "Fully verified" : "Needs follow-up"}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                user.account_status === "restricted"
                                  ? "bg-[#fff0ea] text-[#8f3d23]"
                                  : "bg-[#eef2de] text-[#4d6b35]"
                              }`}
                            >
                              {user.account_status === "restricted"
                                ? "Restricted"
                                : "Active"}
                            </span>
                            {user.two_factor_enabled ? (
                              <span className="rounded-full bg-[#eef2de] px-2.5 py-1 text-[11px] font-semibold text-[#4d6b35]">
                                2FA enabled
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-3 grid gap-2 text-sm text-[#6d7452] sm:grid-cols-2">
                            <p className="inline-flex items-center gap-2">
                              <Mail className="h-4 w-4 text-[#8b8d70]" />
                              {user.email}
                            </p>
                            <p className="inline-flex items-center gap-2">
                              <Phone className="h-4 w-4 text-[#8b8d70]" />
                              {user.mobile ? `+63 ${user.mobile}` : "No mobile saved"}
                            </p>
                          </div>

                          <div className="mt-4 grid gap-2 text-xs text-[#7b7a60] sm:grid-cols-2 xl:grid-cols-4">
                            <p>Email: {user.email_verified_at ? "Verified" : "Pending"}</p>
                            <p>Mobile: {user.mobile_verified_at ? "Verified" : "Pending"}</p>
                            <p>
                              Primary method:{" "}
                              {user.primary_verification_method === "phone"
                                ? "Mobile"
                                : user.primary_verification_method === "email"
                                  ? "Email"
                                  : "Not set"}
                            </p>
                            <p>Joined: {formatDate(user.created_at)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 rounded-[1.2rem] border border-[#ddd7c4] bg-white/90 px-4 py-3 text-sm text-[#536042] sm:min-w-[180px]">
                        <div>
                          Account ID:{" "}
                          <span className="font-semibold text-[#2f3b1f]">
                            {user.account_id ?? `#${user.id}`}
                          </span>
                        </div>
                        <Link
                          href={`/admin/users/${user.account_id ?? user.id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#253119] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1c2512]"
                        >
                          View Details
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-[1.5rem] border border-[#ddd7c4] bg-white/85 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#6d7452]">
                Showing{" "}
                <span className="font-semibold text-[#2f3b1f]">
                  {pagination.from ?? 0}-{pagination.to ?? 0}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#2f3b1f]">
                  {pagination.total}
                </span>{" "}
                accounts
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={pagination.current_page <= 1}
                  className="inline-flex items-center justify-center rounded-xl border border-[#d8d4be] bg-white px-4 py-2.5 text-sm font-semibold text-[#364127] transition hover:bg-[#f4efdf] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.min(pagination.last_page, current + 1)
                    )
                  }
                  disabled={pagination.current_page >= pagination.last_page}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#253119] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1c2512] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Next Page
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-[1.6rem] border border-[#e5e0cc] bg-[#faf7ee] p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white p-2 text-[var(--color-rice-green)] shadow-[0_8px_24px_rgba(74,92,54,0.08)]">
                <UsersRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#364127]">
                  No users matched your filters
                </p>
                <p className="mt-1 text-sm leading-6 text-[#6d7452]">
                  Try clearing the search term or widening the role and verification filters to see more accounts.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
