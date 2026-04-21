"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  Mail,
  Phone,
  ShieldCheck,
  ShieldX,
  Smartphone,
  UserRound,
} from "lucide-react";

import AdminShell from "@/app/admin/_components/admin-shell";

type AdminUserDetails = {
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
  primary_verification_method?: "email" | "phone" | null;
  two_factor_enabled?: boolean;
  two_factor_method?: "email" | "phone" | null;
  password_changed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  trusted_device_count?: number;
  can_restrict?: boolean;
};

type TrustedDevice = {
  id: number;
  name: string;
  user_agent?: string | null;
  ip_address?: string | null;
  last_used_at?: string | null;
  created_at?: string | null;
  expires_at?: string | null;
  is_current?: boolean;
};

type SecurityActivity = {
  id: number;
  event: string;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
  actor?: {
    id: number;
    account_id?: string | null;
    name: string;
  } | null;
};

type AdminUserDetailsResponse = {
  message?: string;
  user?: AdminUserDetails;
  trusted_devices?: TrustedDevice[];
  recent_activity?: SecurityActivity[];
  recent_activity_pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
};

const emptyActivityPagination = {
  current_page: 1,
  last_page: 1,
  per_page: 5,
  total: 0,
  from: null as number | null,
  to: null as number | null,
};

const activityLabels: Record<
  string,
  {
    description: string;
    title: string;
  }
> = {
  login_succeeded: {
    title: "Successful login",
    description: "The account completed sign-in successfully.",
  },
  login_failed: {
    title: "Failed login attempt",
    description: "A sign-in attempt failed because the credentials did not match.",
  },
  restricted_login_blocked: {
    title: "Restricted login blocked",
    description: "A sign-in attempt was blocked because the account is restricted.",
  },
  two_factor_challenge_issued: {
    title: "Two-factor challenge sent",
    description: "A security code was issued before a protected login or sensitive action.",
  },
  two_factor_verified: {
    title: "Two-factor confirmed",
    description: "A one-time security code was entered successfully.",
  },
  two_factor_enabled: {
    title: "Two-factor enabled",
    description: "Two-factor authentication was turned on for the account.",
  },
  two_factor_disabled: {
    title: "Two-factor disabled",
    description: "Two-factor authentication was turned off for the account.",
  },
  two_factor_reset_by_admin: {
    title: "Two-factor reset by admin",
    description: "An admin cleared the current two-factor setup so it can be configured again.",
  },
  trusted_device_created: {
    title: "Trusted device added",
    description: "A browser or device was marked as trusted for future logins.",
  },
  trusted_device_revoked: {
    title: "Trusted device removed",
    description: "A previously trusted browser or device was removed by the account owner.",
  },
  trusted_device_revoked_by_admin: {
    title: "Trusted device revoked by admin",
    description: "An admin removed one trusted browser or device from this account.",
  },
  all_trusted_devices_revoked_by_admin: {
    title: "All trusted devices revoked",
    description: "An admin removed every trusted browser or device for this account.",
  },
  email_verified: {
    title: "Email verified",
    description: "The account completed email verification successfully.",
  },
  mobile_verified: {
    title: "Mobile verified",
    description: "The account completed mobile verification successfully.",
  },
  email_manually_verified_by_admin: {
    title: "Email verified by admin",
    description: "An admin manually marked the email address as verified.",
  },
  mobile_manually_verified_by_admin: {
    title: "Mobile verified by admin",
    description: "An admin manually marked the mobile number as verified.",
  },
  primary_verification_method_updated: {
    title: "Primary verification method changed",
    description: "The account switched which verified method should be used first.",
  },
  password_changed: {
    title: "Password changed",
    description: "The account password was updated.",
  },
  email_changed: {
    title: "Email changed",
    description: "The account email address was changed and now needs verification again.",
  },
  mobile_changed: {
    title: "Mobile changed",
    description: "The account mobile number was changed and now needs verification again.",
  },
  account_restricted_by_admin: {
    title: "Account restricted",
    description: "An admin restricted this account from normal access.",
  },
  account_reactivated_by_admin: {
    title: "Account reactivated",
    description: "An admin restored this account to active access.",
  },
};

function formatDate(value?: string | null) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
}

function UserDetailsSkeleton() {
  return (
    <AdminShell
      subtitle="Review this account's profile, protection controls, and recent security activity."
      searchPlaceholder="Search users, account actions, or security history"
    >
      <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
        <div className="animate-pulse">
          <div className="h-4 w-32 rounded-full bg-[#ece7d6]" />
          <div className="mt-4 h-10 w-2/3 rounded-full bg-[#ece7d6]" />
          <div className="mt-3 h-4 w-full max-w-2xl rounded-full bg-[#ece7d6]" />
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[1.5rem] border border-[#e5e0cc] bg-[#faf7ee] p-5"
              >
                <div className="h-3 w-20 rounded-full bg-[#ece7d6]" />
                <div className="mt-4 h-7 w-28 rounded-full bg-[#ece7d6]" />
                <div className="mt-3 h-4 w-2/3 rounded-full bg-[#ece7d6]" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="grid gap-5 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6"
          >
            <div className="animate-pulse">
              <div className="h-4 w-40 rounded-full bg-[#ece7d6]" />
              <div className="mt-5 grid gap-3">
                {Array.from({ length: 3 }).map((__, innerIndex) => (
                  <div
                    key={innerIndex}
                    className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] p-4"
                  >
                    <div className="h-4 w-1/3 rounded-full bg-[#ece7d6]" />
                    <div className="mt-3 h-4 w-full rounded-full bg-[#ece7d6]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>
    </AdminShell>
  );
}

export default function UserDetailsPageContent({
  userId,
}: {
  userId: string;
}) {
  const [missingUserAccountId, setMissingUserAccountId] = useState<string | null>(
    null
  );
  const [details, setDetails] = useState<AdminUserDetails | null>(null);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [recentActivity, setRecentActivity] = useState<SecurityActivity[]>([]);
  const [activityPagination, setActivityPagination] = useState(
    emptyActivityPagination
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isActivityLoading, setIsActivityLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const initials = useMemo(() => {
    const name = details?.name?.trim();

    if (!name) {
      return "SR";
    }

    return name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [details?.name]);

  const loadUserDetails = useCallback(async () => {
    setIsLoading(true);
    setMissingUserAccountId(null);
    setError("");

    try {
      const params = new URLSearchParams({
        activity_page: "1",
      });

      const response = await fetch(`/api/admin/users/${userId}?${params.toString()}`, {
        cache: "no-store",
      });

      const data = (await response.json().catch(() => null)) as
        | AdminUserDetailsResponse
        | null;

      if (!response.ok) {
        if (response.status === 404) {
          setDetails(null);
          setTrustedDevices([]);
          setRecentActivity([]);
          setActivityPagination(emptyActivityPagination);
          setMissingUserAccountId(userId);
          return;
        }

        setError(data?.message ?? "Unable to load this user account right now.");
        return;
      }

      setMissingUserAccountId(null);
      setDetails(data?.user ?? null);
      setTrustedDevices(data?.trusted_devices ?? []);
      setRecentActivity(data?.recent_activity ?? []);
      setActivityPagination(
        data?.recent_activity_pagination ?? emptyActivityPagination
      );
    } catch {
      setError("Something went wrong while loading this user account.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const loadActivityPage = useCallback(async (targetPage: number) => {
    setIsActivityLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        activity_page: String(targetPage),
      });

      const response = await fetch(`/api/admin/users/${userId}?${params.toString()}`, {
        cache: "no-store",
      });

      const data = (await response.json().catch(() => null)) as
        | AdminUserDetailsResponse
        | null;

      if (!response.ok) {
        if (response.status === 404) {
          setDetails(null);
          setTrustedDevices([]);
          setRecentActivity([]);
          setActivityPagination(emptyActivityPagination);
          setMissingUserAccountId(userId);
          return;
        }

        setError(
          data?.message ?? "Unable to load this security activity page right now."
        );
        return;
      }

      setRecentActivity(data?.recent_activity ?? []);
      setActivityPagination(
        data?.recent_activity_pagination ?? emptyActivityPagination
      );
    } catch {
      setError("Something went wrong while loading this security activity page.");
    } finally {
      setIsActivityLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadUserDetails();
  }, [loadUserDetails]);

  const runAction = async ({
    actionKey,
    body,
    endpoint,
    method,
  }: {
    actionKey: string;
    body?: unknown;
    endpoint: string;
    method: "POST" | "PATCH" | "DELETE";
  }) => {
    setActiveAction(actionKey);
    setMessage("");
    setError("");

    try {
      const response = await fetch(endpoint, {
        method,
        headers:
          body === undefined
            ? undefined
            : {
                "Content-Type": "application/json",
              },
        body: body === undefined ? undefined : JSON.stringify(body),
      });

      const data = (await response.json().catch(() => null)) as
        | AdminUserDetailsResponse
        | null;

      if (!response.ok) {
        setError(data?.message ?? "Unable to complete this admin action.");
        return;
      }

      setMessage(data?.message ?? "Action completed successfully.");
      await loadUserDetails();
    } catch {
      setError("Something went wrong while completing this admin action.");
    } finally {
      setActiveAction(null);
    }
  };

  if (isLoading) {
    return <UserDetailsSkeleton />;
  }

  return (
    <AdminShell
      subtitle="Review this account's profile, protection controls, and recent security activity."
      searchPlaceholder="Search users, account actions, or security history"
    >
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 rounded-full border border-[#d8d4be] bg-[#faf7ee] px-4 py-2 text-sm font-semibold text-[var(--color-rice-green)] transition hover:bg-[#f4efdf] hover:text-[color:color-mix(in_srgb,var(--color-rice-green)_85%,black)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to users directory
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[#e9cabb] bg-[#fff4ef] px-4 py-3 text-sm text-[#a14c34]">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-2xl border border-[#d6e2c3] bg-[#f3f7ed] px-4 py-3 text-sm text-[#43612e]">
          {message}
        </div>
      ) : null}

      {missingUserAccountId ? (
        <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-6 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-7">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-[linear-gradient(135deg,#4d6b35,#6f8b54)] text-white shadow-[0_14px_30px_rgba(77,107,53,0.18)]">
            <UserRound className="h-6 w-6" />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
            User Not Found
          </p>
          <h1 className="mt-3 font-poppins text-2xl font-semibold leading-tight text-[#2f3b1f] sm:text-3xl">
            The user with account ID {missingUserAccountId} does not exist in our server.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6d7452] sm:text-base">
            Double-check the account ID or return to the users directory and open a valid record from the list.
          </p>
        </section>
      ) : details ? (
        <>
          <section className="overflow-hidden rounded-[2rem] border border-[#d8d4be] bg-white/92 shadow-[0_30px_80px_rgba(44,60,29,0.12)]">
            <div className="relative overflow-hidden bg-[linear-gradient(135deg,#243716_0%,#355125_48%,#5f7f43_100%)] px-5 py-6 sm:px-7 sm:py-7">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--color-rich-gold)_22%,transparent),transparent_22%),radial-gradient(circle_at_bottom_right,color-mix(in_srgb,#ffffff_12%,transparent),transparent_30%)]" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-rich-gold)]">
                    User Details
                  </p>
                  <h1 className="mt-3 font-poppins text-3xl font-semibold leading-tight text-white sm:text-4xl">
                    {details.name}
                  </h1>
                  <p className="mt-3 text-sm leading-7 text-[#eef2de] sm:text-base">
                    Review profile details, verification readiness, trusted devices, and recent security events for this account.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-semibold text-white">
                      {details.account_id ?? `#${details.id}`}
                    </span>
                    <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-semibold text-white capitalize">
                      {details.role_label ?? details.role}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        details.account_status === "restricted"
                          ? "bg-[#fff0ea] text-[#8f3d23]"
                          : "bg-[#edf4e4] text-[#2d5c22]"
                      }`}
                    >
                      {details.account_status === "restricted"
                        ? "Restricted"
                        : "Active"}
                    </span>
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-white/12 bg-white/10 p-4 backdrop-blur-sm sm:min-w-[290px]">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#d9e4be]">
                    Account Snapshot
                  </p>
                  <div className="mt-4 grid gap-3 text-sm text-[#eef2de]">
                    <div className="flex items-center justify-between gap-4">
                      <span>Trusted devices</span>
                      <span className="font-semibold text-white">
                        {details.trusted_device_count ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>2FA</span>
                      <span className="font-semibold text-white">
                        {details.two_factor_enabled ? "Enabled" : "Off"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Joined</span>
                      <span className="font-semibold text-white">
                        {formatDate(details.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-5 sm:px-7 sm:py-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] border-4 border-white bg-[linear-gradient(135deg,#4d6b35,#769158)] text-2xl font-semibold text-white shadow-[0_18px_44px_rgba(77,107,53,0.28)] sm:h-28 sm:w-28 sm:text-3xl">
                    {initials}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="font-poppins text-2xl font-semibold text-[#2f3b1f] sm:text-3xl">
                        {details.name}
                      </p>
                      <p className="mt-1 text-sm text-[#6d7452]">
                        {details.email}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full bg-[#f4efdf] px-3 py-1 text-xs font-semibold text-[#7c7b55]">
                        {details.mobile ? `+63 ${details.mobile}` : "No mobile saved"}
                      </span>
                      <span className="inline-flex rounded-full bg-[#f8f4e7] px-3 py-1 text-xs font-semibold text-[#7c6740]">
                        Updated {formatDate(details.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[400px]">
                  <div className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#9a987b]">
                      Verification
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#2f3b1f]">
                      {details.email_verified_at && details.mobile_verified_at
                        ? "Fully verified"
                        : "Needs follow-up"}
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#9a987b]">
                      Primary method
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#2f3b1f]">
                      {details.primary_verification_method === "phone"
                        ? "Mobile"
                        : details.primary_verification_method === "email"
                          ? "Email"
                          : "Not set"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
                Full Profile Details
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: UserRound,
                    label: "Full name",
                    value: details.name,
                  },
                  {
                    icon: Mail,
                    label: "Email address",
                    value: details.email,
                  },
                  {
                    icon: Phone,
                    label: "Mobile number",
                    value: details.mobile ? `+63 ${details.mobile}` : "No mobile saved",
                  },
                  {
                    icon: ShieldCheck,
                    label: "Account status",
                    value:
                      details.account_status === "restricted"
                        ? `Restricted since ${formatDate(details.restricted_at)}`
                        : "Active",
                  },
                  {
                    icon: KeyRound,
                    label: "Two-factor method",
                    value:
                      details.two_factor_enabled && details.two_factor_method
                        ? details.two_factor_method === "phone"
                          ? "Mobile"
                          : "Email"
                        : "Not active",
                  },
                  {
                    icon: ShieldCheck,
                    label: "Password last changed",
                    value: formatDate(details.password_changed_at),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--color-rice-green)] shadow-[0_10px_24px_rgba(78,95,58,0.08)]">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a987b]">
                          {item.label}
                        </p>
                        <p className="mt-2 text-sm font-semibold leading-6 text-[#2f3b1f]">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
                Admin Actions
              </p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] p-4">
                  <p className="text-sm font-semibold text-[#2f3b1f]">
                    Account access
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#6d7452]">
                    Mark this account as active or restricted depending on whether it should keep normal access.
                  </p>
                  <button
                    type="button"
                    disabled={
                      activeAction === "status" ||
                      (details.account_status !== "restricted" &&
                        details.can_restrict === false)
                    }
                    onClick={() =>
                      void runAction({
                        actionKey: "status",
                        endpoint: `/api/admin/users/${userId}/status`,
                        method: "PATCH",
                        body: {
                          status:
                            details.account_status === "restricted"
                              ? "active"
                              : "restricted",
                        },
                      })
                    }
                    className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
                      details.account_status === "restricted"
                        ? "bg-[#253119] text-white hover:bg-[#1c2512]"
                        : "bg-[#6b2f1f] text-white hover:bg-[#522316]"
                    }`}
                  >
                    {activeAction === "status" ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : details.account_status === "restricted" ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Reactivate Account
                      </>
                    ) : (
                      <>
                        <ShieldX className="h-4 w-4" />
                        Restrict Account
                      </>
                    )}
                  </button>
                </div>

                <div className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] p-4">
                  <p className="text-sm font-semibold text-[#2f3b1f]">
                    Reset two-factor authentication
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#6d7452]">
                    Clear the current 2FA method so the user can set it up again cleanly.
                  </p>
                  <button
                    type="button"
                    disabled={activeAction === "reset-two-factor"}
                    onClick={() =>
                      void runAction({
                        actionKey: "reset-two-factor",
                        endpoint: `/api/admin/users/${userId}/reset-two-factor`,
                        method: "POST",
                      })
                    }
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d8d4be] bg-white px-4 py-3 text-sm font-semibold text-[#364127] transition hover:bg-[#f4efdf] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {activeAction === "reset-two-factor" ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-4 w-4" />
                        Reset 2FA
                      </>
                    )}
                  </button>
                </div>

                <div className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] p-4">
                  <p className="text-sm font-semibold text-[#2f3b1f]">
                    Revoke trusted devices
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#6d7452]">
                    Remove all recognized browsers and devices so future logins must go through fresh verification again.
                  </p>
                  <button
                    type="button"
                    disabled={activeAction === "revoke-all-devices"}
                    onClick={() =>
                      void runAction({
                        actionKey: "revoke-all-devices",
                        endpoint: `/api/admin/users/${userId}/trusted-devices`,
                        method: "DELETE",
                      })
                    }
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d8d4be] bg-white px-4 py-3 text-sm font-semibold text-[#364127] transition hover:bg-[#f4efdf] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {activeAction === "revoke-all-devices" ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Revoking...
                      </>
                    ) : (
                      <>
                        <Smartphone className="h-4 w-4" />
                        Revoke All Devices
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
                Manual Verification Controls
              </p>
              <div className="mt-5 grid gap-3">
                {[
                  {
                    method: "email" as const,
                    title: "Email address",
                    value: details.email,
                    verified: Boolean(details.email_verified_at),
                  },
                  {
                    method: "phone" as const,
                    title: "Mobile number",
                    value: details.mobile ? `+63 ${details.mobile}` : "No mobile saved",
                    verified: Boolean(details.mobile_verified_at),
                  },
                ].map((item) => (
                  <div
                    key={item.method}
                    className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#2f3b1f]">
                          {item.title}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#6d7452]">
                          {item.value}
                        </p>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b8d70]">
                          {item.verified ? "Already verified" : "Pending verification"}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={item.verified || activeAction === `verify-${item.method}`}
                        onClick={() =>
                          void runAction({
                            actionKey: `verify-${item.method}`,
                            endpoint: `/api/admin/users/${userId}/verify`,
                            method: "POST",
                            body: {
                              method: item.method,
                            },
                          })
                        }
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#253119] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1c2512] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                      >
                        {activeAction === `verify-${item.method}` ? (
                          <>
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : item.verified ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Verified
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Mark as Verified
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
                    Trusted Devices
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#6d7452]">
                    Review every recognized browser or device that can skip login 2FA for this user.
                  </p>
                </div>
                <span className="rounded-full bg-[#edf4e4] px-3 py-1 text-xs font-semibold text-[#4d6b35]">
                  {trustedDevices.length} active
                </span>
              </div>

              {trustedDevices.length > 0 ? (
                <div className="mt-5 grid gap-3">
                  {trustedDevices.map((device) => (
                    <div
                      key={device.id}
                      className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-[#2f3b1f]">
                              {device.name}
                            </p>
                            {device.is_current ? (
                              <span className="rounded-full bg-[#edf4e4] px-2.5 py-1 text-[11px] font-semibold text-[#4d6b35]">
                                Current device
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 text-sm leading-6 text-[#6d7452]">
                            {device.user_agent || "Browser details not available"}
                          </p>
                          <div className="mt-3 grid gap-1 text-xs text-[#7b7a60]">
                            <p>Last used: {formatDate(device.last_used_at)}</p>
                            <p>Added: {formatDate(device.created_at)}</p>
                            <p>Expires: {formatDate(device.expires_at)}</p>
                            <p>IP address: {device.ip_address || "Not available"}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={activeAction === `revoke-device-${device.id}`}
                          onClick={() =>
                            void runAction({
                              actionKey: `revoke-device-${device.id}`,
                              endpoint: `/api/admin/users/${userId}/trusted-devices/${device.id}`,
                              method: "DELETE",
                            })
                          }
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d8d4be] bg-white px-4 py-3 text-sm font-semibold text-[#364127] transition hover:bg-[#f4efdf] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                        >
                          {activeAction === `revoke-device-${device.id}` ? (
                            <>
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                              Removing...
                            </>
                          ) : (
                            <>
                              <ShieldX className="h-4 w-4" />
                              Revoke
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] p-4 text-sm leading-6 text-[#6d7452]">
                  No active trusted devices are saved for this account right now.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
              Recent Login & Security Activity
            </p>
            <div className="mt-5 grid gap-3">
              {isActivityLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="h-4 w-40 rounded-full bg-[#ece7d6]" />
                        <div className="mt-3 h-4 w-full rounded-full bg-[#ece7d6]" />
                        <div className="mt-2 h-4 w-2/3 rounded-full bg-[#ece7d6]" />
                        <div className="mt-3 grid gap-2">
                          <div className="h-3 w-36 rounded-full bg-[#ece7d6]" />
                          <div className="h-3 w-32 rounded-full bg-[#ece7d6]" />
                          <div className="h-3 w-44 rounded-full bg-[#ece7d6]" />
                        </div>
                      </div>
                      <div className="h-10 w-28 rounded-xl bg-white" />
                    </div>
                  </div>
                ))
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity) => {
                  const activityMeta = activityLabels[activity.event] ?? {
                    title: activity.event.replaceAll("_", " "),
                    description: "Security activity was recorded for this account.",
                  };

                  return (
                    <div
                      key={activity.id}
                      className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold capitalize text-[#2f3b1f]">
                            {activityMeta.title}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[#6d7452]">
                            {activityMeta.description}
                          </p>
                          <div className="mt-3 grid gap-1 text-xs text-[#7b7a60]">
                            <p>When: {formatDate(activity.created_at)}</p>
                            <p>IP address: {activity.ip_address || "Not available"}</p>
                            <p>Browser: {activity.user_agent || "Not available"}</p>
                            <p>
                              By:{" "}
                              {activity.actor
                                ? `${activity.actor.name}${activity.actor.account_id ? ` (${activity.actor.account_id})` : ""}`
                                : "System or account owner"}
                            </p>
                          </div>
                        </div>
                        <div className="rounded-xl bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#7b7a60]">
                          {activity.event.replaceAll("_", " ")}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] p-4 text-sm leading-6 text-[#6d7452]">
                  No login or security activity has been recorded for this account yet.
                </div>
              )}
            </div>
            {activityPagination.total > 0 ? (
              <div className="mt-5 flex flex-col gap-3 rounded-[1.5rem] border border-[#ddd7c4] bg-white/85 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#6d7452]">
                  Showing{" "}
                  <span className="font-semibold text-[#2f3b1f]">
                    {activityPagination.from ?? 0}-{activityPagination.to ?? 0}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-[#2f3b1f]">
                    {activityPagination.total}
                  </span>{" "}
                  security events
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() =>
                      void loadActivityPage(
                        Math.max(1, activityPagination.current_page - 1)
                      )
                    }
                    disabled={
                      activityPagination.current_page <= 1 || isActivityLoading
                    }
                    className="inline-flex items-center justify-center rounded-xl border border-[#d8d4be] bg-white px-4 py-2.5 text-sm font-semibold text-[#364127] transition hover:bg-[#f4efdf] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Previous 5
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void loadActivityPage(
                        Math.min(
                          activityPagination.last_page,
                          activityPagination.current_page + 1
                        )
                      )
                    }
                    disabled={
                      activityPagination.current_page >=
                        activityPagination.last_page || isActivityLoading
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#253119] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1c2512] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Next 5
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        </>
      ) : (
        <div className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-6 text-sm text-[#6d7452] shadow-[0_22px_50px_rgba(78,95,58,0.08)]">
          We could not find this user account.
        </div>
      )}
    </AdminShell>
  );
}
