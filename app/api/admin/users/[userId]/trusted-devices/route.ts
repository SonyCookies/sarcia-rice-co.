import { proxyAuthedRequest } from "@/app/api/_lib/backend-auth-proxy";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  return proxyAuthedRequest(`/admin/users/${userId}/trusted-devices`, {
    method: "DELETE",
    errorMessage: "Unable to revoke trusted devices right now.",
  });
}
