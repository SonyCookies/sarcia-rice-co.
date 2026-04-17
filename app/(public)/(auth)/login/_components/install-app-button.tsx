"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

function getIsStandalone() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    setIsStandalone(getIsStandalone());

    const mediaQuery = window.matchMedia("(display-mode: standalone)");

    const syncMode = () => {
      setIsStandalone(getIsStandalone());
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      syncMode();
    };

    const handleInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    mediaQuery.addEventListener("change", syncMode);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      mediaQuery.removeEventListener("change", syncMode);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (isStandalone || !deferredPrompt) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleInstall()}
      disabled={isInstalling}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d8d4be] bg-[#fffef9] py-3 text-sm font-semibold text-[#364127] transition hover:bg-[#f7f3e7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-rice-green)_15%,transparent)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      <Download className="h-4 w-4" />
      <span>{isInstalling ? "Opening install..." : "Install App"}</span>
    </button>
  );
}
