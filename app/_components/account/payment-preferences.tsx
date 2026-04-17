"use client";

import { CreditCard, PencilLine, Save } from "lucide-react";
import { useState } from "react";

const PROFILE_PAYMENT_STORAGE_KEY = "riceproject_payment_preferences";

type PaymentPreferences = {
  payment_method: string;
};

export default function AccountPaymentPreferences() {
  const [isEditing, setIsEditing] = useState(false);
  const [preferences, setPreferences] = useState<PaymentPreferences>(() => {
    if (typeof window === "undefined") {
      return {
        payment_method: "",
      };
    }

    const stored = window.localStorage.getItem(PROFILE_PAYMENT_STORAGE_KEY);

    if (!stored) {
      return {
        payment_method: "",
      };
    }

    try {
      return JSON.parse(stored) as PaymentPreferences;
    } catch {
      return {
        payment_method: "",
      };
    }
  });

  const updatePaymentMethod = (paymentMethod: string) => {
    const nextPreferences = {
      payment_method: paymentMethod,
    };

    setPreferences(nextPreferences);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        PROFILE_PAYMENT_STORAGE_KEY,
        JSON.stringify(nextPreferences)
      );
    }
  };

  return (
    <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#faf7ee] text-[var(--color-rice-green)] shadow-[0_10px_24px_rgba(78,95,58,0.08)]">
          <CreditCard className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
            Payment Method
          </p>
          <p className="mt-1 text-sm leading-6 text-[#6d7452]">
            Keep payment preference separate from physical delivery addresses.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing((current) => !current)}
          className="ml-auto inline-flex items-center gap-2 rounded-xl border border-[#d8d4be] bg-[#faf7ee] px-3 py-2 text-xs font-semibold text-[#364127] transition hover:bg-[#f4efdf]"
        >
          {isEditing ? <Save className="h-3.5 w-3.5" /> : <PencilLine className="h-3.5 w-3.5" />}
          {isEditing ? "Done" : "Edit"}
        </button>
      </div>

      {isEditing ? (
        <input
          type="text"
          value={preferences.payment_method}
          onChange={(event) => updatePaymentMethod(event.target.value)}
          placeholder="Payment method"
          className="w-full rounded-xl border border-[#d8d4be] bg-white px-4 py-3 text-sm text-[#2f3b1f] outline-none transition focus:border-[var(--color-rice-green)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-rice-green)_18%,transparent)]"
        />
      ) : (
        <div className="rounded-2xl bg-[#faf7ee] px-4 py-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[#9a987b]">
            Saved Method
          </p>
          <p className="mt-2 font-medium text-[#364127]">
            {preferences.payment_method || "Not set"}
          </p>
        </div>
      )}
    </section>
  );
}
