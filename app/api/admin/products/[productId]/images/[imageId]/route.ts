import { proxyAuthedRequest } from "@/app/api/_lib/backend-auth-proxy";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ productId: string; imageId: string }> }
) {
  const { productId, imageId } = await params;

  return proxyAuthedRequest(`/admin/products/${productId}/images/${imageId}`, {
    method: "DELETE",
    errorMessage: "Unable to delete this image right now.",
  });
}
