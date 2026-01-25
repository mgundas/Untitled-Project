import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/app/db";
import { notifications } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";

// PATCH /api/notifications/[notificationId]/read - Mark notification as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  const { notificationId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify the notification belongs to the current user
  const [notification] = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, user.id)));

  if (!notification) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Mark as read
  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.id, notificationId));

  return NextResponse.json({ success: true });
}
