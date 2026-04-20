import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  deserializeBackendSessionCookie,
  getSessionCookieName,
} from "@/app/_lib/auth-cookie";
import { getTrustedDeviceCookieName } from "@/app/_lib/trusted-device-cookie";

const backendBaseUrl =
  process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000/api";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  const { deviceId } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(getSessionCookieName());
  const backendSessionCookie = sessionCookie?.value
    ? deserializeBackendSessionCookie(sessionCookie.value)
    : null;
  const trustedDeviceCookie = cookieStore.get(getTrustedDeviceCookieName());
  const browserUserAgent = request.headers.get("user-agent");

  if (!backendSessionCookie) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  try {
    const response = await fetch(`${backendBaseUrl}/trusted-devices/${deviceId}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Cookie: `${backendSessionCookie.name}=${backendSessionCookie.value}`,
        ...(trustedDeviceCookie?.value
          ? { "X-Trusted-Device-Token": trustedDeviceCookie.value }
          : {}),
        ...(browserUserAgent
          ? { "X-Forwarded-User-Agent": browserUserAgent }
          : {}),
      },
      cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as
      | {
          message?: string;
          clear_trusted_device?: boolean;
        }
      | null;

    const nextResponse = NextResponse.json(data, { status: response.status });

    if (data?.clear_trusted_device) {
      nextResponse.cookies.set({
        name: getTrustedDeviceCookieName(),
        value: "",
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
      });
    }

    return nextResponse;
  } catch {
    return NextResponse.json(
      { message: "We couldn't reach the backend." },
      { status: 502 }
    );
  }
}
