import "client-only";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: string;
  email_verified_at?: string | null;
  mobile_verified_at?: string | null;
};

type AuthStore = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  clearUser: () => void;
  setUser: (user: AuthUser) => void;
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set) => ({
      user: null,
      isAuthenticated: false,
      clearUser: () =>
        set({ user: null, isAuthenticated: false }, false, "auth/clearUser"),
      setUser: (user) =>
        set({ user, isAuthenticated: true }, false, "auth/setUser"),
    }),
    {
      name: "auth-store",
    }
  )
);
