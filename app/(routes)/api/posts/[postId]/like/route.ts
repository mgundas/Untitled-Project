import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/app/db";
import { posts, likes, notifications } from "@/app/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [existingLike] = await db
    .select()
    .from(likes)
    .where(and(eq(likes.postId, postId), eq(likes.userId, user.id)));

  if (existingLike) return NextResponse.json({ success: true });

  // Get the post to find the author
  const [post] = await db.select().from(posts).where(eq(posts.id, postId));
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  await db.insert(likes).values({ postId: postId, userId: user.id });
  await db
    .update(posts)
    .set({ likesCount: sql`${posts.likesCount} + 1` })
    .where(eq(posts.id, postId));

  // Create notification for the post author (don't notify yourself)
  if (post.authorId !== user.id) {
    await db.insert(notifications).values({
      userId: post.authorId,
      actorId: user.id,
      type: "like",
      postId: postId,
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db
    .delete(likes)
    .where(and(eq(likes.postId, postId), eq(likes.userId, user.id)));
  await db
    .update(posts)
    .set({ likesCount: sql`${posts.likesCount} - 1` })
    .where(eq(posts.id, postId));

  // Delete the notification
  await db
    .delete(notifications)
    .where(
      and(
        eq(notifications.postId, postId),
        eq(notifications.actorId, user.id),
        eq(notifications.type, "like")
      )
    );

  return NextResponse.json({ success: true });
}
