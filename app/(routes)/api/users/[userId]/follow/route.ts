import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/app/db";
import { follows, notifications } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Can't follow yourself
  if (user.id === userId) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  // Check if already following
  const [existingFollow] = await db
    .select()
    .from(follows)
    .where(and(eq(follows.followerId, user.id), eq(follows.followingId, userId)));

  if (existingFollow) {
    // Unfollow
    await db
      .delete(follows)
      .where(and(eq(follows.followerId, user.id), eq(follows.followingId, userId)));

    // Delete the notification
    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.actorId, user.id),
          eq(notifications.type, "follow")
        )
      );

    return NextResponse.json({ success: true, isFollowing: false });
  } else {
    // Follow
    await db.insert(follows).values({ followerId: user.id, followingId: userId });

    // Create notification for the user being followed
    await db.insert(notifications).values({
      userId: userId,
      actorId: user.id,
      type: "follow",
    });

    return NextResponse.json({ success: true, isFollowing: true });
  }
}
