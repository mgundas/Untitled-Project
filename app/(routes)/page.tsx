import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Fetch wins for this user
  /*const userSessions = session?.user?.id
    ? await db.query.mast_sessions.findMany({
        where: eq(mast_sessions.userId, session.user.id),
        orderBy: [desc(mast_sessions.createdAt)],
      })
    : [];*/

  return (
    <main className="flex-1 overflow-auto w-full">
      <div className="flex flex-col xl:flex-row gap-6 p-4 md:p-6">
        <div className="flex-1 space-y-6 min-w-0">
          {session ? (
            <>
              <div className="space-y-4">
                Test
              </div>
            </>
          ) : (
            <p className="text-gray-400">
              Sign in with GitHub to start tracking your logs.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
