import { proxyAuthedRequest } from "@/app/api/_lib/backend-auth-proxy";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return proxyAuthedRequest(`/delivery-windows/${id}/set-default`, {
    errorMessage: "Unable to set primary delivery window.",
    method: "POST",
  });
}

