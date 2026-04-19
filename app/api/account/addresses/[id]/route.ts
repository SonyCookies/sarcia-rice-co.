import { proxyAuthedRequest } from "@/app/api/_lib/backend-auth-proxy";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  return proxyAuthedRequest(`/addresses/${id}`, {
    body,
    errorMessage: "Unable to update address.",
    includeJsonContentType: true,
    method: "PATCH",
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return proxyAuthedRequest(`/addresses/${id}`, {
    errorMessage: "Unable to delete address.",
    method: "DELETE",
  });
}

