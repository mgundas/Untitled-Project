'use client'
import { createBrowserClient } from '@supabase/ssr'

export default function AuthButtons() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const login = (provider: 'google' | 'github') => {
    supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  return (
    <div className="flex gap-4">
      <button onClick={() => login('google')}>Google</button>
      <button onClick={() => login('github')}>GitHub</button>
    </div>
  )
}