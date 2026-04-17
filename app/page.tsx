import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import UserDashboard from "@/app/_components/user-dashboard";
import {
  deserializeBackendSessionCookie,
  getSessionCookieName,
} from "@/app/_lib/auth-cookie";

export default async function Home() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(getSessionCookieName());
  const backendSessionCookie = sessionCookie?.value
    ? deserializeBackendSessionCookie(sessionCookie.value)
    : null;

  if (!backendSessionCookie) {
    redirect("/login");
  }

  return <UserDashboard />;
}
