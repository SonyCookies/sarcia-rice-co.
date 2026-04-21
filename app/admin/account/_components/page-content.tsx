"use client";

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

import AdminShell from "@/app/admin/_components/admin-shell";
import { useAuthStore } from "@/app/_stores/auth-store";

export default function AdminAccountPageContent() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveMessage, setProfileSaveMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [nameDraft, setNameDraft] = useState(user?.name ?? "");

  const initials = useMemo(() => {
    const name = user?.name?.trim();

    if (!name) {
      return "AD";
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
        setProfileError("Full name is required before saving your admin profile.");
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
            "Unable to update your admin profile right now."
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
        data?.message ?? "Admin profile updated successfully."
      );
      setIsEditingPersonalInfo(false);
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <AdminShell
      subtitle="Your admin identity, recovery readiness, and access snapshot in one place."
      searchPlaceholder="Search admin profile, access overview, or security readiness"
    >
      <section className="overflow-hidden rounded-[2rem] border border-[#d8d4be] bg-white/92 shadow-[0_30px_80px_rgba(44,60,29,0.12)]">
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#243716_0%,#355125_48%,#5f7f43_100%)] px-5 py-6 sm:px-7 sm:py-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--color-rich-gold)_22%,transparent),transparent_22%),radial-gradient(circle_at_bottom_right,color-mix(in_srgb,#ffffff_12%,transparent),transparent_30%)]" />
          <div className="absolute -right-12 top-8 h-32 w-32 rounded-full bg-white/8 blur-2xl sm:h-40 sm:w-40" />
          <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-[color:color-mix(in_srgb,var(--color-rich-gold)_18%,transparent)] blur-2xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-rich-gold)]">
                Admin Account
              </p>
              <h1 className="mt-3 font-poppins text-3xl font-semibold leading-tight text-white sm:text-4xl">
                Your admin identity and sign-in readiness, without the customer-only extras.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#eef2de] sm:text-base">
                This account page stays focused on who you are, how recovery works, and whether your admin profile is ready for protected actions.
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-white/12 bg-white/10 p-4 backdrop-blur-sm sm:min-w-[280px]">
              <p className="text-xs uppercase tracking-[0.18em] text-[#d9e4be]">
                Admin Snapshot
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
                    {user?.name ?? "Admin User"}
                  </p>
                  <p className="mt-1 text-sm text-[#6d7452]">
                    {user?.email ?? "admin@sarciariceco.com"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#edf4e4] px-3 py-1 text-xs font-semibold text-[#4d6b35] capitalize">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {user?.role ? `${user.role} access` : "admin access"}
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

            <div
              id="access-overview"
              className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]"
            >
              <div className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#9a987b]">
                  Recovery readiness
                </p>
                <p className="mt-2 text-sm font-semibold text-[#2f3b1f]">
                  {user?.email_verified_at && user?.mobile_verified_at
                    ? "Two recovery paths available"
                    : "Needs one more recovery method"}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#9a987b]">
                  Protected account
                </p>
                <p className="mt-2 text-sm font-semibold text-[#2f3b1f]">
                  {user?.two_factor_enabled ? "Two-factor active" : "Two-factor recommended"}
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

      <section
        id="personal-information"
        className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6"
      >
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
                Admin email changes stay inside Settings so verification and recovery can stay protected.
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
                Mobile updates also stay in Settings so verification prompts remain secure.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {[
              {
                title: "Full Name",
                value: user?.name ?? "Admin User",
                icon: UserRound,
              },
              {
                title: "Email Address",
                value: user?.email ?? "No email yet",
                icon: Mail,
              },
              {
                title: "Mobile Number",
                value: user?.mobile ? `+63 ${user.mobile}` : "No mobile yet",
                icon: Phone,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] px-4 py-4"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--color-rice-green)] shadow-[0_10px_24px_rgba(78,95,58,0.08)]">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a987b]">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#2f3b1f] sm:text-base">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </AdminShell>
  );
}
