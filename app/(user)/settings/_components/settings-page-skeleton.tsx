import CustomerShell from "@/app/(user)/_components/customer-shell";

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-[color:color-mix(in_srgb,var(--color-rice-green)_10%,#ffffff)] ${className}`}
    />
  );
}

export function SettingsSectionSkeleton({
  rows = 3,
}: {
  rows?: number;
}) {
  return (
    <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
      <div className="flex items-start gap-3">
        <SkeletonBlock className="h-12 w-12 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-36" />
          <SkeletonBlock className="h-4 w-2/3" />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] p-4"
          >
            <div className="space-y-2">
              <SkeletonBlock className="h-3 w-28" />
              <SkeletonBlock className="h-4 w-3/4" />
              <SkeletonBlock className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function SettingsPageSkeleton({
  subtitle = "Manage your account security, trusted devices, and verification settings.",
  searchPlaceholder = "Search settings help",
  rows = 3,
}: {
  subtitle?: string;
  searchPlaceholder?: string;
  rows?: number;
}) {
  return (
    <CustomerShell
      subtitle={subtitle}
      searchPlaceholder={searchPlaceholder}
    >
      <div>
        <SkeletonBlock className="h-10 w-52 rounded-full" />
      </div>

      <SettingsSectionSkeleton rows={rows} />
    </CustomerShell>
  );
}
