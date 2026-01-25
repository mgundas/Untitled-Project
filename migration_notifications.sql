-- Migration: Add notifications table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS "notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "actor_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "post_id" uuid REFERENCES "posts"("id") ON DELETE CASCADE,
  "comment_id" uuid REFERENCES "comments"("id") ON DELETE CASCADE,
  "read" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_notifications_user_id" ON "notifications"("user_id");
CREATE INDEX IF NOT EXISTS "idx_notifications_created_at" ON "notifications"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_notifications_user_read" ON "notifications"("user_id", "read");
