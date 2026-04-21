import { proxyAuthedRequest } from "@/app/api/_lib/backend-auth-proxy";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  return proxyAuthedRequest(`/admin/users/${userId}/reset-two-factor`, {
    method: "POST",
    errorMessage: "Unable to reset two-factor authentication right now.",
  });
}
