import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  deserializeBackendSessionCookie,
  getSessionCookieName,
} from "@/app/_lib/auth-cookie";

const backendBaseUrl =
  process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000/api";

async function getBackendSessionCookie() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(getSessionCookieName());
  return sessionCookie?.value
    ? deserializeBackendSessionCookie(sessionCookie.value)
    : null;
}

export async function GET() {
  const backendSessionCookie = await getBackendSessionCookie();

  if (!backendSessionCookie) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  try {
    const response = await fetch(`${backendBaseUrl}/addresses`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Cookie: `${backendSessionCookie.name}=${backendSessionCookie.value}`,
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message ?? "Unable to fetch addresses." },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "We couldn't reach the backend." },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  const backendSessionCookie = await getBackendSessionCookie();

  if (!backendSessionCookie) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  try {
    const response = await fetch(`${backendBaseUrl}/addresses`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: `${backendSessionCookie.name}=${backendSessionCookie.value}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          message: data?.message ?? "Unable to create address.",
          errors: data?.errors ?? {},
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "We couldn't reach the backend." },
      { status: 502 }
    );
  }
}
