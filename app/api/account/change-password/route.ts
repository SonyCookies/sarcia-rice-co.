import { proxyAuthedRequest } from "@/app/api/_lib/backend-auth-proxy";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  return proxyAuthedRequest("/change-password", {
    body,
    errorMessage: "Unable to change your password right now.",
    includeJsonContentType: true,
    method: "POST",
  });
}
