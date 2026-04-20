import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  getSessionCookieName,
  parseLaravelSessionCookie,
  serializeBackendSessionCookie,
} from "@/app/_lib/auth-cookie";
import { getTrustedDeviceCookieName } from "@/app/_lib/trusted-device-cookie";

const backendBaseUrl =
  process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000/api";

type LaravelErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
  requires_verification?: boolean;
  requires_two_factor?: boolean;
  purpose?: "login";
  two_factor_method?: "email" | "phone";
  verification_method?: "email" | "phone";
  user?: {
    id: number;
    name: string;
    email: string;
    mobile: string;
    role: string;
    email_verified_at?: string | null;
    mobile_verified_at?: string | null;
  };
};

export async function POST(request: Request) {
  const body = await request.json();
  const cookieStore = await cookies();
  const trustedDeviceCookie = cookieStore.get(getTrustedDeviceCookieName());
  const browserUserAgent = request.headers.get("user-agent");

  try {
    const response = await fetch(`${backendBaseUrl}/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(trustedDeviceCookie?.value
          ? { "X-Trusted-Device-Token": trustedDeviceCookie.value }
          : {}),
        ...(browserUserAgent
          ? { "X-Forwarded-User-Agent": browserUserAgent }
          : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as
      | LaravelErrorResponse
      | null;

    const setCookieHeaders =
      typeof response.headers.getSetCookie === "function"
        ? response.headers.getSetCookie()
        : response.headers.get("set-cookie");

    const sessionCookie = parseLaravelSessionCookie(setCookieHeaders);
    const nextResponse = NextResponse.json(
      response.ok
        ? data
        : {
            message:
              response.status === 404
                ? "The backend login route is not available yet."
                : data?.message ?? "Unable to sign you in.",
            errors: data?.errors ?? {},
            requires_verification: data?.requires_verification ?? false,
            verification_method: data?.verification_method,
            requires_two_factor: data?.requires_two_factor ?? false,
            purpose: data?.purpose,
            two_factor_method: data?.two_factor_method,
            user: data?.user,
          },
      { status: response.status }
    );

    if (sessionCookie) {
      nextResponse.cookies.set({
        name: getSessionCookieName(),
        value: serializeBackendSessionCookie(sessionCookie),
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure:
          sessionCookie.secure ?? process.env.NODE_ENV === "production",
        maxAge: sessionCookie.maxAge,
        expires: sessionCookie.expires,
      });
    }

    return nextResponse;
  } catch {
    return NextResponse.json(
      {
        message:
          "We couldn't reach the backend. Make sure the Laravel server is running.",
      },
      { status: 502 }
    );
  }
}
