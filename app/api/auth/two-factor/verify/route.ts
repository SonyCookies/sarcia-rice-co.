import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  deserializeBackendSessionCookie,
  getSessionCookieName,
  parseLaravelSessionCookie,
  serializeBackendSessionCookie,
} from "@/app/_lib/auth-cookie";
import { getTrustedDeviceCookieName } from "@/app/_lib/trusted-device-cookie";

const backendBaseUrl =
  process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000/api";

type LaravelResponse = {
  message?: string;
  errors?: Record<string, string[]>;
  trusted_device_token?: string | null;
  trusted_device_max_age?: number | null;
  user?: {
    id: number;
    account_id?: string | null;
    name: string;
    email: string;
    mobile: string;
    role: string;
    email_verified_at?: string | null;
    mobile_verified_at?: string | null;
    primary_verification_method?: "email" | "phone" | null;
    two_factor_enabled?: boolean;
    two_factor_method?: "email" | "phone" | null;
  } | null;
};

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(getSessionCookieName());
  const backendSessionCookie = sessionCookie?.value
    ? deserializeBackendSessionCookie(sessionCookie.value)
    : null;
  const body = await request.json().catch(() => null);
  const browserUserAgent = request.headers.get("user-agent");

  if (!backendSessionCookie) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  try {
    const response = await fetch(`${backendBaseUrl}/two-factor/verify`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: `${backendSessionCookie.name}=${backendSessionCookie.value}`,
        ...(browserUserAgent
          ? { "X-Forwarded-User-Agent": browserUserAgent }
          : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as
      | LaravelResponse
      | null;

    const setCookieHeaders =
      typeof response.headers.getSetCookie === "function"
        ? response.headers.getSetCookie()
        : response.headers.get("set-cookie");

    const nextResponse = NextResponse.json(
      response.ok
        ? data
        : {
            message:
              data?.message ?? "Unable to verify the security code right now.",
            errors: data?.errors ?? {},
          },
      { status: response.status }
    );

    const newSessionCookie = parseLaravelSessionCookie(setCookieHeaders);

    if (newSessionCookie) {
      nextResponse.cookies.set({
        name: getSessionCookieName(),
        value: serializeBackendSessionCookie(newSessionCookie),
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure:
          newSessionCookie.secure ?? process.env.NODE_ENV === "production",
        maxAge: newSessionCookie.maxAge,
        expires: newSessionCookie.expires,
      });
    }

    if (response.ok && data?.trusted_device_token) {
      nextResponse.cookies.set({
        name: getTrustedDeviceCookieName(),
        value: data.trusted_device_token,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: data.trusted_device_max_age ?? 60 * 60 * 24 * 30,
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
