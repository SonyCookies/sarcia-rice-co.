"use client";

export type PendingVerificationUser = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: string;
  email_verified_at?: string | null;
  mobile_verified_at?: string | null;
  source?: "register" | "login" | "account";
  returnTo?: string;
};

const PENDING_VERIFICATION_KEY = "riceproject_pending_verification";

type PendingVerificationOptions = {
  returnTo?: string;
  source?: "register" | "login" | "account";
};

export function savePendingVerificationUser(
  user: PendingVerificationUser,
  options?: PendingVerificationOptions
) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    PENDING_VERIFICATION_KEY,
    JSON.stringify({
      ...user,
      ...options,
    } satisfies PendingVerificationUser)
  );
}

export function getPendingVerificationUser(): PendingVerificationUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.sessionStorage.getItem(PENDING_VERIFICATION_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as PendingVerificationUser;
  } catch {
    return null;
  }
}

export function clearPendingVerificationUser() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(PENDING_VERIFICATION_KEY);
}
