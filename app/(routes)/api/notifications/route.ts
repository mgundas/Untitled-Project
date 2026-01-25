import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/app/db";
import { notifications, profiles, posts, comments } from "@/app/db/schema";
import { eq, desc, and } from "drizzle-orm";

// GET /api/notifications - Get user's notifications with pagination
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limit = 20;

  const notificationsQuery = db
    .select({
      id: notifications.id,
      userId: notifications.userId,
      actorId: notifications.actorId,
      type: notifications.type,
      postId: notifications.postId,
      commentId: notifications.commentId,
      read: notifications.read,
      createdAt: notifications.createdAt,
      actor: {
        id: profiles.id,
        fullName: profiles.fullName,
        avatarUrl: profiles.avatarUrl,
      },
      post: {
        id: posts.id,
        content: posts.content,
      },
      comment: {
        id: comments.id,
        content: comments.content,
      },
    })
    .from(notifications)
    .leftJoin(profiles, eq(notifications.actorId, profiles.id))
    .leftJoin(posts, eq(notifications.postId, posts.id))
    .leftJoin(comments, eq(notifications.commentId, comments.id))
    .where(
      cursor
        ? and(
            eq(notifications.userId, user.id),
            desc(notifications.createdAt)
          )
        : eq(notifications.userId, user.id)
    )
    .orderBy(desc(notifications.createdAt))
    .limit(limit + 1);

  const results = await notificationsQuery;
  const hasMore = results.length > limit;
  const notificationsData = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? notificationsData[notificationsData.length - 1].createdAt?.toISOString() : null;

  return NextResponse.json({
    notifications: notificationsData.map(n => ({
      ...n,
      createdAt: n.createdAt?.toISOString(),
    })),
    nextCursor,
    hasMore,
  });
}
