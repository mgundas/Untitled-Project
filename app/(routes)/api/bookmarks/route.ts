import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/app/db";
import { bookmarks, posts, profiles, likes } from "@/app/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userBookmarks = await db
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
      bookmarkedAt: bookmarks.createdAt,
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
      isBookmarkedByCurrentUser: sql<boolean>`true`,
      isRepostedByCurrentUser: sql<boolean>`EXISTS(
        SELECT 1 FROM ${posts} AS reposts
        WHERE reposts.original_post_id = ${posts.id}
        AND reposts.author_id = ${user.id}
        AND reposts.is_repost = true
      )`,
    })
    .from(bookmarks)
    .innerJoin(posts, eq(bookmarks.postId, posts.id))
    .leftJoin(profiles, eq(posts.authorId, profiles.id))
    .where(eq(bookmarks.userId, user.id))
    .orderBy(desc(bookmarks.createdAt))
    .limit(50);

  const formattedBookmarks = userBookmarks.map(bookmark => ({
    ...bookmark,
    createdAt: bookmark.createdAt.toISOString(),
    bookmarkedAt: bookmark.bookmarkedAt.toISOString(),
  }));

  return NextResponse.json({ posts: formattedBookmarks });
}
