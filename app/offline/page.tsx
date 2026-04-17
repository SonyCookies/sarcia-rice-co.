import Link from "next/link";

export const metadata = {
  title: "Offline | Sarcia Rice Co.",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f9f4e7_0%,#f2ecdc_100%)] px-6 py-16">
      <section className="w-full max-w-lg rounded-[2rem] border border-[#ddd3bc] bg-white/95 p-8 text-center shadow-[0_24px_70px_rgba(74,92,54,0.12)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-rich-gold)]">
          Sarcia Rice Co.
        </p>
        <h1 className="mt-4 font-poppins text-3xl font-semibold text-[#2f3b1f]">
          You&apos;re offline right now
        </h1>
        <p className="mt-4 text-sm leading-7 text-[#6d7452]">
          Your connection dropped, so some fresh data and account actions are
          temporarily unavailable. Once you&apos;re back online, you can continue
          ordering and managing deliveries normally.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-[var(--color-rice-green)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color-mix(in_srgb,var(--color-rice-green)_82%,black)]"
          >
            Try Again
          </Link>
        </div>
      </section>
    </main>
  );
}
