import { proxyAuthedRequest } from "@/app/api/_lib/backend-auth-proxy";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  return proxyAuthedRequest("/profile/mobile", {
    body,
    errorMessage: "Unable to update your mobile number right now.",
    includeJsonContentType: true,
    method: "POST",
  });
}
