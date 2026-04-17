"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/app/_stores/auth-store";

export default function AuthBootstrap() {
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!isMounted) {
          return;
        }

        if (!response.ok) {
          clearUser();
          return;
        }

        const data = (await response.json().catch(() => null)) as
          | {
              user?: Parameters<typeof setUser>[0];
            }
          | null;

        if (data?.user) {
          setUser(data.user);
          return;
        }

        clearUser();
      } catch {
        if (isMounted) {
          clearUser();
        }
      }
    };

    void loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [clearUser, setUser]);

  return null;
}
