import { proxyAuthedRequest } from "@/app/api/_lib/backend-auth-proxy";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const body = await request.json().catch(() => null);

  return proxyAuthedRequest(`/admin/users/${userId}/verify`, {
    method: "POST",
    body,
    includeJsonContentType: true,
    errorMessage: "Unable to update this verification status right now.",
  });
}
