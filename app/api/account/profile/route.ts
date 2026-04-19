import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  deserializeBackendSessionCookie,
  getSessionCookieName,
} from "@/app/_lib/auth-cookie";

const backendBaseUrl =
  process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000/api";

type AuthUser = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: string;
  email_verified_at?: string | null;
  mobile_verified_at?: string | null;
};

type LaravelProfileResponse = {
  message?: string;
  errors?: Record<string, string[]>;
  user?: AuthUser;
};

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(getSessionCookieName());
  const backendSessionCookie = sessionCookie?.value
    ? deserializeBackendSessionCookie(sessionCookie.value)
    : null;

  if (!backendSessionCookie) {
    return NextResponse.json(
      {
        message: "Unauthenticated.",
      },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);

  try {
    const response = await fetch(`${backendBaseUrl}/profile`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: `${backendSessionCookie.name}=${backendSessionCookie.value}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as
      | LaravelProfileResponse
      | null;

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            response.status === 404
              ? "The backend profile update route is not available yet."
              : data?.message ?? "Unable to update your profile right now.",
          errors: data?.errors ?? {},
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        message: data?.message ?? "Profile updated successfully.",
        user: data?.user,
      },
      { status: response.status }
    );
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

