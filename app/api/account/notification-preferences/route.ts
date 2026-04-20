import { proxyAuthedRequest } from "@/app/api/_lib/backend-auth-proxy";

export async function GET() {
  return proxyAuthedRequest("/notification-preferences", {
    errorMessage: "Unable to load your notification preferences right now.",
    method: "GET",
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  return proxyAuthedRequest("/notification-preferences", {
    body,
    errorMessage: "Unable to update your notification preferences right now.",
    includeJsonContentType: true,
    method: "POST",
  });
}
