import { proxyAuthedRequest } from "@/app/api/_lib/backend-auth-proxy";

export async function POST(request: Request) {
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

  return proxyAuthedRequest("/delivery-notes", {
    body: normalizedBody,
    errorMessage: "Unable to create delivery note.",
    includeJsonContentType: true,
    method: "POST",
    successStatus: 201,
  });
}

