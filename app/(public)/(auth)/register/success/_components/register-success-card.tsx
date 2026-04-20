"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import AuthShell from "@/app/(public)/(auth)/_components/auth-shell";
import {
  getPendingVerificationUser,
  type PendingVerificationUser,
} from "@/app/(public)/(auth)/register/_lib/pending-verification";

export default function RegisterSuccessCard() {
  const router = useRouter();
  const [isContinuing, setIsContinuing] = useState(false);
  const [user] = useState<PendingVerificationUser | null>(() =>
    getPendingVerificationUser()
  );

  useEffect(() => {
    if (!user) {
      router.replace("/register");
    }
  }, [router, user]);

  return (
    <AuthShell
      title="Your account is ready for orders, deliveries, and rewards."
      description="You're all set. Sign in to start browsing rice options, save your details, and track every order from checkout to doorstep."
      stats={[
        { label: "Account setup time", value: "Under 3 min" },
        { label: "Orders this week", value: "52" },
        { label: "Members earning rewards", value: "320+" },
      ]}
    >
      <div className="text-center lg:text-left">
        <div className="mb-6 inline-flex items-center justify-center">
          <Image
            src="/logo/sarciariceco.svg"
            alt="Sarcia Rice Co."
            width={420}
            height={102}
            className="h-24 w-auto"
            style={{ width: "auto" }}
            priority
          />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-[#2f3b1f]">
          Account created successfully.
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#6d7452]">
          Your Sarcia Rice Co. account is now active. Continue to login and start
          managing orders, deliveries, and rewards in one place after you verify
          it.
        </p>

        {user ? (
          <div className="mt-5 rounded-2xl border border-[#e7e1c8] bg-[#faf7ee] p-4 text-sm text-[#6d7452]">
            Verification is pending for{" "}
            <span className="font-semibold text-[#364127]">{user.email}</span>{" "}
            and <span className="font-semibold text-[#364127]">{user.mobile}</span>.
          </div>
        ) : null}

        <div className="mt-8 grid gap-3 rounded-[1.5rem] border border-[#e7e1c8] bg-[#faf7ee] p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white p-2 text-[var(--color-rice-green)] shadow-[0_8px_24px_rgba(74,92,54,0.08)]">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#364127]">
                Securely saved
              </p>
              <p className="mt-1 text-sm leading-6 text-[#7b7a60]">
                Your credentials are now registered in the system and ready for
                sign-in.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white p-2 text-[var(--color-rice-green)] shadow-[0_8px_24px_rgba(74,92,54,0.08)]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#364127]">
                Ready to continue
              </p>
              <p className="mt-1 text-sm leading-6 text-[#7b7a60]">
                Head to login to access your account and complete your first
                order.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/verify-method?source=register"
            onClick={() => setIsContinuing(true)}
            className="group inline-flex items-center justify-center rounded-xl bg-[var(--color-rice-green)] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[color-mix(in_srgb,var(--color-rice-green)_82%,black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-rice-green)_25%,transparent)]"
          >
            {isContinuing ? (
              <span className="flex items-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span className="animate-pulse">Opening verification...</span>
              </span>
            ) : (
              <>
                <span>Choose Verification Method</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-[#d8d4be] bg-[#fffef9] px-5 py-3.5 text-sm font-medium text-[#4b5137] transition hover:bg-[#f7f3e7]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
