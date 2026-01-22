import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/app/db";
import { posts, profiles } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [post] = await db
    .select({
      id: posts.id,
      content: posts.content,
      authorId: posts.authorId,
      createdAt: posts.createdAt,
      likesCount: posts.likesCount,
      repostsCount: posts.repostsCount,
      commentsCount: posts.commentsCount,
      author: {
        id: profiles.id,
        fullName: profiles.fullName,
        avatarUrl: profiles.avatarUrl,
      },
    })
    .from(posts)
    .leftJoin(profiles, eq(posts.authorId, profiles.id))
    .where(eq(posts.id, postId));

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...post,
    createdAt: post.createdAt.toISOString(),
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [post] = await db.select().from(posts).where(eq(posts.id, postId));
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.authorId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.delete(posts).where(eq(posts.id, postId));
  return NextResponse.json({ success: true });
}
