import Link from "next/link";
import { ArrowLeft, Compass, ShieldAlert } from "lucide-react";

export default function AdminNotFound() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8f4e8_0%,#f1ead5_52%,#ebe2c7_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center">
        <section className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-[2.2rem] border border-[#d8d4be] bg-[linear-gradient(140deg,#2c441d_0%,#3a5728_48%,#5d7f42_100%)] p-6 text-white shadow-[0_34px_90px_rgba(44,60,29,0.24)] sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-white/14">
              <ShieldAlert className="h-7 w-7 text-[var(--color-rich-gold)]" />
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-rich-gold)]">
              Admin Page Not Found
            </p>
            <h1 className="mt-4 font-poppins text-3xl font-semibold leading-tight sm:text-4xl">
              This admin page is not available.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#edf3df] sm:text-base">
              The admin link may be outdated, incomplete, or no longer valid in
              the current workspace.
            </p>
          </div>

          <div className="rounded-[2.2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_24px_60px_rgba(78,95,58,0.1)] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
              Quick Recovery
            </p>
            <div className="mt-5 grid gap-3">
              <Link
                href="/admin"
                className="rounded-[1.5rem] border border-[#e5e0cc] bg-[#faf7ee] p-4 transition hover:border-[#cfc8aa] hover:bg-[#f6f1e3]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#4d6b35,#6f8b54)] text-white">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2f3b1f]">
                      Go to Admin Dashboard
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[#6d7452]">
                      Return to the main admin workspace and continue from there.
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/users"
                className="rounded-[1.5rem] border border-[#e5e0cc] bg-[#faf7ee] p-4 transition hover:border-[#cfc8aa] hover:bg-[#f6f1e3]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#4d6b35,#6f8b54)] text-white">
                    <ArrowLeft className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2f3b1f]">
                      Back to Users Directory
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[#6d7452]">
                      Review the users directory and open a valid account from the list.
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
