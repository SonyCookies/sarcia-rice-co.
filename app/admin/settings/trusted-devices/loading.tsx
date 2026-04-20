import AdminSettingsPageSkeleton from "@/app/admin/settings/_components/settings-page-skeleton";

export default function Loading() {
  return (
    <AdminSettingsPageSkeleton
      subtitle="See which devices can skip admin login 2FA and remove anything unfamiliar."
      searchPlaceholder="Search admin trusted devices or session help"
      rows={3}
    />
  );
}
