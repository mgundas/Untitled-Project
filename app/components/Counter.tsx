"use client"
import { useEffect, useState } from 'react'
import { useCounterStore } from '../store/useCounterStore'

export default function SafeCounter() {
  const [mounted, setMounted] = useState(false)
  const count = useCounterStore((state) => state.count)

  // Only run after the component has mounted on the client
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div>Loading</div> // or a loading skeleton

  return <div>{count}</div>
}