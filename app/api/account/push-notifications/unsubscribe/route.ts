import { proxyAuthedRequest } from "@/app/api/_lib/backend-auth-proxy";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  return proxyAuthedRequest("/push-notifications/unsubscribe", {
    body,
    errorMessage: "Unable to disable push notifications for this browser right now.",
    includeJsonContentType: true,
    method: "POST",
  });
}
