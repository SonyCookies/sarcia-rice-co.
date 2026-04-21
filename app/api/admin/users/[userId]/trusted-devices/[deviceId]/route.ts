import { proxyAuthedRequest } from "@/app/api/_lib/backend-auth-proxy";

export async function DELETE(
  _request: Request,
  {
    params,
  }: { params: Promise<{ userId: string; deviceId: string }> }
) {
  const { userId, deviceId } = await params;

  return proxyAuthedRequest(
    `/admin/users/${userId}/trusted-devices/${deviceId}`,
    {
      method: "DELETE",
      errorMessage: "Unable to revoke this trusted device right now.",
    }
  );
}
