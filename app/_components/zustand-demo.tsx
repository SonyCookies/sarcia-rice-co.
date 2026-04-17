"use client";

import { useCounterStore } from "@/app/_stores/counter-store";

export default function ZustandDemo() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);
  const reset = useCounterStore((state) => state.reset);

  return (
    <section className="w-full rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
      <div className="flex flex-col gap-5">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            Zustand Store
          </p>
          <h2 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
            Shared client state is ready.
          </h2>
          <p className="max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            This counter is powered by a global Zustand store, so any other
            client component can read and update the same value.
          </p>
        </div>

        <div className="flex items-end justify-between gap-4 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Count</p>
            <p className="text-4xl font-semibold text-zinc-950 dark:text-zinc-50">
              {count}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={decrement}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Decrease
            </button>
            <button
              type="button"
              onClick={increment}
              className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-300"
            >
              Increase
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-transparent px-4 py-2 text-sm font-medium text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
