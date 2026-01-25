import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/app/db";
import { bookmarks } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if already bookmarked
  const [existingBookmark] = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.postId, postId), eq(bookmarks.userId, user.id)));

  if (existingBookmark) {
    // Remove bookmark
    await db
      .delete(bookmarks)
      .where(and(eq(bookmarks.postId, postId), eq(bookmarks.userId, user.id)));
    return NextResponse.json({ success: true, isBookmarked: false });
  } else {
    // Add bookmark
    await db.insert(bookmarks).values({ postId, userId: user.id });
    return NextResponse.json({ success: true, isBookmarked: true });
  }
}
