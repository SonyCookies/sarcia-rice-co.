"use client";

export type TwoFactorChallengePurpose =
  | "change_password"
  | "manage_two_factor"
  | "change_email"
  | "change_mobile"
  | "login";

export type PendingTwoFactorAction =
  | {
      type: "change_password";
      payload: {
        current_password: string;
        password: string;
        password_confirmation: string;
      };
    }
  | {
      type: "update_two_factor";
      payload: {
        enabled: boolean;
        method: "email" | "phone" | null;
      };
    }
  | {
      type: "update_email";
      payload: {
        email: string;
      };
    }
  | {
      type: "update_mobile";
      payload: {
        mobile: string;
      };
    };

export type PendingTwoFactorChallenge = {
  purpose: TwoFactorChallengePurpose;
  method: "email" | "phone";
  returnTo: string;
  email?: string;
  mobile?: string;
  action?: PendingTwoFactorAction;
};

const PENDING_TWO_FACTOR_CHALLENGE_KEY =
  "riceproject_pending_two_factor_challenge";

export function savePendingTwoFactorChallenge(
  challenge: PendingTwoFactorChallenge
) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    PENDING_TWO_FACTOR_CHALLENGE_KEY,
    JSON.stringify(challenge)
  );
}

export function getPendingTwoFactorChallenge(): PendingTwoFactorChallenge | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.sessionStorage.getItem(PENDING_TWO_FACTOR_CHALLENGE_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as PendingTwoFactorChallenge;
  } catch {
    return null;
  }
}

export function clearPendingTwoFactorChallenge() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(PENDING_TWO_FACTOR_CHALLENGE_KEY);
}
