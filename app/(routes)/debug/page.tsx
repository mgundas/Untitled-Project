import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export default async function DebugPage() {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <div className="p-10 font-mono text-sm">
      <h1 className="text-xl font-bold mb-4">Auth Debugger</h1>

      <section className="mb-6">
        <h2 className="font-bold mb-2">1. Supabase Auth Status:</h2>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
          {user ? `✅ LOGGED IN as ${user.email}\nUser ID: ${user.id}` : "❌ NOT LOGGED IN"}
          {error && `\n\n❌ Error: ${error.message}`}
          {session ? `\n\n✅ Session exists (expires: ${new Date(session.expires_at! * 1000).toLocaleString()})` : '\n\n❌ No session found'}
        </pre>
      </section>

      <section className="mb-6">
        <h2 className="font-bold mb-2">2. Cookies ({allCookies.length} total):</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          {allCookies.length === 0 ? (
            <p className="text-red-600">❌ No cookies found!</p>
          ) : (
            <ul className="space-y-1">
              {allCookies.map(c => (
                <li key={c.name} className={c.name.includes('sb-') ? "text-green-600 font-bold" : ""}>
                  {c.name.includes('sb-') ? '✅ ' : '• '}{c.name}
                  {c.name.includes('sb-') && ` = ${c.value.substring(0, 50)}...`}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-bold mb-2">3. Environment:</h2>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ NOT SET'}
          {'\n'}NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ SET' : '❌ NOT SET'}
        </pre>
      </section>
    </div>
  )
}