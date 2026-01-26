import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/app/db";
import { posts, profiles, likes, bookmarks, follows } from "@/app/db/schema";
import { desc, eq, sql, lt, inArray } from "drizzle-orm";

// GET /api/posts/following - Feed of posts from followed users
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limit = 10;

  // Get list of users the current user follows
  const followingUsers = await db
    .select({ userId: follows.followingId })
    .from(follows)
    .where(eq(follows.followerId, user.id));

  const followingUserIds = followingUsers.map(f => f.userId);

  // If not following anyone, return empty feed
  if (followingUserIds.length === 0) {
    return NextResponse.json({ posts: [], nextCursor: null, hasMore: false });
  }

  const whereCondition = cursor ? lt(posts.createdAt, new Date(cursor)) : undefined;

  const postsQuery = db
    .select({
      id: posts.id,
      content: posts.content,
      authorId: posts.authorId,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
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
      isBookmarkedByCurrentUser: sql<boolean>`EXISTS(
        SELECT 1 FROM ${bookmarks}
        WHERE ${bookmarks.postId} = ${posts.id}
        AND ${bookmarks.userId} = ${user.id}
      )`,
      isRepostedByCurrentUser: sql<boolean>`EXISTS(
        SELECT 1 FROM ${posts} AS reposts
        WHERE reposts.original_post_id = ${posts.id}
        AND reposts.author_id = ${user.id}
        AND reposts.is_repost = true
      )`,
    })
    .from(posts)
    .leftJoin(profiles, eq(posts.authorId, profiles.id))
    .where(inArray(posts.authorId, followingUserIds))
    .orderBy(desc(posts.createdAt))
    .limit(limit + 1);

  const results = whereCondition
    ? await postsQuery.where(whereCondition)
    : await postsQuery;

  const hasMore = results.length > limit;
  const postsData = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? postsData[postsData.length - 1].createdAt.toISOString() : null;

  // For reposts, fetch original posts
  const repostIds = postsData.filter(p => p.isRepost && p.originalPostId).map(p => p.originalPostId!);
  let originalPosts: any[] = [];
  if (repostIds.length > 0) {
    originalPosts = await db
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
        isLikedByCurrentUser: sql<boolean>`EXISTS(
          SELECT 1 FROM ${likes}
          WHERE ${likes.postId} = ${posts.id}
          AND ${likes.userId} = ${user.id}
        )`,
        isBookmarkedByCurrentUser: sql<boolean>`EXISTS(
          SELECT 1 FROM ${bookmarks}
          WHERE ${bookmarks.postId} = ${posts.id}
          AND ${bookmarks.userId} = ${user.id}
        )`,
        isRepostedByCurrentUser: sql<boolean>`EXISTS(
          SELECT 1 FROM ${posts} AS reposts
          WHERE reposts.original_post_id = ${posts.id}
          AND reposts.author_id = ${user.id}
          AND reposts.is_repost = true
        )`,
      })
      .from(posts)
      .leftJoin(profiles, eq(posts.authorId, profiles.id))
      .where(inArray(posts.id, repostIds));
  }

  const postsWithOriginals = postsData.map(post => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt?.toISOString() || null,
    originalPost: post.isRepost ? originalPosts.find(op => op.id === post.originalPostId) : null,
  }));

  return NextResponse.json({ posts: postsWithOriginals, nextCursor, hasMore });
}
