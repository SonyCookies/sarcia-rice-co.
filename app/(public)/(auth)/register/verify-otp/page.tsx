import { redirect } from "next/navigation";

type VerifyOtpSearchParams = Promise<{
  method?: string;
}>;

export default async function VerifyOtpPage({
  searchParams,
}: {
  searchParams: VerifyOtpSearchParams;
}) {
  const { method } = await searchParams;
  const normalizedMethod = method === "phone" ? "phone" : "email";

  redirect(`/verify-otp?method=${normalizedMethod}&source=register`);
}
