import AdminShell from "@/app/admin/_components/admin-shell";

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-full bg-[#ece7d6] ${className}`} />;
}

export default function AdminUserDetailsLoading() {
  return (
    <AdminShell
      subtitle="Review this account's profile, protection controls, and recent security activity."
      searchPlaceholder="Search users, account actions, or security history"
    >
      <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
        <SkeletonBlock className="h-4 w-36" />
        <SkeletonBlock className="mt-4 h-10 w-2/3" />
        <SkeletonBlock className="mt-3 h-4 w-full max-w-2xl" />
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[1.5rem] border border-[#e5e0cc] bg-[#faf7ee] p-5"
            >
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="mt-4 h-7 w-32" />
              <SkeletonBlock className="mt-3 h-4 w-3/4" />
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
          <SkeletonBlock className="h-4 w-40" />
          <div className="mt-5 grid gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] p-4"
              >
                <SkeletonBlock className="h-3 w-28" />
                <SkeletonBlock className="mt-3 h-5 w-1/2" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
          <SkeletonBlock className="h-4 w-36" />
          <div className="mt-5 grid gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] p-4"
              >
                <SkeletonBlock className="h-4 w-1/3" />
                <SkeletonBlock className="mt-3 h-4 w-full" />
                <SkeletonBlock className="mt-2 h-10 w-32" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6"
          >
            <SkeletonBlock className="h-4 w-40" />
            <div className="mt-5 grid gap-3">
              {Array.from({ length: 3 }).map((__, innerIndex) => (
                <div
                  key={innerIndex}
                  className="rounded-[1.4rem] border border-[#e5e0cc] bg-[#faf7ee] p-4"
                >
                  <SkeletonBlock className="h-4 w-1/3" />
                  <SkeletonBlock className="mt-3 h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </AdminShell>
  );
}
