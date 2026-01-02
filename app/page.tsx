import { db } from "./db";
import { wins } from "./db/schema";
import { eq, desc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "./lib/auth";
import LogModal from "./components/LogModal";
import Modal from "./components/Modal";
import { log } from "console";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Fetch wins for this user
  const userWins = session?.user?.id
    ? await db.query.wins.findMany({
        where: eq(wins.userId, session.user.id),
        orderBy: [desc(wins.createdAt)],
      })
    : [];

  return (
    <main className="p-10 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-8">Win Log</h1>

      {session ? (
        <>
          <div className="space-y-4">
            {userWins.map((win) => (
              <div
                key={win.id}
                className="border-l-4 border-green-500 pl-4 py-2 bg-white/5"
              >
                <p className="text-lg">{win.text}</p>
                <span className="text-xs text-gray-400">
                  {win.createdAt?.toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-gray-400">
          Sign in with GitHub to start tracking your wins.
        </p>
      )}
    </main>
  );
}
