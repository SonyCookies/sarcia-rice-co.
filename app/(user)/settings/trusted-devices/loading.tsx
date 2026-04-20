import SettingsPageSkeleton from "@/app/(user)/settings/_components/settings-page-skeleton";

export default function Loading() {
  return (
    <SettingsPageSkeleton
      subtitle="See which devices have access to your account and spot anything unfamiliar."
      searchPlaceholder="Search trusted devices or session help"
      rows={3}
    />
  );
}
