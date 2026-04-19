import { proxyAuthedRequest } from "@/app/api/_lib/backend-auth-proxy";

export async function GET() {
  return proxyAuthedRequest("/delivery-preferences", {
    errorMessage: "Unable to fetch delivery preferences.",
    method: "GET",
  });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);

  return proxyAuthedRequest("/delivery-preferences/notes", {
    body,
    errorMessage: "Unable to update delivery notes.",
    includeJsonContentType: true,
    method: "PATCH",
  });
}

