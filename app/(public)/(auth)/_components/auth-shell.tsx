import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  description: string;
  title: string;
  stats: Array<{
    label: string;
    value: string;
  }>;
};

export default function AuthShell({
  children,
  description,
  stats,
  title,
}: AuthShellProps) {
  return (
    <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[#d8d4be] bg-[#fffdf7] shadow-[0_24px_80px_rgba(74,92,54,0.14)] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden min-h-[720px] bg-[var(--color-rice-green)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="relative">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-rich-gold)]">
            SARCIA RICE CO.
          </p>
          <h2 className="max-w-md text-5xl font-semibold leading-[1.05] tracking-tight">
            {title}
          </h2>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#f5f1db]">
            {description}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm"
            >
              <p className="text-2xl font-semibold">{stat.value}</p>
              <p className="mt-1 text-sm text-[#f5f1db]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center bg-[#fffdf7] p-8 md:p-12">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </section>
    </div>
  );
}
