"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  LoaderCircle,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import AdminShell from "@/app/admin/_components/admin-shell";
import { SettingsSectionSkeleton } from "@/app/(user)/settings/_components/settings-page-skeleton";

type TrustedDevice = {
  id: number;
  name: string;
  user_agent?: string | null;
  ip_address?: string | null;
  last_used_at?: string | null;
  created_at?: string | null;
  expires_at?: string | null;
  is_current?: boolean;
};

export default function AdminTrustedDevicesContent() {
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemovingId, setIsRemovingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDevices = async () => {
      try {
        const response = await fetch("/api/auth/trusted-devices", {
          cache: "no-store",
        });

        const data = (await response.json().catch(() => null)) as
          | {
              devices?: TrustedDevice[];
              message?: string;
            }
          | null;

        if (!isMounted) {
          return;
        }

        if (!response.ok) {
          setError(data?.message ?? "Unable to load your trusted devices.");
          return;
        }

        setDevices(data?.devices ?? []);
      } catch {
        if (isMounted) {
          setError("Something went wrong while loading your trusted devices.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDevices();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRemove = async (deviceId: number) => {
    setIsRemovingId(deviceId);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/auth/trusted-devices/${deviceId}`, {
        method: "DELETE",
      });

      const data = (await response.json().catch(() => null)) as
        | {
            message?: string;
          }
        | null;

      if (!response.ok) {
        setError(data?.message ?? "Unable to remove this trusted device.");
        return;
      }

      setDevices((current) => current.filter((device) => device.id !== deviceId));
      setMessage(data?.message ?? "Trusted device removed successfully.");
    } catch {
      setError("Something went wrong while removing this trusted device.");
    } finally {
      setIsRemovingId(null);
    }
  };

  const formatDate = (value?: string | null) => {
    if (!value) {
      return "Not available";
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "Not available"
      : date.toLocaleString();
  };

  return (
    <AdminShell
      subtitle="See which devices can skip admin login 2FA and remove anything unfamiliar."
      searchPlaceholder="Search admin trusted devices or session help"
    >
      <div>
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-2 rounded-full border border-[#d8d4be] bg-[#faf7ee] px-4 py-2 text-sm font-semibold text-[var(--color-rice-green)] transition hover:bg-[#f4efdf] hover:text-[color:color-mix(in_srgb,var(--color-rice-green)_85%,black)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to settings overview
        </Link>
      </div>

      <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
            Trusted Devices
          </p>
          <p className="mt-1 text-sm leading-6 text-[#6d7452]">
            Review devices that can skip admin login 2FA and remove anything you no longer recognize.
          </p>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-[#e9cabb] bg-[#fff4ef] px-4 py-3 text-sm text-[#a14c34]">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="mt-6 rounded-2xl border border-[#d6e2c3] bg-[#f3f7ed] px-4 py-3 text-sm text-[#43612e]">
            {message}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-6">
            <SettingsSectionSkeleton rows={3} />
          </div>
        ) : devices.length > 0 ? (
          <div className="mt-6 grid gap-4">
            {devices.map((device) => (
              <div
                key={device.id}
                className="rounded-[1.6rem] border border-[#e5e0cc] bg-[#faf7ee] p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-white p-2 text-[var(--color-rice-green)] shadow-[0_8px_24px_rgba(74,92,54,0.08)]">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-[#364127]">
                          {device.name}
                        </p>
                        {device.is_current ? (
                          <span className="rounded-full bg-[#edf4e4] px-2.5 py-1 text-[11px] font-semibold text-[#4d6b35]">
                            Current device
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-[#6d7452]">
                        {device.user_agent || "Browser details not available"}
                      </p>
                      <div className="mt-3 grid gap-1 text-xs text-[#7b7a60]">
                        <p>Last used: {formatDate(device.last_used_at)}</p>
                        <p>Added: {formatDate(device.created_at)}</p>
                        <p>Expires: {formatDate(device.expires_at)}</p>
                        <p>IP address: {device.ip_address || "Not available"}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(device.id)}
                    disabled={isRemovingId === device.id}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d8d4be] bg-white px-4 py-2.5 text-sm font-semibold text-[#364127] transition hover:bg-[#f4efdf] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isRemovingId === device.id ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[1.6rem] border border-[#e5e0cc] bg-[#faf7ee] p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white p-2 text-[var(--color-rice-green)] shadow-[0_8px_24px_rgba(74,92,54,0.08)]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#364127]">
                  No trusted devices yet
                </p>
                <p className="mt-1 text-sm leading-6 text-[#6d7452]">
                  Once you choose to trust a device during admin login 2FA, it will appear here and future logins on that device can skip the extra code until it expires or you remove it.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
