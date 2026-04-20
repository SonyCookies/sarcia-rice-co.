import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  deserializeBackendSessionCookie,
  getSessionCookieName,
} from "@/app/_lib/auth-cookie";

const backendBaseUrl =
  process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000/api";

type ProxyInit = {
  body?: unknown;
  errorMessage: string;
  includeJsonContentType?: boolean;
  method: string;
  successStatus?: number;
};

async function getBackendSessionCookie() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(getSessionCookieName());

  return sessionCookie?.value
    ? deserializeBackendSessionCookie(sessionCookie.value)
    : null;
}

export async function proxyAuthedRequest(
  path: string,
  {
    body,
    errorMessage,
    includeJsonContentType = false,
    method,
    successStatus,
  }: ProxyInit
) {
  const backendSessionCookie = await getBackendSessionCookie();

  if (!backendSessionCookie) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  try {
    const response = await fetch(`${backendBaseUrl}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(includeJsonContentType
          ? { "Content-Type": "application/json" }
          : {}),
        Cookie: `${backendSessionCookie.name}=${backendSessionCookie.value}`,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          ...(data && typeof data === "object" ? data : {}),
          message: data?.message ?? errorMessage,
          errors: data?.errors ?? {},
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, successStatus ? { status: successStatus } : {});
  } catch {
    return NextResponse.json(
      { message: "We couldn't reach the backend." },
      { status: 502 }
    );
  }
}
