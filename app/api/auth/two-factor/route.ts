import { proxyAuthedRequest } from "@/app/api/_lib/backend-auth-proxy";

export async function GET() {
  return proxyAuthedRequest("/two-factor", {
    errorMessage: "Unable to load your two-factor settings.",
    method: "GET",
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  return proxyAuthedRequest("/two-factor", {
    body,
    errorMessage: "Unable to update your two-factor settings.",
    includeJsonContentType: true,
    method: "POST",
  });
}
