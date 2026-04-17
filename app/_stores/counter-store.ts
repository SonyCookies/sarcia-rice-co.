import "client-only";

import { create } from "zustand";

type CounterStore = {
  count: number;
  decrement: () => void;
  increment: () => void;
  reset: () => void;
};

export const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  decrement: () => set((state) => ({ count: state.count - 1 })),
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}));
