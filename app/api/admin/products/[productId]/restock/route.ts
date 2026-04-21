import { proxyAuthedRequest } from "@/app/api/_lib/backend-auth-proxy";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const body = await request.json().catch(() => ({}));

  return proxyAuthedRequest(`/admin/products/${productId}/restock`, {
    body,
    method: "POST",
    includeJsonContentType: true,
    errorMessage: "Unable to restock this product right now.",
  });
}
