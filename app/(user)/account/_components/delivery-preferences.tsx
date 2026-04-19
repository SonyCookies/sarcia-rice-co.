"use client";

import {
  CheckCircle2,
  Loader2,
  PencilLine,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AccountSectionSkeleton } from "@/app/(user)/account/_components/account-page-skeleton";
import ConfirmationModal from "@/app/_components/confirmation-modal";

type DeliveryWindow = {
  id: string;
  label: string;
  start_time: string;
  end_time: string;
  is_default: boolean;
  addresses?: { id: string; label: string; formatted_address: string }[];
};

type DeliveryNote = {
  id: string;
  content: string;
  is_default: boolean;
  addresses?: { id: string; label: string; formatted_address: string }[];
};

type DeliveryPreferences = {
  delivery_notes: DeliveryNote[];
  delivery_windows: DeliveryWindow[];
};

type UserAddressOption = {
  id: string;
  label: string;
};

type PendingDeletion =
  | { description: string; id: string; kind: "note"; title: string }
  | { description: string; id: string; kind: "window"; title: string };

function createEmptyWindow(): DeliveryWindow {
  return {
    id: `temp-window-${crypto.randomUUID()}`,
    label: "",
    start_time: "08:00",
    end_time: "12:00",
    is_default: false,
  };
}

function createEmptyNote(): DeliveryNote {
  return {
    id: `temp-note-${crypto.randomUUID()}`,
    content: "",
    is_default: false,
  };
}

function createEmptyPreferences(): DeliveryPreferences {
  return {
    delivery_notes: [],
    delivery_windows: [],
  };
}

function toUniqueAddressIds(
  addresses?: { id: string; label: string; formatted_address: string }[]
) {
  return [...new Set((addresses ?? []).map((address) => address.id))];
}

function formatTimeLabel(value: string) {
  if (!value) {
    return "Choose time";
  }

  const parts = value.split(":");
  if (parts.length < 2) return value;

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

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

function getDisplayName(value: string | null | undefined, fallback: string) {
  return value?.trim() || fallback;
}

export default function AccountDeliveryPreferences({ refreshKey }: { refreshKey?: number }) {
  const [preferences, setPreferences] = useState<DeliveryPreferences>(createEmptyPreferences());
  const [windowDrafts, setWindowDrafts] = useState<Record<string, DeliveryWindow>>({});
  const [pendingWindowIds, setPendingWindowIds] = useState<string[]>([]);
  const [editingWindowIds, setEditingWindowIds] = useState<string[]>([]);
  
  const [noteDrafts, setNoteDrafts] = useState<Record<string, DeliveryNote>>({});
  const [pendingNoteIds, setPendingNoteIds] = useState<string[]>([]);
  const [editingNoteIds, setEditingNoteIds] = useState<string[]>([]);
  
  const [userAddresses, setUserAddresses] = useState<UserAddressOption[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [pendingDeletion, setPendingDeletion] = useState<PendingDeletion | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch preferences and addresses on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [prefRes, addrRes] = await Promise.all([
          fetch("/api/account/delivery-preferences"),
          fetch("/api/account/addresses"),
        ]);

        if (!prefRes.ok) throw new Error("Failed to load delivery preferences.");
        if (!addrRes.ok) throw new Error("Failed to load addresses.");

        const [prefData, addrData] = await Promise.all([
          prefRes.json(),
          addrRes.json(),
        ]);

        setPreferences({
          delivery_notes: prefData.delivery_notes ?? [],
          delivery_windows: prefData.delivery_windows ?? [],
        });

        setUserAddresses(
          (addrData as Array<{ id: string | number; label?: string | null }>).map((address) => ({
            id: address.id.toString(),
            label: address.label || "Untitled Address",
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred.");
      } finally {
        setIsInitialLoading(false);
      }
    }

    fetchData();
  }, [refreshKey]);

  const allWindowIds = useMemo(() => {
    const pinnedEditingIds = pendingWindowIds.filter((windowId) =>
      editingWindowIds.includes(windowId)
    );
    
    // Sort saved windows to put the default one first
    const sortedSavedWindows = [...preferences.delivery_windows].sort((a, b) => {
      if (a.is_default === b.is_default) return 0;
      return a.is_default ? -1 : 1;
    });
    
    const savedWindowIds = sortedSavedWindows.map((window) => window.id);

    return [...pinnedEditingIds, ...savedWindowIds];
  }, [editingWindowIds, pendingWindowIds, preferences.delivery_windows]);

  const allNoteIds = useMemo(() => {
    const pinnedEditingIds = pendingNoteIds.filter((noteId) =>
      editingNoteIds.includes(noteId)
    );
    
    // Sort saved notes 
    const sortedSavedNotes = [...preferences.delivery_notes].sort((a, b) => {
      if (a.is_default === b.is_default) return 0;
      return a.is_default ? -1 : 1;
    });
    
    const savedNoteIds = sortedSavedNotes.map((note) => note.id);

    return [...pinnedEditingIds, ...savedNoteIds];
  }, [editingNoteIds, pendingNoteIds, preferences.delivery_notes]);

  const handleAddNote = () => {
    const nextNote = createEmptyNote();
    setNoteDrafts((currentDrafts) => ({
      ...currentDrafts,
      [nextNote.id]: nextNote,
    }));
    setPendingNoteIds((currentIds) => [...currentIds, nextNote.id]);
    setEditingNoteIds((currentIds) => [...currentIds, nextNote.id]);
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

  const handleRemoveWindow = async (windowId: string) => {
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

    const existingWindow = preferences.delivery_windows.find((item) => item.id === windowId);
    if (!existingWindow) {
      return;
    }

    setPendingDeletion({
      id: windowId,
      kind: "window",
      title: "Delete Delivery Time",
      description: `Delete ${getDisplayName(
        existingWindow.label,
        "this delivery time"
      )}?${
        existingWindow.is_default
          ? " It is currently the default, and another saved time will become the new default if available."
          : ""
      }`,
    });
  };

  const confirmRemoveWindow = async () => {
    if (!pendingDeletion || pendingDeletion.kind !== "window") {
      return;
    }

    const windowId = pendingDeletion.id;

    setActionLoadingId(windowId);
    setError(null);
    try {
      const response = await fetch(`/api/account/delivery-windows/${windowId}`, {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => null)) as
        | { message?: string; new_default_window_id?: number | string | null }
        | null;
      if (!response.ok) throw new Error(data?.message || "Failed to delete window.");
      
      setPreferences(prev => ({
        ...prev,
        delivery_windows: prev.delivery_windows
          .filter(w => w.id !== windowId)
          .map((savedWindow) => ({
            ...savedWindow,
            is_default:
              data?.new_default_window_id !== undefined && data?.new_default_window_id !== null
                ? savedWindow.id === data.new_default_window_id.toString()
                : savedWindow.is_default,
          })),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete window.");
    } finally {
      setPendingDeletion(null);
      setActionLoadingId(null);
    }
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

  const handleSaveWindow = async (windowId: string) => {
    const draftWindow = windowDrafts[windowId];
    if (!draftWindow) return;

    const isPendingWindow = pendingWindowIds.includes(windowId);
    setActionLoadingId(windowId);
    setError(null);

    try {
      const url = isPendingWindow 
        ? "/api/account/delivery-windows" 
        : `/api/account/delivery-windows/${windowId}`;
      const method = isPendingWindow ? "POST" : "PATCH";

      // When saving a window, we send start/end time and label
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: draftWindow.label,
          start_time: draftWindow.start_time,
          end_time: draftWindow.end_time,
          is_default: draftWindow.is_default,
          address_ids: draftWindow.addresses?.map(a => a.id) ?? [],
        }),
      });

      if (!response.ok) throw new Error("Failed to save window.");
      const savedWindow = await response.json();

      setPreferences(prev => {
        let nextWindows;
        if (isPendingWindow) {
          nextWindows = [...prev.delivery_windows, savedWindow];
        } else {
          nextWindows = prev.delivery_windows.map(w => w.id === windowId ? savedWindow : w);
        }
        
        // If the saved window was marked as default, backend might have flipped others
        // In our simple case, we trust the backend and maybe re-fetch or rely on the return.
        // Let's rely on the return for the specific window.
        return { ...prev, delivery_windows: nextWindows };
      });

      if (isPendingWindow) {
        setPendingWindowIds((currentIds) => currentIds.filter((id) => id !== windowId));
      }
      setEditingWindowIds((currentIds) => currentIds.filter((id) => id !== windowId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save window.");
    } finally {
      setActionLoadingId(null);
    }
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

    if (savedWindow) {
      setWindowDrafts((currentDrafts) => ({
        ...currentDrafts,
        [windowId]: savedWindow,
      }));
    }
    setEditingWindowIds((currentIds) => currentIds.filter((id) => id !== windowId));
  };

  const handleSetDefaultWindow = async (windowId: string) => {
    setActionLoadingId(windowId);
    setError(null);
    try {
      const response = await fetch(`/api/account/delivery-windows/${windowId}/set-default`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to set default window.");
      
      setPreferences(prev => ({
        ...prev,
        delivery_windows: prev.delivery_windows.map(w => ({
          ...w,
          is_default: w.id === windowId
        }))
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set default window.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSaveNote = async (noteId: string) => {
    const draftNote = noteDrafts[noteId];
    if (!draftNote) return;

    const isPendingNote = pendingNoteIds.includes(noteId);
    setActionLoadingId(noteId);
    setError(null);

    try {
      const url = isPendingNote 
        ? "/api/account/delivery-notes" 
        : `/api/account/delivery-notes/${noteId}`;
      const method = isPendingNote ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: draftNote.content,
          is_default: draftNote.is_default,
          address_ids: toUniqueAddressIds(draftNote.addresses),
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { message?: string; errors?: Record<string, string[]> }
          | null;

        const addressError = data?.errors?.address_ids?.[0] ?? data?.errors?.["address_ids.0"]?.[0];

        throw new Error(
          addressError ?? data?.message ?? "Failed to save note."
        );
      }
      const savedNote = await response.json();

      setPreferences(prev => {
        let nextNotes;
        if (isPendingNote) {
          nextNotes = [...prev.delivery_notes, savedNote];
        } else {
          nextNotes = prev.delivery_notes.map(n => n.id === noteId ? savedNote : n);
        }
        return { ...prev, delivery_notes: nextNotes };
      });

      if (isPendingNote) {
        setPendingNoteIds((currentIds) => currentIds.filter((id) => id !== noteId));
      }
      setEditingNoteIds((currentIds) => currentIds.filter((id) => id !== noteId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveNote = async (noteId: string) => {
    if (pendingNoteIds.includes(noteId)) {
      setPendingNoteIds((currentIds) => currentIds.filter((id) => id !== noteId));
      setEditingNoteIds((currentIds) => currentIds.filter((id) => id !== noteId));
      setNoteDrafts((currentDrafts) => {
        const nextDrafts = { ...currentDrafts };
        delete nextDrafts[noteId];
        return nextDrafts;
      });
      return;
    }

    const existingNote = preferences.delivery_notes.find((item) => item.id === noteId);
    if (!existingNote) {
      return;
    }

    setPendingDeletion({
      id: noteId,
      kind: "note",
      title: "Delete Delivery Note",
      description: `Delete ${getDisplayName(
        existingNote.content,
        "this delivery note"
      )}?${
        existingNote.is_default
          ? " It is currently the default, and another saved note will become the new default if available."
          : ""
      }`,
    });
  };

  const confirmRemoveNote = async () => {
    if (!pendingDeletion || pendingDeletion.kind !== "note") {
      return;
    }

    const noteId = pendingDeletion.id;

    setActionLoadingId(noteId);
    setError(null);
    try {
      const response = await fetch(`/api/account/delivery-notes/${noteId}`, {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => null)) as
        | { message?: string; new_default_note_id?: number | string | null }
        | null;
      if (!response.ok) throw new Error(data?.message || "Failed to delete note.");
      
      setPreferences(prev => ({
        ...prev,
        delivery_notes: prev.delivery_notes
          .filter(n => n.id !== noteId)
          .map((savedNote) => ({
            ...savedNote,
            is_default:
              data?.new_default_note_id !== undefined && data?.new_default_note_id !== null
                ? savedNote.id === data.new_default_note_id.toString()
                : savedNote.is_default,
          })),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note.");
    } finally {
      setPendingDeletion(null);
      setActionLoadingId(null);
    }
  };

  const handleConfirmDeletion = () => {
    if (!pendingDeletion) {
      return;
    }

    if (pendingDeletion.kind === "window") {
      void confirmRemoveWindow();
      return;
    }

    void confirmRemoveNote();
  };

  const handleCancelNote = (noteId: string) => {
    if (pendingNoteIds.includes(noteId)) {
      setPendingNoteIds((currentIds) => currentIds.filter((id) => id !== noteId));
      setEditingNoteIds((currentIds) => currentIds.filter((id) => id !== noteId));
      setNoteDrafts((currentDrafts) => {
        const nextDrafts = { ...currentDrafts };
        delete nextDrafts[noteId];
        return nextDrafts;
      });
      return;
    }

    const savedNote = preferences.delivery_notes.find((n) => n.id === noteId);
    if (savedNote) {
      setNoteDrafts((currentDrafts) => ({
        ...currentDrafts,
        [noteId]: savedNote,
      }));
    }
    setEditingNoteIds((currentIds) => currentIds.filter((id) => id !== noteId));
  };

  const handleSetDefaultNote = async (noteId: string) => {
    setActionLoadingId(noteId);
    setError(null);
    try {
      const response = await fetch(`/api/account/delivery-notes/${noteId}/set-default`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to set default note.");
      
      setPreferences(prev => ({
        ...prev,
        delivery_notes: prev.delivery_notes.map(n => ({
          ...n,
          is_default: n.id === noteId
        }))
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set default note.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDraftNoteChange = (
    noteId: string,
    patch: Partial<DeliveryNote>
  ) => {
    setNoteDrafts((currentDrafts) => ({
      ...currentDrafts,
      [noteId]: {
        ...(currentDrafts[noteId] ??
          preferences.delivery_notes.find((n) => n.id === noteId) ??
          createEmptyNote()),
        ...patch,
      },
    }));
  };

  return (
    <section className="grid gap-5 xl:grid-cols-2">
      <ConfirmationModal
        title={pendingDeletion?.title ?? ""}
        description={pendingDeletion?.description ?? ""}
        confirmLabel={
          pendingDeletion?.kind === "window"
            ? "Delete Time"
            : pendingDeletion?.kind === "note"
              ? "Delete Note"
              : "Delete"
        }
        isOpen={pendingDeletion !== null}
        isSubmitting={pendingDeletion !== null && actionLoadingId === pendingDeletion.id}
        onClose={() => setPendingDeletion(null)}
        onConfirm={handleConfirmDeletion}
      />

      <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
              Delivery Time Windows
            </p>
          </div>
          <div className="shrink-0">
            <button
              type="button"
              onClick={handleAddWindow}
              disabled={isInitialLoading || !!actionLoadingId}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#253119] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1c2512] disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Time
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-3">
          {isInitialLoading ? (
            <AccountSectionSkeleton rows={2} />
          ) : allWindowIds.length > 0 ? (
              allWindowIds.map((windowId) => {
              const savedWindow = preferences.delivery_windows.find(
                (window) => window.id === windowId
              );
              const window = windowDrafts[windowId] ?? savedWindow;

              if (!window) return null;

              const isPending = pendingWindowIds.includes(windowId);
              const isEditing = isPending || editingWindowIds.includes(windowId);
              const isLoading = actionLoadingId === windowId;

              return (
              <div
                key={windowId}
                className={`rounded-[1.4rem] border p-4 transition ${
                  isEditing ? "border-[var(--color-rice-green)] bg-[#f3f7ed]" : "border-[#e5e0cc] bg-[#faf7ee]"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {isEditing ? (
                    <input
                      type="text"
                      value={window.label}
                      onChange={(event) =>
                        handleDraftWindowChange(windowId, {
                          label: event.target.value,
                        })
                      }
                      placeholder="Window label (e.g. Morning Shift)"
                      className="min-w-0 flex-1 rounded-xl border border-[#d8d4be] bg-white px-4 py-3 text-sm text-[#2f3b1f] outline-none transition focus:border-[var(--color-rice-green)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-rice-green)_18%,transparent)]"
                    />
                  ) : (
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#2f3b1f]">
                        {(window.label || "").trim() || "Untitled window"}
                      </p>
                      <p className="mt-1 text-sm text-[#6d7452]">
                        {formatWindowSummary(window)}
                      </p>
                      {window.addresses && window.addresses.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {window.addresses.map(addr => (
                            <span key={addr.id} className="inline-flex items-center rounded-md bg-[#f0ede4] px-1.5 py-0.5 text-[10px] font-medium text-[#7b7a60] border border-[#d8d4be]">
                              {addr.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {!isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSetDefaultWindow(windowId)}
                          disabled={!!actionLoadingId}
                          className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                            window.is_default
                              ? "bg-[#edf4e4] text-[#4d6b35]"
                              : "border border-[#d8d4be] bg-white text-[#5f6848] hover:bg-[#f8f5ea]"
                          } disabled:opacity-50`}
                        >
                          {isLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          {window.is_default ? "Default" : "Make Default"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveWindow(windowId)}
                          disabled={!!actionLoadingId}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#e3d6c0] bg-white px-3 py-2 text-xs font-semibold text-[#8a5b2b] transition hover:bg-[#fff8ef] disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Remove
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingWindowIds(prev => [...prev, windowId])}
                          disabled={!!actionLoadingId}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#d8d4be] bg-white px-3 py-2 text-xs font-semibold text-[#4e5a3d] transition hover:bg-[#f8f5ea] disabled:opacity-50"
                        >
                          <PencilLine className="h-3.5 w-3.5" />
                          Edit
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>

                {isEditing ? (
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
                            handleDraftWindowChange(windowId, {
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
                            handleDraftWindowChange(windowId, {
                              end_time: event.target.value,
                            })
                          }
                          className="rounded-xl border border-[#d8d4be] bg-white px-4 py-3 text-sm text-[#2f3b1f] outline-none transition focus:border-[var(--color-rice-green)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-rice-green)_18%,transparent)]"
                        />
                      </label>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8d8b71] mb-2">
                        Apply to Addresses
                      </p>
                      {userAddresses.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {userAddresses.map((addr) => {
                            const isChecked = !!window.addresses?.some(a => a.id === addr.id);
                            return (
                              <label key={addr.id} className="flex items-center gap-2 rounded-xl border border-[#d8d4be] bg-white px-3 py-2 cursor-pointer hover:bg-[#f8f5ea] transition">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const currentAddresses = window.addresses ?? [];
                                    const nextAddresses = e.target.checked
                                      ? [...currentAddresses, { id: addr.id, label: addr.label, formatted_address: "" }]
                                      : currentAddresses.filter(a => a.id !== addr.id);
                                    handleDraftWindowChange(windowId, { addresses: nextAddresses });
                                  }}
                                  className="h-4 w-4 rounded border-[#d8d4be] text-[var(--color-rice-green)] focus:ring-[var(--color-rice-green)]"
                                />
                                <span className="text-sm text-[#2f3b1f]">{addr.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-[#6d7452] italic">No addresses saved yet.</p>
                      )}
                    </div>

                    <div className="mt-4 flex flex-col gap-3 md:flex-row md:justify-end">
                      <button
                        type="button"
                        onClick={() => handleCancelWindow(windowId)}
                        disabled={isLoading}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d8d4be] bg-white px-3 py-2 text-xs font-semibold text-[#4e5a3d] transition hover:bg-[#f8f5ea] md:w-auto disabled:opacity-50"
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveWindow(windowId)}
                        disabled={isLoading}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#253119] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1c2512] md:w-auto disabled:opacity-50"
                      >
                        {isLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Save className="h-3.5 w-3.5" />
                        )}
                        Save Time
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

      <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6 flex flex-col">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
              Delivery Notes
            </p>
          </div>
          <div className="shrink-0">
            <button
              type="button"
              onClick={handleAddNote}
              disabled={isInitialLoading || !!actionLoadingId}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#253119] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1c2512] disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Note
            </button>
          </div>
        </div>

        <div className="grid gap-3">
          {isInitialLoading ? (
            <AccountSectionSkeleton rows={2} />
          ) : allNoteIds.length > 0 ? (
              allNoteIds.map((noteId) => {
              const savedNote = preferences.delivery_notes.find(
                (n) => n.id === noteId
              );
              const note = noteDrafts[noteId] ?? savedNote;

              if (!note) return null;

              const isPending = pendingNoteIds.includes(noteId);
              const isEditing = isPending || editingNoteIds.includes(noteId);
              const isLoading = actionLoadingId === noteId;

              return (
                <div
                  key={noteId}
                  className={`rounded-[1.4rem] border p-4 transition ${
                    isEditing ? "border-[var(--color-rice-green)] bg-[#f3f7ed]" : "border-[#e5e0cc] bg-[#faf7ee]"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <textarea
                          value={note.content}
                          onChange={(event) =>
                            handleDraftNoteChange(noteId, {
                              content: event.target.value,
                            })
                          }
                          placeholder="e.g. Leave at the front desk, call upon arrival"
                          rows={3}
                          className="w-full rounded-xl border border-[#d8d4be] bg-white px-4 py-3 text-sm text-[#2f3b1f] outline-none transition focus:border-[var(--color-rice-green)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-rice-green)_18%,transparent)]"
                        />
                      ) : (
                        <>
                          <p className="text-sm text-[#2f3b1f] whitespace-pre-wrap">
                            {note.content || "Empty instruction"}
                          </p>
                          {note.addresses && note.addresses.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {note.addresses.map(addr => (
                                <span key={addr.id} className="inline-flex items-center rounded-md bg-[#f0ede4] px-1.5 py-0.5 text-[10px] font-medium text-[#7b7a60] border border-[#d8d4be]">
                                  {addr.label}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {!isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSetDefaultNote(noteId)}
                            disabled={!!actionLoadingId}
                            className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                              note.is_default
                                ? "bg-[#edf4e4] text-[#4d6b35]"
                                : "border border-[#d8d4be] bg-white text-[#5f6848] hover:bg-[#f8f5ea]"
                            } disabled:opacity-50`}
                          >
                            {isLoading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            {note.is_default ? "Default" : "Make Default"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveNote(noteId)}
                            disabled={!!actionLoadingId}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#e3d6c0] bg-white px-3 py-2 text-xs font-semibold text-[#8a5b2b] transition hover:bg-[#fff8ef] disabled:opacity-50"
                          >
                            {isLoading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            Remove
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingNoteIds(prev => [...prev, noteId])}
                            disabled={!!actionLoadingId}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#d8d4be] bg-white px-3 py-2 text-xs font-semibold text-[#4e5a3d] transition hover:bg-[#f8f5ea] disabled:opacity-50"
                          >
                            <PencilLine className="h-3.5 w-3.5" />
                            Edit
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8d8b71] mb-2">
                        Apply to Addresses
                      </p>
                      {userAddresses.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {userAddresses.map((addr) => {
                            const isChecked = !!note.addresses?.some(a => a.id === addr.id);
                            return (
                              <label key={addr.id} className="flex items-center gap-2 rounded-xl border border-[#d8d4be] bg-white px-3 py-2 cursor-pointer hover:bg-[#f8f5ea] transition">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const currentAddresses = note.addresses ?? [];
                                    const nextAddresses = e.target.checked
                                      ? [...currentAddresses, { id: addr.id, label: addr.label, formatted_address: "" }]
                                      : currentAddresses.filter(a => a.id !== addr.id);
                                    handleDraftNoteChange(noteId, { addresses: nextAddresses });
                                  }}
                                  className="h-4 w-4 rounded border-[#d8d4be] text-[var(--color-rice-green)] focus:ring-[var(--color-rice-green)]"
                                />
                                <span className="text-sm text-[#2f3b1f]">{addr.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-[#6d7452] italic">No addresses saved yet.</p>
                      )}

                      <div className="mt-4 flex flex-col gap-3 md:flex-row md:justify-end">
                        <button
                          type="button"
                          onClick={() => handleCancelNote(noteId)}
                          disabled={isLoading}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d8d4be] bg-white px-3 py-2 text-xs font-semibold text-[#4e5a3d] transition hover:bg-[#f8f5ea] md:w-auto disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveNote(noteId)}
                          disabled={isLoading}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#253119] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1c2512] md:w-auto disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Save className="h-3.5 w-3.5" />
                          )}
                          Save Note
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-[#d9d3bf] bg-[#faf7ee] px-4 py-5 text-sm text-[#6d7452]">
              No delivery instruction saved yet. Add one for special drop-off details.
            </div>
          )}
        </div>
      </section>
    </section>
  );
}
