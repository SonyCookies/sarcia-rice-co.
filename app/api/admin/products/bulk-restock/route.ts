import { proxyAuthedRequest } from "@/app/api/_lib/backend-auth-proxy";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  return proxyAuthedRequest(`/admin/products/bulk-restock`, {
    body,
    method: "POST",
    includeJsonContentType: true,
    errorMessage: "Unable to perform bulk restock right now.",
  });
}
