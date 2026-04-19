import { proxyAuthedRequest } from "@/app/api/_lib/backend-auth-proxy";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  return proxyAuthedRequest("/delivery-windows", {
    body,
    errorMessage: "Unable to create delivery window.",
    includeJsonContentType: true,
    method: "POST",
    successStatus: 201,
  });
}

