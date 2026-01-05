import { db } from "./db";
import { mast_sessions, wins } from "./db/schema";
import { eq, desc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "./lib/auth";
import { NoSessions } from "./components/NoSessions";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Fetch wins for this user
  const userSessions = session?.user?.id
    ? await db.query.mast_sessions.findMany({
        where: eq(mast_sessions.userId, session.user.id),
        orderBy: [desc(mast_sessions.createdAt)],
      })
    : [];

  return (
    <main className="flex-1 overflow-auto w-full">
      <div className="flex flex-col xl:flex-row gap-6 p-4 md:p-6">
        <div className="flex-1 space-y-6 min-w-0">
          {session ? (
            <>
              <div className="space-y-4">
                {userSessions.length > 0 ? (
                  userSessions.map((win) => (
                    <div
                      key={win.id}
                      className="border-l-4 border-fuchsia-500 pl-4 py-2 bg-white/5"
                    >
                      <p className="text-lg ">
                        Type: {win.sessionType.toUpperCase()}
                      </p>
                      <p className="text-lg">
                        Intensity: {win.sessionIntensity}
                      </p>
                      <p className="text-lg">
                        Duration: {win.duration} Minutes
                      </p>
                      <p className="text-lg">Trigger: {win.notes}</p>
                      <span className="text-xs text-gray-400">
                        {win.loggedAt?.toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <NoSessions />
                )}
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
