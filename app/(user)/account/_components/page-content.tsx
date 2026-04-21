"use client";

import dynamic from "next/dynamic";
import {
  BadgeCheck,
  LoaderCircle,
  Mail,
  PencilLine,
  Phone,
  Save,
  UserRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { AccountSectionSkeleton } from "@/app/(user)/account/_components/account-page-skeleton";
import CustomerShell from "@/app/(user)/_components/customer-shell";
import { useAuthStore } from "@/app/_stores/auth-store";

const AccountAddressBook = dynamic(
  () => import("./address-book"),
  {
    loading: () => <AccountSectionSkeleton rows={3} />,
    ssr: false,
  }
);

const AccountDeliveryPreferences = dynamic(
  () => import("./delivery-preferences"),
  {
    loading: () => (
      <section className="grid gap-5 xl:grid-cols-2">
        <AccountSectionSkeleton rows={2} />
        <AccountSectionSkeleton rows={2} />
      </section>
    ),
    ssr: false,
  }
);

const AccountPaymentPreferences = dynamic(
  () => import("./payment-preferences"),
  {
    loading: () => <AccountSectionSkeleton rows={1} />,
    ssr: false,
  }
);

export default function AccountPageContent() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveMessage, setProfileSaveMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [addressRefreshKey, setAddressRefreshKey] = useState(0);
  const [nameDraft, setNameDraft] = useState(user?.name ?? "");
  const initials = useMemo(() => {
    const name = user?.name?.trim();

    if (!name) {
      return "RL";
    }

    return name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [user?.name]);

  const handleCancelEdit = () => {
    setIsEditingPersonalInfo(false);
    setProfileError("");
    setProfileSaveMessage("");
    setNameDraft(user?.name ?? "");
  };

  const handleSaveProfile = async () => {
    if (!user) {
      return;
    }

    setIsSavingProfile(true);
    setProfileError("");
    setProfileSaveMessage("");

    try {
      const trimmedName = nameDraft.trim();

      if (!trimmedName) {
        setProfileError("Full name is required before saving your profile.");
        return;
      }

      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | {
            message?: string;
            errors?: Record<string, string[]>;
            user?: typeof user;
          }
        | null;

      if (!response.ok) {
        setProfileError(
          data?.errors?.name?.[0] ??
            data?.message ??
            "Unable to update your profile right now."
        );
        return;
      }

      if (data?.user) {
        setUser(data.user);
      } else {
        setUser({
          ...user,
          name: trimmedName,
        });
      }

      setNameDraft(data?.user?.name ?? trimmedName);
      setProfileSaveMessage(
        data?.message ?? "Personal information updated successfully."
      );
      setIsEditingPersonalInfo(false);
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <CustomerShell
      subtitle="Your personal profile for deliveries, rewards, and household preferences."
      searchPlaceholder="Search delivery settings, rewards, or account help"
    >
      <section className="overflow-hidden rounded-[2rem] border border-[#d8d4be] bg-white/92 shadow-[0_30px_80px_rgba(44,60,29,0.12)]">
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#243716_0%,#355125_48%,#5f7f43_100%)] px-5 py-6 sm:px-7 sm:py-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--color-rich-gold)_22%,transparent),transparent_22%),radial-gradient(circle_at_bottom_right,color-mix(in_srgb,#ffffff_12%,transparent),transparent_30%)]" />
          <div className="absolute -right-12 top-8 h-32 w-32 rounded-full bg-white/8 blur-2xl sm:h-40 sm:w-40" />
          <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-[color:color-mix(in_srgb,var(--color-rich-gold)_18%,transparent)] blur-2xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-rich-gold)]">
                Account
              </p>
              <h1 className="mt-3 font-poppins text-3xl font-semibold leading-tight text-white sm:text-4xl">
                Your profile, delivery details, and verification status in one place.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#eef2de] sm:text-base">
                Keep your personal details current so orders, delivery updates, and account recovery all stay smooth and secure.
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-white/12 bg-white/10 p-4 backdrop-blur-sm sm:min-w-[280px]">
              <p className="text-xs uppercase tracking-[0.18em] text-[#d9e4be]">
                Profile Snapshot
              </p>
              <div className="mt-4 grid gap-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[#eef2de]">Email</span>
                  <span className="rounded-full bg-white/12 px-2.5 py-1 text-xs font-semibold text-white">
                    {user?.email_verified_at ? "Verified" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[#eef2de]">Mobile</span>
                  <span className="rounded-full bg-white/12 px-2.5 py-1 text-xs font-semibold text-white">
                    {user?.mobile_verified_at ? "Verified" : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative px-5 pb-5 pt-5 sm:px-7 sm:pb-7 sm:pt-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] border-4 border-white bg-[linear-gradient(135deg,#4d6b35,#769158)] text-2xl font-semibold text-white shadow-[0_18px_44px_rgba(77,107,53,0.28)] sm:h-28 sm:w-28 sm:text-3xl">
                {initials}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="font-poppins text-2xl font-semibold text-[#2f3b1f] sm:text-3xl">
                    {user?.name ?? "Guest User"}
                  </p>
                  <p className="mt-1 text-sm text-[#6d7452]">
                    {user?.email ?? "No email yet"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#edf4e4] px-3 py-1 text-xs font-semibold text-[#4d6b35] capitalize">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {user?.role ? `${user.role} member` : "customer member"}
                  </span>
                  {user?.account_id ? (
                    <span className="inline-flex rounded-full bg-[#f8f4e7] px-3 py-1 text-xs font-semibold text-[#7c6740]">
                      {user.account_id}
                    </span>
                  ) : null}
                  <span className="inline-flex rounded-full bg-[#f4efdf] px-3 py-1 text-xs font-semibold text-[#7c7b55]">
                    {user?.mobile ? `+63 ${user.mobile}` : "No mobile saved yet"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
              <div className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#9a987b]">
                  Email status
                </p>
                <p className="mt-2 text-sm font-semibold text-[#2f3b1f]">
                  {user?.email_verified_at ? "Ready for account recovery" : "Needs verification"}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#9a987b]">
                  Mobile status
                </p>
                <p className="mt-2 text-sm font-semibold text-[#2f3b1f]">
                  {user?.mobile_verified_at ? "Ready for OTP updates" : "Needs verification"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {profileError ? (
        <div className="rounded-2xl border border-[#e9cabb] bg-[#fff4ef] px-4 py-3 text-sm text-[#a14c34]">
          {profileError}
        </div>
      ) : null}

      {profileSaveMessage ? (
        <div className="rounded-2xl border border-[#d6e2c3] bg-[#f3f7ed] px-4 py-3 text-sm text-[#43612e]">
          {profileSaveMessage}
        </div>
      ) : null}

      <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
                Personal Information
              </p>
              {isEditingPersonalInfo ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#253119] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1c2512] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSavingProfile ? (
                      <>
                        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5" />
                        Save
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#d8d4be] bg-[#faf7ee] px-3 py-2 text-xs font-semibold text-[#364127] transition hover:bg-[#f4efdf]"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingPersonalInfo(true);
                    setProfileError("");
                    setProfileSaveMessage("");
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#d8d4be] bg-[#faf7ee] px-3 py-2 text-xs font-semibold text-[#364127] transition hover:bg-[#f4efdf]"
                >
                  <PencilLine className="h-3.5 w-3.5" />
                  Edit
                </button>
              )}
            </div>

            {isEditingPersonalInfo ? (
              <div className="mt-5 grid gap-4">
                <div className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] px-4 py-4">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a987b]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={nameDraft}
                    onChange={(event) => setNameDraft(event.target.value)}
                    className="mt-3 w-full rounded-xl border border-[#d8d4be] bg-white px-4 py-3 text-sm font-medium text-[#2f3b1f] outline-none transition focus:border-[var(--color-rice-green)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-rice-green)_18%,transparent)]"
                  />
                </div>

                <div className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a987b]">
                    Email Address
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#2f3b1f] sm:text-base">
                    {user?.email ?? "No email yet"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#6d7452]">
                    Email changes live under Settings for verification and recovery safety.
                  </p>
                </div>

                <div className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a987b]">
                    Mobile Number
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#2f3b1f] sm:text-base">
                    {user?.mobile ? `+63 ${user.mobile}` : "No mobile yet"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#6d7452]">
                    Mobile updates also stay in Settings so OTP verification remains secure.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                <div className="flex items-start gap-4 rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] px-4 py-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--color-rice-green)] shadow-[0_10px_24px_rgba(78,95,58,0.08)]">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a987b]">
                      Full Name
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#2f3b1f] sm:text-base">
                      {user?.name ?? "Guest User"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] px-4 py-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--color-rice-green)] shadow-[0_10px_24px_rgba(78,95,58,0.08)]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a987b]">
                      Email Address
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#2f3b1f] sm:text-base">
                      {user?.email ?? "No email yet"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] px-4 py-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--color-rice-green)] shadow-[0_10px_24px_rgba(78,95,58,0.08)]">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a987b]">
                      Mobile Number
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#2f3b1f] sm:text-base">
                      {user?.mobile ? `+63 ${user.mobile}` : "No mobile yet"}
                    </p>
                  </div>
                </div>
              </div>
            )}
      </section>

      <AccountAddressBook
        userMobile={user?.mobile ?? ""}
        userName={nameDraft.trim() || user?.name || ""}
        onAddressChange={() => setAddressRefreshKey((prev) => prev + 1)}
      />

      <AccountDeliveryPreferences refreshKey={addressRefreshKey} />

      <AccountPaymentPreferences />
    </CustomerShell>
  );
}

