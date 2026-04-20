"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BellRing,
  CheckCircle2,
  LoaderCircle,
  Mail,
  SmartphoneNfc,
  ShieldCheck,
  Smartphone,
  Truck,
} from "lucide-react";

import CustomerShell from "@/app/(user)/_components/customer-shell";

type NotificationPreferences = {
  email_order_updates: boolean;
  email_account_alerts: boolean;
  sms_delivery_updates: boolean;
  sms_security_alerts: boolean;
};

type NotificationPreferenceResponse = {
  message?: string;
  errors?: Record<string, string[]>;
  preferences?: NotificationPreferences;
};

type PushConfigResponse = {
  message?: string;
  push?: {
    configured: boolean;
    public_key: string | null;
    subscribed_endpoints?: string[];
  };
};

type PushActionResponse = {
  message?: string;
};

const preferenceCards = [
  {
    key: "email_order_updates",
    title: "Email Order Updates",
    caption: "Receive order confirmations, order progress notices, and account-related updates by email.",
    icon: Mail,
  },
  {
    key: "email_account_alerts",
    title: "Email Security Alerts",
    caption: "Receive important security-related notices by email, including verification and account activity updates.",
    icon: ShieldCheck,
  },
  {
    key: "sms_delivery_updates",
    title: "SMS Delivery Notices",
    caption: "Receive rider coordination, delivery timing updates, and urgent delivery reminders on your mobile number.",
    icon: Truck,
  },
  {
    key: "sms_security_alerts",
    title: "SMS Security Alerts",
    caption: "Receive time-sensitive security-related notices on your mobile number when an action needs attention.",
    icon: Smartphone,
  },
] as const;

const emptyPreferences: NotificationPreferences = {
  email_order_updates: true,
  email_account_alerts: true,
  sms_delivery_updates: true,
  sms_security_alerts: true,
};

const defaultPushStatus = {
  configured: false,
  publicKey: null as string | null,
  isSupported: false,
  isSecureContext: false,
  permission: "default" as NotificationPermission,
  hasBrowserSubscription: false,
  isSubscribed: false,
  endpoint: null as string | null,
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);

  return Uint8Array.from(rawData, (character) => character.charCodeAt(0));
}

export default function AlertsNotificationsContent() {
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(emptyPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pushStatus, setPushStatus] = useState(defaultPushStatus);
  const [isPushLoading, setIsPushLoading] = useState(true);
  const [isPushWorking, setIsPushWorking] = useState(false);
  const [isSendingPushTest, setIsSendingPushTest] = useState(false);
  const [pushMessage, setPushMessage] = useState("");
  const [pushError, setPushError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadPreferences = async () => {
      try {
        const response = await fetch("/api/account/notification-preferences", {
          cache: "no-store",
        });

        const data = (await response.json().catch(() => null)) as
          | NotificationPreferenceResponse
          | null;

        if (!response.ok) {
          if (isMounted) {
            setError(
              data?.message ??
                "Unable to load your notification preferences right now."
            );
          }
          return;
        }

        if (isMounted && data?.preferences) {
          setPreferences(data.preferences);
        }
      } catch {
        if (isMounted) {
          setError("Something went wrong while loading your notification preferences.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadPreferences();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadPushStatus = async () => {
      const isSupported =
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;

      const isSecureContext = typeof window !== "undefined" && window.isSecureContext;
      const permission =
        typeof window !== "undefined" && "Notification" in window
          ? Notification.permission
          : "default";

      try {
        const response = await fetch("/api/account/push-notifications", {
          cache: "no-store",
        });

        const data = (await response.json().catch(() => null)) as
          | PushConfigResponse
          | null;

        let endpoint: string | null = null;

        if (isSupported && isSecureContext) {
          const registration = await navigator.serviceWorker.register("/push-sw.js");
          const subscription = await registration.pushManager.getSubscription();

          endpoint = subscription?.endpoint ?? null;
        }

        const subscribedEndpoints = data?.push?.subscribed_endpoints ?? [];
        const isLinkedToAccount =
          endpoint !== null && subscribedEndpoints.includes(endpoint);

        if (!isMounted) {
          return;
        }

        if (!response.ok) {
          setPushError(
            data?.message ??
              "Unable to load browser push notification details right now."
          );
        }

        setPushStatus({
          configured: Boolean(data?.push?.configured),
          publicKey: data?.push?.public_key ?? null,
          isSupported,
          isSecureContext,
          permission,
          hasBrowserSubscription: endpoint !== null,
          isSubscribed: isLinkedToAccount,
          endpoint,
        });
      } catch {
        if (isMounted) {
          setPushStatus((current) => ({
            ...current,
            isSupported,
            isSecureContext,
            permission,
            hasBrowserSubscription: current.endpoint !== null,
          }));
          setPushError(
            "Something went wrong while checking browser push notifications."
          );
        }
      } finally {
        if (isMounted) {
          setIsPushLoading(false);
        }
      }
    };

    void loadPushStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
    setMessage("");
    setError("");
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/account/notification-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      });

      const data = (await response.json().catch(() => null)) as
        | NotificationPreferenceResponse
        | null;

      if (!response.ok) {
        setError(
          data?.message ??
            "Unable to update your notification preferences right now."
        );
        return;
      }

      if (data?.preferences) {
        setPreferences(data.preferences);
      }

      setMessage(
        data?.message ?? "Notification preferences updated successfully."
      );
    } catch {
      setError("Something went wrong while saving your notification preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnablePush = async () => {
    setIsPushWorking(true);
    setPushMessage("");
    setPushError("");

    try {
      if (!pushStatus.isSupported) {
        setPushError("This browser does not support web push notifications.");
        return;
      }

      if (!pushStatus.isSecureContext) {
        setPushError(
          "Browser push needs a secure context. Use localhost or an HTTPS URL when testing push."
        );
        return;
      }

      if (!pushStatus.configured || !pushStatus.publicKey) {
        setPushError(
          "Push notifications are not configured on the server yet. Add your VAPID keys first."
        );
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setPushStatus((current) => ({
          ...current,
          permission,
        }));
        setPushError(
          permission === "denied"
            ? "Browser push permission was denied for this device."
            : "Please allow browser notifications to enable push on this device."
        );
        return;
      }

      const registration = await navigator.serviceWorker.register("/push-sw.js");
      const existingSubscription = await registration.pushManager.getSubscription();

      const subscription =
        existingSubscription ??
        (await registration.pushManager.subscribe({
          applicationServerKey: urlBase64ToUint8Array(pushStatus.publicKey),
          userVisibleOnly: true,
        }));

      const response = await fetch("/api/account/push-notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...subscription.toJSON(),
          contentEncoding:
            "PushManager" in window &&
            Array.isArray(PushManager.supportedContentEncodings) &&
            PushManager.supportedContentEncodings.length > 0
              ? PushManager.supportedContentEncodings[0]
              : "aes128gcm",
          device_name: "This browser",
          user_agent: navigator.userAgent,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | PushActionResponse
        | null;

      if (!response.ok) {
        setPushError(
          data?.message ??
            "Unable to enable browser push notifications for this device."
        );
        return;
      }

      setPushStatus((current) => ({
        ...current,
        endpoint: subscription.endpoint,
        hasBrowserSubscription: true,
        isSubscribed: true,
        permission,
      }));
      setPushMessage(
        data?.message ?? "Push notifications enabled for this browser."
      );
    } catch {
      setPushError("Something went wrong while enabling browser push notifications.");
    } finally {
      setIsPushWorking(false);
    }
  };

  const handleDisablePush = async () => {
    setIsPushWorking(true);
    setPushMessage("");
    setPushError("");

    try {
      if (!pushStatus.isSupported || !pushStatus.isSecureContext) {
        setPushStatus((current) => ({
          ...current,
          hasBrowserSubscription: false,
          isSubscribed: false,
          endpoint: null,
        }));
        return;
      }

      const registration = await navigator.serviceWorker.register("/push-sw.js");
      const subscription = await registration.pushManager.getSubscription();
      const endpoint = subscription?.endpoint ?? pushStatus.endpoint;

      if (endpoint) {
        await fetch("/api/account/push-notifications/unsubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ endpoint }),
        });
      }

      await subscription?.unsubscribe();

      setPushStatus((current) => ({
        ...current,
        hasBrowserSubscription: false,
        endpoint: null,
        isSubscribed: false,
      }));
      setPushMessage("Push notifications disabled for this browser.");
    } catch {
      setPushError(
        "Something went wrong while disabling browser push notifications."
      );
    } finally {
      setIsPushWorking(false);
    }
  };

  const handleSendPushTest = async () => {
    if (!pushStatus.endpoint) {
      setPushError("Enable push on this browser first before sending a test.");
      return;
    }

    setIsSendingPushTest(true);
    setPushMessage("");
    setPushError("");

    try {
      const response = await fetch("/api/account/push-notifications/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: pushStatus.endpoint,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | PushActionResponse
        | null;

      if (!response.ok) {
        setPushError(
          data?.message ?? "Unable to send a browser push test right now."
        );
        return;
      }

      setPushMessage(
        data?.message ?? "Test push notification sent. It may arrive in a few seconds."
      );
    } catch {
      setPushError("Something went wrong while sending a browser push test.");
    } finally {
      setIsSendingPushTest(false);
    }
  };

  const pushCardTitle = pushStatus.isSubscribed
    ? "Push is turned on for this browser"
    : "Turn on push for this browser";

  const pushCardDescription = pushStatus.isSubscribed
    ? "Order, delivery, and account alerts can now appear directly on this device."
    : "Receive quick order, delivery, and account alerts directly from Sarcia Rice Co.";

  const pushHelperText = !pushStatus.isSupported
    ? "This browser does not support push notifications."
    : !pushStatus.isSecureContext
      ? "Use localhost or an HTTPS address to enable push notifications."
      : pushStatus.hasBrowserSubscription && !pushStatus.isSubscribed
        ? "This browser already has notification permission, but push is not yet turned on for this account. Turn it on below to link this device to your account."
      : pushStatus.permission === "denied"
        ? "Notifications are blocked in this browser. Allow them in browser settings to turn push on again."
        : "You can turn this on or off anytime for the current browser.";

  return (
    <CustomerShell
      subtitle="Choose which updates you want to receive by email, mobile, or browser push."
      searchPlaceholder="Search alerts, notifications, or communication settings"
    >
      <div>
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 rounded-full border border-[#d8d4be] bg-[#faf7ee] px-4 py-2 text-sm font-semibold text-[var(--color-rice-green)] transition hover:bg-[#f4efdf] hover:text-[color:color-mix(in_srgb,var(--color-rice-green)_85%,black)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to settings overview
        </Link>
      </div>

      <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
        <div className="flex items-start gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
              Alerts & Notifications
            </p>
            <p className="mt-1 text-sm leading-6 text-[#6d7452]">
              Decide which email, mobile, and in-browser notices you want Sarcia Rice Co. to send for orders, deliveries, and account activity.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-[1.6rem] border border-[#ddd7c4] bg-white/85 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1.15rem] bg-[#253119] text-white shadow-[0_14px_30px_rgba(37,49,25,0.18)] sm:h-11 sm:w-11 sm:rounded-2xl">
                <SmartphoneNfc className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#364127]">
                  Browser Push Notifications
                </p>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6d7452]">
                  Turn quick browser alerts on or off for this device.
                </p>
              </div>
            </div>
            <div
              className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-xs font-semibold ${
                pushStatus.isSubscribed
                  ? "bg-[#edf4e4] text-[#43612e]"
                  : "bg-[#faf4e7] text-[#8a6633]"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {pushStatus.isSubscribed ? "Ready on this browser" : "Push is off"}
            </div>
          </div>

          {isPushLoading ? (
            <div className="mt-5 animate-pulse space-y-3">
              <div className="h-4 w-40 rounded-full bg-[#ebe6d3]" />
              <div className="h-4 w-3/4 rounded-full bg-[#ebe6d3]" />
              <div className="h-11 w-full rounded-[1.2rem] bg-[#f3efdf]" />
            </div>
          ) : (
            <>
              <div className="mt-5 rounded-[1.5rem] border border-[#e5e0cc] bg-[#faf7ee] p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-lg font-semibold text-[#2f3b1f]">
                      {pushCardTitle}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#6d7452]">
                      {pushCardDescription}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[#7a775d]">
                      {pushHelperText}
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[250px]">
                    {pushStatus.isSubscribed ? (
                      <button
                        type="button"
                        onClick={handleDisablePush}
                        disabled={isPushWorking}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-[1.2rem] border border-[#d8d4be] bg-white px-4 py-3 text-sm font-semibold text-[#364127] transition hover:bg-[#f4efdf] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isPushWorking ? (
                          <>
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            Turning off push...
                          </>
                        ) : (
                          "Turn Off Push On This Browser"
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleEnablePush}
                        disabled={isPushWorking}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-[1.2rem] bg-[#253119] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1c2512] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isPushWorking ? (
                          <>
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            Turning on push...
                          </>
                        ) : (
                          "Turn On Push On This Browser"
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleSendPushTest}
                      disabled={isSendingPushTest || !pushStatus.isSubscribed}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-[1.2rem] border border-[#d8d4be] bg-white px-4 py-3 text-sm font-semibold text-[#364127] transition hover:bg-[#f4efdf] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSendingPushTest ? (
                        <>
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                          Sending test...
                        </>
                      ) : (
                        "Send Test Push"
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {pushError ? (
                <div className="mt-5 rounded-2xl border border-[#e9cabb] bg-[#fff4ef] px-4 py-3 text-sm text-[#a14c34]">
                  {pushError}
                </div>
              ) : null}

              {pushMessage ? (
                <div className="mt-5 rounded-2xl border border-[#d6e2c3] bg-[#f3f7ed] px-4 py-3 text-sm text-[#43612e]">
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {pushMessage}
                  </span>
                </div>
              ) : null}
            </>
          )}
        </div>

        <div className="mt-6 rounded-[1.6rem] border border-[#ddd7c4] bg-white/85 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[1.05rem] bg-[#253119] text-white sm:h-10 sm:w-10 sm:rounded-2xl">
              <BellRing className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#364127]">
                Notification control
              </p>
              <p className="mt-1 text-sm leading-6 text-[#6d7452]">
                Turn on the updates you want to keep and switch off the ones you don&apos;t need right now.
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-6 grid gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-[1.5rem] border border-[#e5e0cc] bg-[#faf7ee] p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-[1.15rem] bg-white sm:h-11 sm:w-11 sm:rounded-2xl" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-40 rounded-full bg-[color:color-mix(in_srgb,var(--color-rice-green)_10%,#ffffff)]" />
                    <div className="h-4 w-3/4 rounded-full bg-[color:color-mix(in_srgb,var(--color-rice-green)_10%,#ffffff)]" />
                    <div className="h-4 w-1/2 rounded-full bg-[color:color-mix(in_srgb,var(--color-rice-green)_10%,#ffffff)]" />
                  </div>
                  <div className="h-9 w-16 rounded-full bg-white" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-4">
              {preferenceCards.map((item) => (
                <div
                  key={item.key}
                  className="rounded-[1.5rem] border border-[#e5e0cc] bg-[#faf7ee] p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1.15rem] bg-white text-[var(--color-rice-green)] shadow-[0_10px_24px_rgba(78,95,58,0.08)] sm:h-11 sm:w-11 sm:rounded-2xl">
                        <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#2f3b1f]">
                          {item.title}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#6d7452]">
                          {item.caption}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleToggle(item.key as keyof NotificationPreferences)
                      }
                      className={`inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-xs font-semibold transition sm:w-auto ${
                        preferences[item.key]
                          ? "bg-[#253119] text-white hover:bg-[#1c2512]"
                          : "bg-white text-[#364127] hover:bg-[#f4efdf]"
                      }`}
                    >
                      {preferences[item.key] ? "Allowed" : "Off"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {error ? (
              <div className="mt-5 rounded-2xl border border-[#e9cabb] bg-[#fff4ef] px-4 py-3 text-sm text-[#a14c34]">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="mt-5 rounded-2xl border border-[#d6e2c3] bg-[#f3f7ed] px-4 py-3 text-sm text-[#43612e]">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {message}
                </span>
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[1.4rem] bg-[#253119] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1c2512] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Saving preferences...
                </>
              ) : (
                "Save Notification Preferences"
              )}
            </button>
          </>
        )}
      </section>
    </CustomerShell>
  );
}
