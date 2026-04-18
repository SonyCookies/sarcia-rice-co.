"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  Mail,
  Phone,
  User,
  X,
} from "lucide-react";
import { useState } from "react";

import AuthShell from "@/app/(public)/(auth)/_components/auth-shell";
import {
  savePendingVerificationUser,
  type PendingVerificationUser,
} from "@/app/(public)/(auth)/register/_lib/pending-verification";

type RegisterResponse = {
  message?: string;
  errors?: Record<string, string[]>;
  user?: PendingVerificationUser;
};

export default function RegisterCard() {
  const FIELD_LIMITS = {
    fullName: 120,
    email: 254,
    mobile: 16,
    password: 72,
  } as const;

  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("+63 ");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<
      Record<"name" | "email" | "mobile" | "password" | "confirmPassword", string>
    >
  >({});

  const getInputClassName = (hasError: boolean) =>
    `w-full rounded-xl border bg-[#fffef9] py-3 pl-11 pr-4 text-sm text-[#2f3b1f] outline-none transition placeholder:text-[#9b9a7b] ${
      hasError
        ? "border-[#c76d4f] bg-[#fff8f4] focus:border-[#a14c34] focus:ring-1 focus:ring-[#a14c34] focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,#a14c34_20%,transparent)]"
        : "border-[#d8d4be] focus:border-[var(--color-rice-green)] focus:ring-1 focus:ring-[var(--color-rice-green)] focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-rice-green)_20%,transparent)]"
    }`;

  const formatMobileNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const localDigits = digits.startsWith("63") ? digits.slice(2) : digits;
    const trimmedDigits = localDigits.slice(0, 10);
    const normalizedDigits =
      trimmedDigits.length > 0 && trimmedDigits[0] === "0"
        ? trimmedDigits.slice(1)
        : trimmedDigits;

    const part1 = normalizedDigits.slice(0, 4);
    const part2 = normalizedDigits.slice(4, 7);
    const part3 = normalizedDigits.slice(7, 10);

    let formatted = "+63";

    if (part1) {
      formatted += ` ${part1}`;
    } else {
      formatted += " ";
    }

    if (part2) {
      formatted += `-${part2}`;
    }

    if (part3) {
      formatted += `-${part3}`;
    }

    return formatted;
  };

  const passwordChecks = [
    {
      label: "At least 8 characters",
      met: password.length >= 8,
    },
    {
      label: "One uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      label: "One number",
      met: /\d/.test(password),
    },
    {
      label: "Passwords match",
      met: confirmPassword.length > 0 && password === confirmPassword,
    },
  ];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmissionError("");
    setFieldErrors({});

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          email,
          mobile,
          password,
          password_confirmation: confirmPassword,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | RegisterResponse
        | null;

      if (!response.ok) {
        setSubmissionError(data?.message ?? "Unable to create your account.");
        setFieldErrors({
          name: data?.errors?.name?.[0],
          email: data?.errors?.email?.[0],
          mobile: data?.errors?.mobile?.[0],
          password: data?.errors?.password?.[0],
          confirmPassword: data?.errors?.password_confirmation?.[0],
        });
        return;
      }

      if (data?.user) {
        savePendingVerificationUser(data.user, {
          source: "register",
        });
      }

      router.push("/register/success");
    } catch {
      setSubmissionError("Something went wrong while creating your account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create your account and start ordering fresh rice online."
      description="Join RiceProject to shop directly, save delivery details, and earn rewards on repeat orders."
      stats={[
        { label: "Families served", value: "320+" },
        { label: "Orders delivered this week", value: "52" },
        { label: "Rewards points claimed", value: "1,480" },
      ]}
    >
      <div className="mb-10 text-center lg:text-left">
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
        <h1 className="text-2xl font-semibold tracking-tight text-[#2f3b1f]">
          Create account
        </h1>
        <p className="mt-2 text-sm text-[#6d7452]">
          Set up your account to order rice and manage deliveries easily.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1.5 ml-1 block text-xs font-medium uppercase tracking-[0.18em] text-[#7c7b55]">
            Full Name
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#8d8f69]">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Juan Dela Cruz"
              value={fullName}
              maxLength={FIELD_LIMITS.fullName}
              onChange={(event) => setFullName(event.target.value)}
              className={getInputClassName(Boolean(fieldErrors.name))}
            />
          </div>
          {fieldErrors.name ? (
            <p className="mt-1.5 ml-1 text-sm text-[#a14c34]">
              {fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-1.5 ml-1 block text-xs font-medium uppercase tracking-[0.18em] text-[#7c7b55]">
            Email Address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#8d8f69]">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              placeholder="customer@gmail.com"
              value={email}
              maxLength={FIELD_LIMITS.email}
              onChange={(event) => setEmail(event.target.value)}
              className={getInputClassName(Boolean(fieldErrors.email))}
            />
          </div>
          {fieldErrors.email ? (
            <p className="mt-1.5 ml-1 text-sm text-[#a14c34]">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-1.5 ml-1 block text-xs font-medium uppercase tracking-[0.18em] text-[#7c7b55]">
            Mobile Number
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#8d8f69]">
              <Phone className="h-4 w-4" />
            </div>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="+63 9266-301-717"
              value={mobile}
              maxLength={FIELD_LIMITS.mobile}
              onFocus={() => {
                if (mobile.trim() === "") {
                  setMobile("+63 ");
                }
              }}
              onChange={(event) => setMobile(formatMobileNumber(event.target.value))}
              className={getInputClassName(Boolean(fieldErrors.mobile))}
            />
          </div>
          {fieldErrors.mobile ? (
            <p className="mt-1.5 ml-1 text-sm text-[#a14c34]">
              {fieldErrors.mobile}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-1.5 ml-1 block text-xs font-medium uppercase tracking-[0.18em] text-[#7c7b55]">
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#8d8f69]">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a secure password"
              value={password}
              maxLength={FIELD_LIMITS.password}
              onChange={(event) => setPassword(event.target.value)}
              className={getInputClassName(Boolean(fieldErrors.password)).replace(
                "pr-4",
                "pr-11"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8d8f69] transition hover:text-[var(--color-rice-green)]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-[18px] w-[18px]" />
              ) : (
                <Eye className="h-[18px] w-[18px]" />
              )}
            </button>
          </div>
          {fieldErrors.password ? (
            <p className="mt-1.5 ml-1 text-sm text-[#a14c34]">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-1.5 ml-1 block text-xs font-medium uppercase tracking-[0.18em] text-[#7c7b55]">
            Confirm Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#8d8f69]">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              maxLength={FIELD_LIMITS.password}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={getInputClassName(
                Boolean(fieldErrors.confirmPassword)
              ).replace("pr-4", "pr-11")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8d8f69] transition hover:text-[var(--color-rice-green)]"
              aria-label={
                showConfirmPassword ? "Hide confirm password" : "Show confirm password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="h-[18px] w-[18px]" />
              ) : (
                <Eye className="h-[18px] w-[18px]" />
              )}
            </button>
          </div>
          {fieldErrors.confirmPassword ? (
            <p className="mt-1.5 ml-1 text-sm text-[#a14c34]">
              {fieldErrors.confirmPassword}
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-[#e7e1c8] bg-[#faf7ee] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7c7b55]">
            Password Requirements
          </p>
          <div className="mt-3 space-y-2">
            {passwordChecks.map((check) => (
              <div
                key={check.label}
                className={`flex items-center gap-2 text-sm transition-colors ${
                  check.met ? "text-[#4d6b35]" : "text-[#9b9a7b]"
                }`}
              >
                {check.met ? (
                  <Check className="h-4 w-4 text-[var(--color-rice-green)]" />
                ) : (
                  <X className="h-4 w-4 text-[#b8b49a]" />
                )}
                <span>{check.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* {submissionError ? (
          <div className="rounded-2xl border border-[#e9cabb] bg-[#fff4ef] px-4 py-3 text-sm text-[#a14c34]">
            {submissionError}
          </div>
        ) : null} */}

        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative flex w-full items-center justify-center rounded-xl bg-[var(--color-rice-green)] py-3.5 text-sm font-semibold text-white transition hover:bg-[color-mix(in_srgb,var(--color-rice-green)_82%,black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-rice-green)_25%,transparent)] disabled:cursor-not-allowed disabled:opacity-90"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              <span className="animate-pulse">Creating account...</span>
            </span>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[#6d7452] lg:text-left">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-[var(--color-rice-green)] underline-offset-4 transition hover:text-[var(--color-rich-gold)] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
