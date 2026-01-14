"use server"

import { db } from "../db";
import { mast_sessions } from "../db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { revalidatePath } from "next/cache";

export async function addWin(formData: FormData) {
  const session = await getServerSession(authOptions);
  const data = Object.fromEntries(formData.entries());

  if (!session?.user?.id || !data) return;

  // Drizzle insert syntax:
  await db.insert(mast_sessions).values({
    userId: session.user.id,
    sessionType: data.type as string,
    sessionIntensity: parseInt(data.sessionIntensity as string, 10),
    duration: parseInt(data.duration as string, 10),
    notes: data.notes as string,
    loggedAt: new Date((data.date + " " + data.time) as string),
  });

  revalidatePath("/");
}