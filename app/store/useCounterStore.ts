import { create } from 'zustand'

// 1. Define the shape of your state
interface CounterState {
  count: number
  increment: () => void
  decrement: () => void
  reset: (value: number) => void
}

// 2. Create the store
export const useCounterStore = create<CounterState>((set) => ({
  count: 0, // Initial state
  
  // Actions to update the state
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: (value) => set({ count: value }),
}))