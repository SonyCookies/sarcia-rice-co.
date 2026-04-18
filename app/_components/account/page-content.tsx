"use client";

import dynamic from "next/dynamic";
import {
  BadgeCheck,
  LoaderCircle,
  LogOut,
  Mail,
  PencilLine,
  Phone,
  Save,
  UserRound,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { savePendingVerificationUser } from "@/app/(public)/(auth)/register/_lib/pending-verification";
import CustomerShell from "@/app/_components/customer-shell";
import { useAuthStore } from "@/app/_stores/auth-store";

const AccountAddressBook = dynamic(
  () => import("./address-book"),
  { ssr: false }
);

const AccountDeliveryPreferences = dynamic(
  () => import("./delivery-preferences"),
  { ssr: false }
);

const AccountPaymentPreferences = dynamic(
  () => import("./payment-preferences"),
  { ssr: false }
);

export default function AccountPageContent() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);
  const setUser = useAuthStore((state) => state.setUser);
  const [verificationError, setVerificationError] = useState("");
  const [activeVerificationMethod, setActiveVerificationMethod] = useState<
    "email" | "phone" | null
  >(null);
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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      clearUser();
      window.location.href = "/login";
    }
  };

  const handleStartVerification = async (method: "email" | "phone") => {
    if (!user) {
      return;
    }

    setVerificationError("");
    setActiveVerificationMethod(method);

    try {
      savePendingVerificationUser(user, {
        source: "account",
      });

      const response = await fetch("/api/auth/verification/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          method,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | {
            message?: string;
          }
        | null;

      if (!response.ok) {
        setVerificationError(
          data?.message ?? "Unable to send the verification code."
        );
        return;
      }

      router.push(`/verify-otp?method=${method}&source=account`);
    } catch {
      setVerificationError(
        "Something went wrong while sending the verification code."
      );
    } finally {
      setActiveVerificationMethod(null);
    }
  };

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

      const response = await fetch("/api/auth/profile", {
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
        <div className="relative h-44 bg-[linear-gradient(135deg,#2c441d_0%,#3d5a2b_52%,#5d7f42_100%)] sm:h-52">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--color-rich-gold)_22%,transparent),transparent_24%),radial-gradient(circle_at_bottom_right,color-mix(in_srgb,#ffffff_10%,transparent),transparent_28%)]" />
          <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-rich-gold)] backdrop-blur sm:left-7 sm:top-7">
            Account
          </div>
          <div className="absolute bottom-5 left-[7.75rem] right-5 sm:left-[9.25rem] sm:right-7 lg:hidden">
            <h1 className="font-poppins text-2xl font-semibold leading-tight text-white sm:text-3xl">
              {user?.name ?? "Guest User"}
            </h1>
          </div>
          <div className="absolute bottom-6 left-40 hidden lg:block">
            <h1 className="font-poppins text-4xl font-semibold text-white">
              {user?.name ?? "Guest User"}
            </h1>
          </div>
        </div>

        <div className="relative px-5 pb-5 pt-0 sm:px-7 sm:pb-7">
          <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 lg:-mt-16 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] border-4 border-white bg-[linear-gradient(135deg,#4d6b35,#769158)] text-2xl font-semibold text-white shadow-[0_18px_44px_rgba(77,107,53,0.28)] sm:h-28 sm:w-28 sm:text-3xl">
                {initials}
              </div>
              <div className="pb-1">
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#edf4e4] px-3 py-1 text-xs font-semibold text-[#4d6b35] capitalize lg:bg-[#2c441d]/10">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {user?.role ? `${user.role} member` : "customer member"}
                  </span>
                </div>
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

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div>
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
        </div>

        <div>
          <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
              Profile Credentials
            </p>

            <div className="mt-5 grid gap-3">
              <div className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#9a987b]">
                      Email Verification
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#2f3b1f]">
                      {user?.email_verified_at ? "Verified" : "Pending verification"}
                    </p>
                  </div>
                  {!user?.email_verified_at ? (
                    <button
                      type="button"
                      onClick={() => handleStartVerification("email")}
                      disabled={activeVerificationMethod !== null}
                      className="inline-flex min-w-[120px] items-center justify-center rounded-xl bg-[#253119] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1c2512] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {activeVerificationMethod === "email" ? (
                        <span className="flex items-center gap-2">
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        "Verify Email"
                      )}
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#9a987b]">
                      Mobile Verification
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#2f3b1f]">
                      {user?.mobile_verified_at ? "Verified" : "Pending verification"}
                    </p>
                  </div>
                  {!user?.mobile_verified_at ? (
                    <button
                      type="button"
                      onClick={() => handleStartVerification("phone")}
                      disabled={activeVerificationMethod !== null}
                      className="inline-flex min-w-[124px] items-center justify-center rounded-xl bg-[#253119] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1c2512] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {activeVerificationMethod === "phone" ? (
                        <span className="flex items-center gap-2">
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        "Verify Mobile"
                      )}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {verificationError ? (
              <div className="mt-4 rounded-2xl border border-[#e9cabb] bg-[#fff4ef] px-4 py-3 text-sm text-[#a14c34]">
                {verificationError}
              </div>
            ) : null}
          </section>
        </div>
      </section>

      <AccountAddressBook
        userMobile={user?.mobile ?? ""}
        userName={nameDraft.trim() || user?.name || ""}
        onAddressChange={() => setAddressRefreshKey((prev) => prev + 1)}
      />

      <AccountDeliveryPreferences refreshKey={addressRefreshKey} />

      <AccountPaymentPreferences />

      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d8d4be] bg-[#253119] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1c2512] lg:hidden"
      >
        <LogOut className="h-3.5 w-3.5" />
        Logout
      </button>
    </CustomerShell>
  );
}
