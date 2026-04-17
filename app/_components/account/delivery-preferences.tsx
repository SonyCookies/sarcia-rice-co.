"use client";

import {
  ClipboardList,
  Clock3,
  Plus,
  Save,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const PROFILE_DELIVERY_STORAGE_KEY = "riceproject_delivery_preferences";

type DeliveryWindow = {
  id: string;
  label: string;
  start_time: string;
  end_time: string;
  is_default: boolean;
};

type DeliveryPreferences = {
  delivery_notes: string;
  preferred_delivery_window: string;
  delivery_windows: DeliveryWindow[];
};

function createEmptyWindow(): DeliveryWindow {
  return {
    id: `delivery-window-${crypto.randomUUID()}`,
    label: "",
    start_time: "",
    end_time: "",
    is_default: false,
  };
}

function createEmptyPreferences(): DeliveryPreferences {
  return {
    delivery_notes: "",
    preferred_delivery_window: "",
    delivery_windows: [],
  };
}

function normalizeWindows(windows: DeliveryWindow[]) {
  if (windows.length === 0) {
    return windows;
  }

  const defaultIndex = windows.findIndex((window) => window.is_default);
  const normalizedWindows =
    defaultIndex === -1
      ? windows.map((window, index) => ({
          ...window,
          is_default: index === 0,
        }))
      : windows.map((window, index) => ({
          ...window,
          is_default: index === defaultIndex,
        }));

  return normalizedWindows.sort((leftWindow, rightWindow) => {
    if (leftWindow.is_default === rightWindow.is_default) {
      return 0;
    }

    return leftWindow.is_default ? -1 : 1;
  });
}

function normalizePreferences(
  preferences: Partial<DeliveryPreferences>
): DeliveryPreferences {
  const legacyWindow = preferences.preferred_delivery_window?.trim() ?? "";
  const parsedWindows = Array.isArray(preferences.delivery_windows)
    ? preferences.delivery_windows.map((window, index) => ({
        ...createEmptyWindow(),
        ...window,
        id: window.id || `delivery-window-${index + 1}`,
        label: window.label ?? "",
        start_time: window.start_time ?? "",
        end_time: window.end_time ?? "",
        is_default: Boolean(window.is_default),
      }))
    : [];

  const fallbackWindows =
    parsedWindows.length > 0
      ? parsedWindows
      : legacyWindow
        ? [
            {
              ...createEmptyWindow(),
              label: "Preferred window",
              start_time: legacyWindow,
              end_time: "",
              is_default: true,
            },
          ]
        : [];

  const normalizedWindows = normalizeWindows(fallbackWindows);
  const defaultWindow = normalizedWindows.find((window) => window.is_default);

  return {
    ...createEmptyPreferences(),
    ...preferences,
    delivery_notes: preferences.delivery_notes ?? "",
    delivery_windows: normalizedWindows,
    preferred_delivery_window: defaultWindow
      ? formatWindowSummary(defaultWindow)
      : "",
  };
}

function formatTimeLabel(value: string) {
  if (!value) {
    return "Choose time";
  }

  const [hoursString, minutesString] = value.split(":");
  const hours = Number(hoursString);
  const minutes = Number(minutesString);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return value;
  }

  const meridiem = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");

  return `${displayHours}:${displayMinutes} ${meridiem}`;
}

function formatWindowSummary(window: DeliveryWindow) {
  if (window.start_time && window.end_time) {
    return `${formatTimeLabel(window.start_time)} - ${formatTimeLabel(window.end_time)}`;
  }

  if (window.start_time) {
    return formatTimeLabel(window.start_time);
  }

  if (window.end_time) {
    return `Until ${formatTimeLabel(window.end_time)}`;
  }

  return "Time window not set";
}

export default function AccountDeliveryPreferences() {
  const [preferences, setPreferences] = useState<DeliveryPreferences>(() => {
    if (typeof window === "undefined") {
      return createEmptyPreferences();
    }

    const stored = window.localStorage.getItem(PROFILE_DELIVERY_STORAGE_KEY);

    if (!stored) {
      return createEmptyPreferences();
    }

    try {
      return normalizePreferences(
        JSON.parse(stored) as Partial<DeliveryPreferences>
      );
    } catch {
      return createEmptyPreferences();
    }
  });
  const [windowDrafts, setWindowDrafts] = useState<Record<string, DeliveryWindow>>(
    () =>
      Object.fromEntries(
        preferences.delivery_windows.map((window) => [window.id, window])
      )
  );
  const [pendingWindowIds, setPendingWindowIds] = useState<string[]>([]);
  const [editingWindowIds, setEditingWindowIds] = useState<string[]>([]);

  const allWindowIds = useMemo(() => {
    const pinnedEditingIds = pendingWindowIds.filter((windowId) =>
      editingWindowIds.includes(windowId)
    );
    const savedWindowIds = preferences.delivery_windows.map((window) => window.id);

    return [...pinnedEditingIds, ...savedWindowIds];
  }, [editingWindowIds, pendingWindowIds, preferences.delivery_windows]);

  const persistPreferences = (nextPreferences: DeliveryPreferences) => {
    const normalized = normalizePreferences(nextPreferences);
    setPreferences(normalized);
    setWindowDrafts((currentDrafts) => {
      const nextDrafts = { ...currentDrafts };

      normalized.delivery_windows.forEach((window) => {
        nextDrafts[window.id] = window;
      });

      return nextDrafts;
    });

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        PROFILE_DELIVERY_STORAGE_KEY,
        JSON.stringify(normalized)
      );
    }
  };

  const updatePreferences = (patch: Partial<DeliveryPreferences>) => {
    persistPreferences({
      ...preferences,
      ...patch,
    });
  };

  const handleAddWindow = () => {
    const nextWindow = createEmptyWindow();
    setWindowDrafts((currentDrafts) => ({
      ...currentDrafts,
      [nextWindow.id]: nextWindow,
    }));
    setPendingWindowIds((currentIds) => [...currentIds, nextWindow.id]);
    setEditingWindowIds((currentIds) => [...currentIds, nextWindow.id]);
  };

  const handleRemoveWindow = (windowId: string) => {
    if (pendingWindowIds.includes(windowId)) {
      setPendingWindowIds((currentIds) => currentIds.filter((id) => id !== windowId));
      setEditingWindowIds((currentIds) => currentIds.filter((id) => id !== windowId));
      setWindowDrafts((currentDrafts) => {
        const nextDrafts = { ...currentDrafts };
        delete nextDrafts[windowId];
        return nextDrafts;
      });
      return;
    }

    persistPreferences({
      ...preferences,
      delivery_windows: preferences.delivery_windows.filter(
        (window) => window.id !== windowId
      ),
    });
  };

  const handleDraftWindowChange = (
    windowId: string,
    patch: Partial<DeliveryWindow>
  ) => {
    setWindowDrafts((currentDrafts) => ({
      ...currentDrafts,
      [windowId]: {
        ...(currentDrafts[windowId] ??
          preferences.delivery_windows.find((window) => window.id === windowId) ??
          createEmptyWindow()),
        ...patch,
      },
    }));
  };

  const handleSaveWindow = (windowId: string) => {
    const draftWindow = windowDrafts[windowId];

    if (!draftWindow) {
      return;
    }

    const isPendingWindow = pendingWindowIds.includes(windowId);

    persistPreferences({
      ...preferences,
      delivery_windows: isPendingWindow
        ? [...preferences.delivery_windows, draftWindow]
        : preferences.delivery_windows.map((window) =>
            window.id === windowId ? draftWindow : window
          ),
    });

    if (isPendingWindow) {
      setPendingWindowIds((currentIds) => currentIds.filter((id) => id !== windowId));
    }

    setEditingWindowIds((currentIds) => currentIds.filter((id) => id !== windowId));
  };

  const handleCancelWindow = (windowId: string) => {
    if (pendingWindowIds.includes(windowId)) {
      setPendingWindowIds((currentIds) => currentIds.filter((id) => id !== windowId));
      setEditingWindowIds((currentIds) => currentIds.filter((id) => id !== windowId));
      setWindowDrafts((currentDrafts) => {
        const nextDrafts = { ...currentDrafts };
        delete nextDrafts[windowId];
        return nextDrafts;
      });
      return;
    }

    const savedWindow = preferences.delivery_windows.find(
      (window) => window.id === windowId
    );

    if (!savedWindow) {
      return;
    }

    setWindowDrafts((currentDrafts) => ({
      ...currentDrafts,
      [windowId]: savedWindow,
    }));
    setEditingWindowIds((currentIds) => currentIds.filter((id) => id !== windowId));
  };

  const handleSetDefaultWindow = (windowId: string) => {
    persistPreferences({
      ...preferences,
      delivery_windows: preferences.delivery_windows.map((window) => ({
        ...window,
        is_default: window.id === windowId,
      })),
    });
  };

  return (
    <section className="grid gap-5 xl:grid-cols-2">
      <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
        <div className="mb-4 flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
              Preferred Delivery Windows
            </p>
            <p className="mt-1 text-sm leading-6 text-[#6d7452]">
              Save multiple time windows for the day and mark one as the main default.
            </p>
          </div>
          <div className="w-full sm:ml-auto sm:w-auto">
            <button
              type="button"
              onClick={handleAddWindow}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#253119] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1c2512] sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Window
            </button>
          </div>
        </div>

        <div className="grid gap-3">
          {allWindowIds.length > 0 ? (
            allWindowIds.map((windowId) => {
              const savedWindow = preferences.delivery_windows.find(
                (window) => window.id === windowId
              );
              const window = windowDrafts[windowId] ?? savedWindow;

              if (!window) {
                return null;
              }

              const isPendingWindow = pendingWindowIds.includes(windowId);
              const isEditingWindow =
                isPendingWindow || editingWindowIds.includes(windowId);

              return (
              <div
                key={window.id}
                className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {isEditingWindow ? (
                    <input
                      type="text"
                      value={window.label}
                      onChange={(event) =>
                        handleDraftWindowChange(window.id, {
                          label: event.target.value,
                        })
                      }
                      placeholder="Window label"
                      className="min-w-0 flex-1 rounded-xl border border-[#d8d4be] bg-white px-4 py-3 text-sm text-[#2f3b1f] outline-none transition focus:border-[var(--color-rice-green)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-rice-green)_18%,transparent)]"
                    />
                  ) : (
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#2f3b1f]">
                        {window.label.trim() || "Untitled window"}
                      </p>
                      <p className="mt-1 text-sm text-[#6d7452]">
                        {formatWindowSummary(window)}
                      </p>
                    </div>
                  )}
                  {!isEditingWindow ? (
                    <button
                      type="button"
                      onClick={() => handleSetDefaultWindow(window.id)}
                      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                        window.is_default
                          ? "bg-[#edf4e4] text-[#4d6b35]"
                          : "border border-[#d8d4be] bg-white text-[#5f6848] hover:bg-[#f8f5ea]"
                      }`}
                      disabled={isPendingWindow}
                    >
                      <Star className="h-3.5 w-3.5" />
                      {window.is_default ? "Primary" : "Set Primary"}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleRemoveWindow(window.id)}
                    disabled={preferences.delivery_windows.length <= 1}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#e3d6c0] bg-white px-3 py-2 text-xs font-semibold text-[#8a5b2b] transition hover:bg-[#fff8ef] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                  {!isEditingWindow ? (
                    <button
                      type="button"
                      onClick={() =>
                        setEditingWindowIds((currentIds) => [...currentIds, window.id])
                      }
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#d8d4be] bg-white px-3 py-2 text-xs font-semibold text-[#4e5a3d] transition hover:bg-[#f8f5ea]"
                    >
                      Edit
                    </button>
                  ) : null}
                </div>

                {isEditingWindow ? (
                  <>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8d8b71]">
                          Start Time
                        </span>
                        <input
                          type="time"
                          value={window.start_time}
                          onChange={(event) =>
                            handleDraftWindowChange(window.id, {
                              start_time: event.target.value,
                            })
                          }
                          className="rounded-xl border border-[#d8d4be] bg-white px-4 py-3 text-sm text-[#2f3b1f] outline-none transition focus:border-[var(--color-rice-green)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-rice-green)_18%,transparent)]"
                        />
                      </label>

                      <label className="grid gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8d8b71]">
                          End Time
                        </span>
                        <input
                          type="time"
                          value={window.end_time}
                          onChange={(event) =>
                            handleDraftWindowChange(window.id, {
                              end_time: event.target.value,
                            })
                          }
                          className="rounded-xl border border-[#d8d4be] bg-white px-4 py-3 text-sm text-[#2f3b1f] outline-none transition focus:border-[var(--color-rice-green)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-rice-green)_18%,transparent)]"
                        />
                      </label>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() => handleCancelWindow(window.id)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d8d4be] bg-white px-4 py-3 text-sm font-semibold text-[#4e5a3d] transition hover:bg-[#f8f5ea] sm:w-auto"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveWindow(window.id)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#253119] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1c2512] sm:w-auto"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-[#d9d3bf] bg-[#faf7ee] px-4 py-5 text-sm text-[#6d7452]">
              No delivery window saved yet. Add one to set your preferred time of day.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#faf7ee] text-[var(--color-rice-green)] shadow-[0_10px_24px_rgba(78,95,58,0.08)]">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
              Delivery Notes
            </p>
            <p className="mt-1 text-sm leading-6 text-[#6d7452]">
              Save drop-off instructions independently from the address book.
            </p>
          </div>
        </div>

        <textarea
          value={preferences.delivery_notes}
          onChange={(event) =>
            updatePreferences({
              delivery_notes: event.target.value,
            })
          }
          placeholder="Delivery notes"
          rows={5}
          className="w-full rounded-xl border border-[#d8d4be] bg-white px-4 py-3 text-sm text-[#2f3b1f] outline-none transition focus:border-[var(--color-rice-green)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-rice-green)_18%,transparent)]"
        />
      </section>
    </section>
  );
}
