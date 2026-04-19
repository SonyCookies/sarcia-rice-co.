import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  deserializeBackendSessionCookie,
  getSessionCookieName,
} from "@/app/_lib/auth-cookie";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(getSessionCookieName());
  const backendSessionCookie = sessionCookie?.value
    ? deserializeBackendSessionCookie(sessionCookie.value)
    : null;

  if (!backendSessionCookie) {
    redirect("/login");
  }

  return <>{children}</>;
}
