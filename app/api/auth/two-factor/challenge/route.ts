import { proxyAuthedRequest } from "@/app/api/_lib/backend-auth-proxy";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  return proxyAuthedRequest("/two-factor/challenge", {
    body,
    errorMessage: "Unable to send a security code right now.",
    includeJsonContentType: true,
    method: "POST",
  });
}
