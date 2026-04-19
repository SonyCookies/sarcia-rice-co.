"use client";

export default function AccountPaymentPreferences() {
  return (
    <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
              Payment Methods
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-[1.4rem] border border-dashed border-[#d9d3bf] bg-[#faf7ee] px-5 py-6">
        <p className="text-sm font-semibold text-[#2f3b1f]">Coming Soon</p>
        <p className="mt-2 text-sm leading-6 text-[#6d7452]">
          We&apos;ll add saved payment preferences here once the checkout flow is
          ready for them.
        </p>
      </div>
    </section>
  );
}
