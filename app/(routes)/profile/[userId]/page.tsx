import { createClient } from "@/utils/supabase/server";
import { db } from "@/app/db";
import { profiles } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserPostFeed } from "@/app/components/posts/UserPostFeed";

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

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="p-6 border-b">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatarUrl || undefined} />
            <AvatarFallback>
              {profile.fullName?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{profile.fullName || "Anonymous"}</h1>
            <p className="text-muted-foreground">{profile.email}</p>
          </div>
        </div>
      </div>

      <UserPostFeed userId={userId} />
    </div>
  );
}
