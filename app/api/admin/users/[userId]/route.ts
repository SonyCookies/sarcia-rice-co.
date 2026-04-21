import { proxyAuthedRequest } from "@/app/api/_lib/backend-auth-proxy";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const url = new URL(request.url);
  const queryString = url.searchParams.toString();

  return proxyAuthedRequest(
    queryString
      ? `/admin/users/${userId}?${queryString}`
      : `/admin/users/${userId}`,
    {
    method: "GET",
    errorMessage: "Unable to load this user right now.",
    }
  );
}
