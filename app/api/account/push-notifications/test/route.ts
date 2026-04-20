import { proxyAuthedRequest } from "@/app/api/_lib/backend-auth-proxy";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  return proxyAuthedRequest("/push-notifications/test", {
    body,
    errorMessage: "Unable to send a test push notification right now.",
    includeJsonContentType: true,
    method: "POST",
  });
}
