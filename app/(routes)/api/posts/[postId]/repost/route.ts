import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/app/db";
import { posts, notifications } from "@/app/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if already reposted
  const [existingRepost] = await db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.originalPostId, postId),
        eq(posts.authorId, user.id),
        eq(posts.isRepost, true)
      )
    );

  if (existingRepost) {
    // Remove repost
    await db.delete(posts).where(eq(posts.id, existingRepost.id));
    await db
      .update(posts)
      .set({ repostsCount: sql`${posts.repostsCount} - 1` })
      .where(eq(posts.id, postId));

    // Delete the notification
    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.postId, postId),
          eq(notifications.actorId, user.id),
          eq(notifications.type, "repost")
        )
      );

    return NextResponse.json({ success: true, isReposted: false });
  } else {
    // Get original post
    const [originalPost] = await db.select().from(posts).where(eq(posts.id, postId));
    if (!originalPost) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Create repost
    await db.insert(posts).values({
      content: originalPost.content,
      authorId: user.id,
      originalPostId: postId,
      isRepost: true,
    });
    await db
      .update(posts)
      .set({ repostsCount: sql`${posts.repostsCount} + 1` })
      .where(eq(posts.id, postId));

    // Create notification for the post author (don't notify yourself)
    if (originalPost.authorId !== user.id) {
      await db.insert(notifications).values({
        userId: originalPost.authorId,
        actorId: user.id,
        type: "repost",
        postId: postId,
      });
    }

    return NextResponse.json({ success: true, isReposted: true });
  }
}
