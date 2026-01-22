import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/app/db";
import { posts, profiles, likes } from "@/app/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userPosts = await db
    .select({
      id: posts.id,
      content: posts.content,
      authorId: posts.authorId,
      createdAt: posts.createdAt,
      likesCount: posts.likesCount,
      repostsCount: posts.repostsCount,
      commentsCount: posts.commentsCount,
      isRepost: posts.isRepost,
      originalPostId: posts.originalPostId,
      author: {
        id: profiles.id,
        fullName: profiles.fullName,
        avatarUrl: profiles.avatarUrl,
      },
      isLikedByCurrentUser: sql<boolean>`EXISTS(
        SELECT 1 FROM ${likes}
        WHERE ${likes.postId} = ${posts.id}
        AND ${likes.userId} = ${user.id}
      )`,
    })
    .from(posts)
    .leftJoin(profiles, eq(posts.authorId, profiles.id))
    .where(eq(posts.authorId, userId))
    .orderBy(desc(posts.createdAt))
    .limit(50);

  const formattedPosts = userPosts.map(post => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
  }));

  return NextResponse.json({ posts: formattedPosts });
}
