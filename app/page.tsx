import { db } from "./db";
import { mast_sessions, wins } from "./db/schema";
import { eq, desc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "./lib/auth";

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
    <main className="p-10 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-8">Masturbation Log</h1>

      {session ? (
        <>
          <div className="space-y-4">
            {userSessions.map((win) => (
              <div
                key={win.id}
                className="border-l-4 border-fuchsia-500 pl-4 py-2 bg-white/5"
              >
                <p className="text-lg ">Type: {win.sessionType.toUpperCase()}</p>
                <p className="text-lg">Intensity: {win.sessionIntensity}</p>
                <p className="text-lg">Duration: {win.duration} Minutes</p>
                <p className="text-lg">Trigger: {win.notes}</p>
                <span className="text-xs text-gray-400">
                  {win.loggedAt?.toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-gray-400">
          Sign in with GitHub to start tracking your logs.
        </p>
      )}
    </main>
  );
}
