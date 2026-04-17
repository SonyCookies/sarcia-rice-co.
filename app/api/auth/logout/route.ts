import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  deserializeBackendSessionCookie,
  getSessionCookieName,
} from "@/app/_lib/auth-cookie";

const backendBaseUrl =
  process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000/api";

export async function POST() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(getSessionCookieName());
  const backendSessionCookie = sessionCookie?.value
    ? deserializeBackendSessionCookie(sessionCookie.value)
    : null;

  try {
    if (backendSessionCookie) {
      await fetch(`${backendBaseUrl}/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Cookie: `${backendSessionCookie.name}=${backendSessionCookie.value}`,
        },
        cache: "no-store",
      });
    }
  } catch {
    // Clear the frontend cookie even if the backend is unavailable.
  }

  const response = NextResponse.json({
    message: "Signed out successfully.",
  });

  response.cookies.set({
    name: getSessionCookieName(),
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
