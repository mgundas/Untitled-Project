import { pgTable, text, uuid, timestamp, integer, boolean, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().notNull(), // This matches auth.users ID
  email: text("email").notNull(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Posts table
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  authorId: uuid("author_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),

  // Denormalized counts for performance
  likesCount: integer("likes_count").default(0).notNull(),
  repostsCount: integer("reposts_count").default(0).notNull(),
  commentsCount: integer("comments_count").default(0).notNull(),

  // Repost tracking
  originalPostId: uuid("original_post_id").references(() => posts.id, { onDelete: "cascade" }),
  isRepost: boolean("is_repost").default(false).notNull(),
});

// Likes table (unique constraint: one like per user per post)
export const likes = pgTable("likes", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueLike: unique("likes_post_user_unique").on(table.postId, table.userId)
}));

// Comments table (flat only - no nested replies)
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  posts: many(posts),
  likes: many(likes),
  comments: many(comments),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(profiles, { fields: [posts.authorId], references: [profiles.id] }),
  likes: many(likes),
  comments: many(comments),
  originalPost: one(posts, { fields: [posts.originalPostId], references: [posts.id] }),
  reposts: many(posts),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  post: one(posts, { fields: [likes.postId], references: [posts.id] }),
  user: one(profiles, { fields: [likes.userId], references: [profiles.id] }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, { fields: [comments.postId], references: [posts.id] }),
  author: one(profiles, { fields: [comments.authorId], references: [profiles.id] }),
}));