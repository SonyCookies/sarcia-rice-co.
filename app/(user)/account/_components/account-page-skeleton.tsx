import CustomerShell from "@/app/(user)/_components/customer-shell";

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-[color:color-mix(in_srgb,var(--color-rice-green)_10%,#ffffff)] ${className}`}
    />
  );
}

export function AccountSectionSkeleton({
  rows = 3,
}: {
  rows?: number;
}) {
  return (
    <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
      <SkeletonBlock className="h-4 w-32" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] p-4"
          >
            <div className="flex items-start gap-4">
              <SkeletonBlock className="h-11 w-11 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-3 w-24" />
                <SkeletonBlock className="h-4 w-2/3" />
                <SkeletonBlock className="h-4 w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AccountPageSkeleton() {
  return (
    <CustomerShell
      subtitle="Your personal profile for deliveries, rewards, and household preferences."
      searchPlaceholder="Search delivery settings, rewards, or account help"
    >
      <section className="overflow-hidden rounded-[2rem] border border-[#d8d4be] bg-white/92 shadow-[0_30px_80px_rgba(44,60,29,0.12)]">
        <div className="relative h-44 bg-[linear-gradient(135deg,#2c441d_0%,#3d5a2b_52%,#5d7f42_100%)] sm:h-52" />

        <div className="relative px-5 pb-5 pt-0 sm:px-7 sm:pb-7">
          <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 lg:-mt-16 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <SkeletonBlock className="h-24 w-24 rounded-[2rem] border-4 border-white bg-[color:color-mix(in_srgb,#ffffff_40%,var(--color-rice-green)_18%)] sm:h-28 sm:w-28" />
              <div className="space-y-3 pb-1">
                <SkeletonBlock className="h-8 w-52" />
                <SkeletonBlock className="h-6 w-28 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <AccountSectionSkeleton rows={3} />
        <AccountSectionSkeleton rows={2} />
      </section>

      <AccountSectionSkeleton rows={3} />

      <section className="grid gap-5 xl:grid-cols-2">
        <AccountSectionSkeleton rows={2} />
        <AccountSectionSkeleton rows={2} />
      </section>

      <AccountSectionSkeleton rows={1} />

      <div className="lg:hidden">
        <SkeletonBlock className="h-11 w-32" />
      </div>
    </CustomerShell>
  );
}
