import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/app/db";
import { posts, likes } from "@/app/db/schema";
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

  await db.insert(likes).values({ postId: postId, userId: user.id });
  await db
    .update(posts)
    .set({ likesCount: sql`${posts.likesCount} + 1` })
    .where(eq(posts.id, postId));

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

  return NextResponse.json({ success: true });
}
