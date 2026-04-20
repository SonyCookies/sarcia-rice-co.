import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  deserializeBackendSessionCookie,
  getSessionCookieName,
} from "@/app/_lib/auth-cookie";

type SessionUserResponse = {
  user?: {
    role?: string | null;
  } | null;
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const backendBaseUrl =
    process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000/api";
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(getSessionCookieName());
  const backendSessionCookie = sessionCookie?.value
    ? deserializeBackendSessionCookie(sessionCookie.value)
    : null;

  if (!backendSessionCookie) {
    redirect("/login");
  }

  try {
    const response = await fetch(`${backendBaseUrl}/me`, {
      headers: {
        Accept: "application/json",
        Cookie: `${backendSessionCookie.name}=${backendSessionCookie.value}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      redirect("/login");
    }

    const data = (await response.json().catch(() => null)) as
      | SessionUserResponse
      | null;

    if ((data?.user?.role ?? "").toLowerCase() !== "admin") {
      redirect("/");
    }
  } catch {
    redirect("/login");
  }

  return <>{children}</>;
}
