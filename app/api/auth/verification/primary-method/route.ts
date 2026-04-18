import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  deserializeBackendSessionCookie,
  getSessionCookieName,
} from "@/app/_lib/auth-cookie";

const backendBaseUrl =
  process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000/api";

type LaravelErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

export async function POST(request: Request) {
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

  const body = await request.json();

  try {
    const response = await fetch(`${backendBaseUrl}/verification/primary-method`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: `${backendSessionCookie.name}=${backendSessionCookie.value}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as
      | LaravelErrorResponse
      | null;

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            data?.message ?? "Unable to update the primary verification method.",
          errors: data?.errors ?? {},
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
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
