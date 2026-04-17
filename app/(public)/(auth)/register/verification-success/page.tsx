import { redirect } from "next/navigation";

type VerificationSuccessSearchParams = Promise<{
  method?: string;
}>;

export default async function VerificationSuccessPage({
  searchParams,
}: {
  searchParams: VerificationSuccessSearchParams;
}) {
  const { method } = await searchParams;
  const normalizedMethod = method === "phone" ? "phone" : "email";

  redirect(`/verification-success?method=${normalizedMethod}&source=register`);
}
