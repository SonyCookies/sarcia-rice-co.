import { proxyAuthedRequest } from "@/app/api/_lib/backend-auth-proxy";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  return proxyAuthedRequest("/profile/email", {
    body,
    errorMessage: "Unable to update your email right now.",
    includeJsonContentType: true,
    method: "POST",
  });
}
