import Link from "next/link";
import { ArrowLeft, Compass, Home, SearchX } from "lucide-react";

const quickLinks = [
  {
    href: "/",
    label: "Back to Home",
    description: "Return to the main Sarcia Rice Co. landing page.",
    icon: Home,
  },
  {
    href: "/account",
    label: "Open Account",
    description: "Go back to your account overview if you were already signed in.",
    icon: Compass,
  },
];

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8f4e8_0%,#f1ead5_52%,#ebe2c7_100%)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-[color:color-mix(in_srgb,var(--color-rich-gold)_18%,transparent)] blur-3xl" />
        <div className="absolute right-[-5rem] top-[-3rem] h-80 w-80 rounded-full bg-[color:color-mix(in_srgb,var(--color-rice-green)_16%,transparent)] blur-3xl" />
        <div className="absolute bottom-[-6rem] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/40 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid w-full gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="overflow-hidden rounded-[2.2rem] border border-[#d8d4be] bg-[linear-gradient(140deg,#2c441d_0%,#3a5728_48%,#5d7f42_100%)] p-6 text-white shadow-[0_34px_90px_rgba(44,60,29,0.24)] sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-white/14 shadow-[0_18px_36px_rgba(16,24,12,0.16)]">
              <SearchX className="h-7 w-7 text-[var(--color-rich-gold)]" />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-rich-gold)]">
              Page Not Found
            </p>
            <h1 className="mt-4 max-w-2xl font-poppins text-3xl font-semibold leading-tight sm:text-4xl lg:text-[2.8rem]">
              The page you&apos;re looking for is not available here.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#edf3df] sm:text-base">
              The link may be outdated, the page may have moved, or the address
              may have been typed incorrectly. You can head back to a safe entry
              point below and continue from there.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#2f3b1f] transition hover:bg-[#f6f2e7]"
              >
                <Home className="h-4 w-4" />
                Go to Home
              </Link>
              <Link
                href="/account"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/18 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Account
              </Link>
            </div>
          </div>

          <div className="rounded-[2.2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_24px_60px_rgba(78,95,58,0.1)] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
              Quick Recovery
            </p>

            <div className="mt-5 space-y-3">
              {quickLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-[1.5rem] border border-[#e5e0cc] bg-[#faf7ee] p-4 transition hover:border-[#cfc8aa] hover:bg-[#f6f1e3]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#4d6b35,#6f8b54)] text-white shadow-[0_14px_30px_rgba(77,107,53,0.18)]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#2f3b1f]">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[#6d7452]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-dashed border-[#d6cfb6] bg-[#fffdf7] p-4">
              <p className="text-sm font-semibold text-[#2f3b1f]">
                A quick tip before you retry
              </p>
              <p className="mt-2 text-sm leading-6 text-[#6d7452]">
                Double-check the URL, especially if it was copied from an old
                bookmark or a shared link from an earlier version of the app.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
