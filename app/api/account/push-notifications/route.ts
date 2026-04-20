import { proxyAuthedRequest } from "@/app/api/_lib/backend-auth-proxy";

export async function GET() {
  return proxyAuthedRequest("/push-notifications", {
    errorMessage: "Unable to load your push notification settings right now.",
    method: "GET",
  });
}
