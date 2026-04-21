import { proxyAuthedRequest } from "@/app/api/_lib/backend-auth-proxy";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const body = await request.json().catch(() => null);

  return proxyAuthedRequest(`/admin/users/${userId}/status`, {
    method: "PATCH",
    body,
    includeJsonContentType: true,
    errorMessage: "Unable to update this account status right now.",
  });
}
