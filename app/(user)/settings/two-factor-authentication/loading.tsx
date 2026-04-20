import SettingsPageSkeleton from "@/app/(user)/settings/_components/settings-page-skeleton";

export default function Loading() {
  return (
    <SettingsPageSkeleton
      subtitle="Add an extra verification step to protect your account sign-ins."
      searchPlaceholder="Search two-factor help or verification settings"
      rows={4}
    />
  );
}
