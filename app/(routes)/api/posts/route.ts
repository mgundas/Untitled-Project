import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/app/db";
import { posts, profiles, likes, comments, bookmarks, notifications } from "@/app/db/schema";
import { desc, eq, sql, lt, inArray } from "drizzle-orm";

// GET /api/posts - Infinite scroll feed
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limit = 10;

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

// POST /api/posts - Create post or comment
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { content, isComment, postId } = body;

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }
  if (content.length > 280) {
    return NextResponse.json({ error: "Max 280 characters" }, { status: 400 });
  }

  if (isComment && postId) {
    // Get the post to find the author
    const [post] = await db.select().from(posts).where(eq(posts.id, postId));
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    // Create comment
    const [newComment] = await db.insert(comments).values({
      content: content.trim(),
      postId,
      authorId: user.id,
    }).returning();

    // Increment parent post comment count
    await db.update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} + 1` })
      .where(eq(posts.id, postId));

    // Create notification for the post author (don't notify yourself)
    if (post.authorId !== user.id) {
      await db.insert(notifications).values({
        userId: post.authorId,
        actorId: user.id,
        type: "comment",
        postId: postId,
        commentId: newComment.id,
      });
    }

    return NextResponse.json(newComment, { status: 201 });
  } else {
    // Create post
    const [newPost] = await db.insert(posts).values({
      content: content.trim(),
      authorId: user.id,
    }).returning();

    const [postWithAuthor] = await db
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
      })
      .from(posts)
      .leftJoin(profiles, eq(posts.authorId, profiles.id))
      .where(eq(posts.id, newPost.id));

    return NextResponse.json({
      ...postWithAuthor,
      createdAt: postWithAuthor.createdAt.toISOString(),
      updatedAt: postWithAuthor.updatedAt?.toISOString() || null,
    }, { status: 201 });
  }
}
