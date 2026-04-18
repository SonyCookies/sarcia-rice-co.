"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  Mail,
  Smartphone,
} from "lucide-react";
import { useRef, useState } from "react";

import AuthShell from "@/app/(public)/(auth)/_components/auth-shell";
import { useAuthStore, type AuthUser } from "@/app/_stores/auth-store";
import { savePendingVerificationUser } from "@/app/(public)/(auth)/register/_lib/pending-verification";

type LoginResponse = {
  message?: string;
  errors?: Record<string, string[]>;
  requires_verification?: boolean;
  verification_method?: "email" | "phone";
  user?: AuthUser;
};

export default function LoginCard() {
  const FIELD_LIMITS = {
    email: 254,
    mobile: 16,
    password: 72,
  } as const;

  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [loginMethod, setLoginMethod] = useState<"email" | "mobile">("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<"identifier" | "password", string>>
  >({});
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const handleLoginMethodChange = (nextMethod: "email" | "mobile") => {
    setLoginMethod(nextMethod);
    setIdentifier(nextMethod === "mobile" ? "+63 " : "");
    setSubmissionError("");
    setFieldErrors({});
  };

  const getInputClassName = (hasError: boolean, extraClassName = "") =>
    `w-full rounded-xl border bg-[#fffef9] py-3 text-sm text-[#2f3b1f] outline-none transition placeholder:text-[#9b9a7b] ${
      hasError
        ? "border-[#c76d4f] bg-[#fff8f4] focus:border-[#a14c34] focus:ring-1 focus:ring-[#a14c34] focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,#a14c34_20%,transparent)]"
        : "border-[#d8d4be] focus:border-[var(--color-rice-green)] focus:ring-1 focus:ring-[var(--color-rice-green)] focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-rice-green)_20%,transparent)]"
    } ${extraClassName}`.trim();

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmissionError("");
    setFieldErrors({});

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          loginMethod === "email"
            ? {
                email: identifier,
                password,
              }
            : {
                mobile: identifier,
                password,
              }
        ),
      });

      const data = (await response.json().catch(() => null)) as
        | LoginResponse
        | null;

      if (!response.ok) {
        if (
          data?.requires_verification &&
          data.user &&
          data.verification_method
        ) {
          savePendingVerificationUser(data.user, {
            source: "login",
          });

          const otpResponse = await fetch("/api/auth/verification/send-otp", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: data.user.id,
              method: data.verification_method,
            }),
          });

          const otpData = (await otpResponse.json().catch(() => null)) as
            | {
                message?: string;
              }
            | null;

          if (!otpResponse.ok) {
            setSubmissionError(
              otpData?.message ?? "Unable to send the verification code."
            );
            return;
          }

          router.push(
            `/verify-otp?method=${data.verification_method}&source=login`
          );
          return;
        }

        setSubmissionError(data?.message ?? "Unable to sign in right now.");
        setFieldErrors({
          identifier:
            data?.errors?.email?.[0] ??
            data?.errors?.mobile?.[0] ??
            data?.errors?.identifier?.[0],
          password: data?.errors?.password?.[0],
        });
        return;
      }

      if (data?.user) {
        setUser(data.user);
      }

      router.push("/");
    } catch {
      setSubmissionError("Something went wrong while signing you in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Fresh rice from the farm, ready for your next order."
      description="Sign in to order rice, track deliveries, and use your rewards."
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
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-[#6d7452]">
          Sign in to order rice and track your account.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1.5 ml-1 block text-xs font-medium uppercase tracking-[0.18em] text-[#7c7b55]">
            {loginMethod === "email" ? "Email Address" : "Mobile Number"}
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#8d8f69]">
              {loginMethod === "email" ? (
                <Mail className="h-4 w-4" />
              ) : (
                <Smartphone className="h-4 w-4" />
              )}
            </div>
            <input
              type={loginMethod === "email" ? "email" : "tel"}
              inputMode={loginMethod === "email" ? "email" : "tel"}
              placeholder={
                loginMethod === "email"
                  ? "customer@gmail.com"
                  : "+63 9266-301-717"
              }
              value={identifier}
              onChange={(event) => {
                const nextValue = event.target.value;

                if (loginMethod === "email") {
                  setSubmissionError("");
                  setFieldErrors((current) => ({ ...current, identifier: "" }));
                  setIdentifier(nextValue);
                  return;
                }

                setSubmissionError("");
                setFieldErrors((current) => ({ ...current, identifier: "" }));
                setIdentifier(formatMobileNumber(nextValue));
              }}
              onFocus={() => {
                if (loginMethod === "mobile" && identifier.trim() === "") {
                  setIdentifier("+63 ");
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Tab" && !event.shiftKey) {
                  event.preventDefault();
                  passwordInputRef.current?.focus();
                }
              }}
              maxLength={
                loginMethod === "email" ? FIELD_LIMITS.email : FIELD_LIMITS.mobile
              }
              className={getInputClassName(
                Boolean(fieldErrors.identifier),
                "pl-11 pr-4"
              )}
            />
          </div>
          {fieldErrors.identifier ? (
            <p className="mt-1.5 ml-1 text-sm text-[#a14c34]">
              {fieldErrors.identifier}
            </p>
          ) : null}
        </div>

        <div className="relative">
          <div className="mb-1.5 ml-1 flex justify-between">
            <label className="block text-xs font-medium uppercase tracking-[0.18em] text-[#7c7b55]">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-[#6d7452] transition hover:text-[var(--color-rice-green)]"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#8d8f69]">
              <Lock className="h-4 w-4" />
            </div>
            <input
              ref={passwordInputRef}
              type={showPassword ? "text" : "password"}
              placeholder="************"
              value={password}
              maxLength={FIELD_LIMITS.password}
              onChange={(event) => {
                setSubmissionError("");
                setFieldErrors((current) => ({ ...current, password: "" }));
                setPassword(event.target.value);
              }}
              className={getInputClassName(
                Boolean(fieldErrors.password),
                "pl-11 pr-11"
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

        {submissionError ? (
          <div className="rounded-2xl border border-[#e9cabb] bg-[#fff4ef] px-4 py-3 text-sm text-[#a14c34]">
            {submissionError}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative flex w-full items-center justify-center rounded-xl bg-[var(--color-rice-green)] py-3.5 text-sm font-semibold text-white transition hover:bg-[color-mix(in_srgb,var(--color-rice-green)_82%,black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-rice-green)_25%,transparent)] disabled:cursor-not-allowed disabled:opacity-90"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              <span className="animate-pulse">Signing in...</span>
            </span>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#ece6cf]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#fffdf7] px-3 text-[#9b9a7b]">
            Or continue with
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          disabled
          title="Soon"
          className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-[#d8d4be] bg-[#f9f8f3] py-2.5 text-sm font-medium text-[#4b5137]/50 transition-colors focus-visible:outline-none"
        >
          <svg className="h-4 w-4 opacity-50 grayscale" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>Google</span>
        </button>

        <button
          type="button"
          onClick={() =>
            handleLoginMethodChange(loginMethod === "mobile" ? "email" : "mobile")
          }
          aria-pressed={loginMethod === "mobile"}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#d8d4be] bg-[#fffef9] py-2.5 text-sm font-medium text-[#4b5137] transition-colors hover:bg-[#f7f3e7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-rice-green)_15%,transparent)]"
        >
          {loginMethod === "mobile" ? (
            <Mail className="h-4 w-4" />
          ) : (
            <Smartphone className="h-4 w-4" />
          )}
          <span>{loginMethod === "mobile" ? "Email" : "Mobile Number"}</span>
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-[#6d7452] lg:text-left">
        New here?{" "}
        <Link
          href="/register"
          className="font-semibold text-[var(--color-rice-green)] underline-offset-4 transition hover:text-[var(--color-rich-gold)] hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
