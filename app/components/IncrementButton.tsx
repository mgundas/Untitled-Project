"use client"

import { useCounterStore } from '../store/useCounterStore'

export default function IncrementButton() {
  // 1. Pull the function out of the store
  const increment = useCounterStore((state) => state.increment)

  return (
    // 2. Call it when the button is clicked
    <button 
      onClick={() => increment()}
      className="px-4 py-2 bg-green-500 rounded text-white"
    >
      Increase Counter
    </button>
  )
}