import { createClient } from "@/utils/supabase/server";
import { db } from "@/app/db";
import { profiles, follows } from "@/app/db/schema";
import { eq, sql } from "drizzle-orm";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserPostFeed } from "@/app/components/posts/UserPostFeed";
import { FollowButton } from "@/app/components/posts/FollowButton";

export default async function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>Please log in</div>;

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId));

  if (!profile) return <div>User not found</div>;

  // Get follower/following counts
  const [followersCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(follows)
    .where(eq(follows.followingId, userId));

  const [followingCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(follows)
    .where(eq(follows.followerId, userId));

  return (
    <div className="w-full h-full overflow-auto">
      <div className="w-full max-w-2xl mx-auto">
        <div className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatarUrl || undefined} />
                <AvatarFallback>
                  {profile.fullName?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{profile.fullName || "Anonymous"}</h1>
                <p className="text-muted-foreground text-sm">{profile.email}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span>
                    <strong>{followersCount.count}</strong> Followers
                  </span>
                  <span>
                    <strong>{followingCount.count}</strong> Following
                  </span>
                </div>
              </div>
            </div>
            <FollowButton userId={userId} />
          </div>
        </div>

        <UserPostFeed userId={userId} />
      </div>
    </div>
  );
}
