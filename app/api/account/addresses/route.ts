import { proxyAuthedRequest } from "@/app/api/_lib/backend-auth-proxy";

export async function GET() {
  return proxyAuthedRequest("/addresses", {
    errorMessage: "Unable to fetch addresses.",
    method: "GET",
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  return proxyAuthedRequest("/addresses", {
    body,
    errorMessage: "Unable to create address.",
    includeJsonContentType: true,
    method: "POST",
    successStatus: 201,
  });
}

