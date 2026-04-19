import { proxyAuthedRequest } from "@/app/api/_lib/backend-auth-proxy";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const normalizedBody =
    body && typeof body === "object"
      ? {
          ...body,
          address_ids: Array.isArray((body as { address_ids?: unknown }).address_ids)
            ? [
                ...new Set(
                  (body as { address_ids: unknown[] }).address_ids
                    .map((value) => Number(value))
                    .filter((value) => Number.isInteger(value) && value > 0)
                ),
              ]
            : [],
        }
      : body;

  return proxyAuthedRequest(`/delivery-notes/${id}`, {
    body: normalizedBody,
    errorMessage: "Unable to update delivery note.",
    includeJsonContentType: true,
    method: "PATCH",
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return proxyAuthedRequest(`/delivery-notes/${id}`, {
    errorMessage: "Unable to delete delivery note.",
    method: "DELETE",
  });
}

