"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const syncServiceWorker = async () => {
      try {
        if (process.env.NODE_ENV !== "production") {
          const registrations = await navigator.serviceWorker.getRegistrations();

          await Promise.all(
            registrations.map(async (registration) => {
              await registration.unregister();
            })
          );

          const cacheKeys = await caches.keys();

          await Promise.all(
            cacheKeys
              .filter((key) => key.startsWith("sarcia-rice-"))
              .map((key) => caches.delete(key))
          );

          return;
        }

        await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
      } catch {
        // Failing silently keeps the app usable even if service workers are unsupported.
      }
    };

    void syncServiceWorker();
  }, []);

  return null;
}
