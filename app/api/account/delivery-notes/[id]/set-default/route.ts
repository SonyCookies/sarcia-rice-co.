import { proxyAuthedRequest } from "@/app/api/_lib/backend-auth-proxy";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return proxyAuthedRequest(`/delivery-notes/${id}/set-default`, {
    errorMessage: "Unable to set default delivery note.",
    method: "POST",
  });
}

