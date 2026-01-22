import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/app/db";
import { comments, profiles } from "@/app/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const postComments = await db
    .select({
      id: comments.id,
      content: comments.content,
      postId: comments.postId,
      authorId: comments.authorId,
      createdAt: comments.createdAt,
      author: {
        id: profiles.id,
        fullName: profiles.fullName,
        avatarUrl: profiles.avatarUrl,
      },
    })
    .from(comments)
    .leftJoin(profiles, eq(comments.authorId, profiles.id))
    .where(eq(comments.postId, postId))
    .orderBy(desc(comments.createdAt));

  const formattedComments = postComments.map(comment => ({
    ...comment,
    createdAt: comment.createdAt.toISOString(),
  }));

  return NextResponse.json(formattedComments);
}
