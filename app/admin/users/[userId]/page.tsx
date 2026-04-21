import UserDetailsPageContent from "@/app/admin/users/[userId]/_components/user-details-page-content";

type UserDetailsPageParams = Promise<{
  userId: string;
}>;

export default async function AdminUserDetailsPage({
  params,
}: {
  params: UserDetailsPageParams;
}) {
  const { userId } = await params;

  return <UserDetailsPageContent userId={userId} />;
}
