import AdminSettingsPageSkeleton from "@/app/admin/settings/_components/settings-page-skeleton";

export default function Loading() {
  return (
    <AdminSettingsPageSkeleton
      subtitle="Add an extra verification step to protect admin account sign-ins."
      searchPlaceholder="Search admin two-factor help or verification settings"
      rows={4}
    />
  );
}
