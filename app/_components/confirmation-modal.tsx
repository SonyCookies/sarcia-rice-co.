"use client";

import Image from "next/image";
import { Loader2, X } from "lucide-react";

type ConfirmationModalProps = {
  cancelLabel?: string;
  confirmLabel?: string;
  description: string;
  isOpen: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
};

export default function ConfirmationModal({
  cancelLabel = "Let Me Rethink",
  confirmLabel = "Count Me In",
  description,
  isOpen,
  isSubmitting = false,
  onClose,
  onConfirm,
  title,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close confirmation modal"
        className="absolute inset-0 bg-[#2c441d]/40 backdrop-blur-sm"
        onClick={isSubmitting ? undefined : onClose}
      />

      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(44,60,29,0.24)]">
        <div className="relative flex h-26 items-center justify-center bg-[#cfddc5]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#b6c9a8_0%,transparent_70%)] opacity-70" />

          <div className="relative z-10 flex h-28 w-28 items-center justify-center">
            <Image
              src="/assets/confirmation_image.svg"
              alt=""
              width={112}
              height={112}
              className="h-28 w-28 object-contain"
              priority
            />
          </div>

          <button
            type="button"
            onClick={isSubmitting ? undefined : onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#3d5a2b] shadow-sm transition hover:scale-110 disabled:opacity-50"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-8 pb-10 pt-2 text-center">
          <h2 className="mt-3 font-poppins text-xl font-bold text-[#2c441d]">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#556046]">
            {description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="order-1 inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#3d5a2b] py-4 text-sm font-bold text-white transition hover:bg-[#2c441d] active:scale-95 disabled:opacity-50 sm:order-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {confirmLabel}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="order-2 inline-flex flex-1 items-center justify-center rounded-2xl bg-[#f0f4ed] py-4 text-sm font-bold text-[#3d5a2b] transition hover:bg-[#e2eadd] active:scale-95 disabled:opacity-50 sm:order-1"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
