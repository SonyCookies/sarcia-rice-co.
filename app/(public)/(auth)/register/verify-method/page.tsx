import { redirect } from "next/navigation";

export default function VerificationMethodPage() {
  redirect("/verify-method?source=register");
}
