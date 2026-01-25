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

// Bookmarks table (save posts for later)
export const bookmarks = pgTable("bookmarks", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueBookmark: unique("bookmarks_post_user_unique").on(table.postId, table.userId)
}));

// Follows table (user following system)
export const follows = pgTable("follows", {
  id: uuid("id").primaryKey().defaultRandom(),
  followerId: uuid("follower_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  followingId: uuid("following_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueFollow: unique("follows_follower_following_unique").on(table.followerId, table.followingId)
}));

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }), // Who receives the notification
  actorId: uuid("actor_id").notNull().references(() => profiles.id, { onDelete: "cascade" }), // Who performed the action
  type: text("type").notNull(), // "like", "repost", "comment", "follow"
  postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }), // Optional - for post-related notifications
  commentId: uuid("comment_id").references(() => comments.id, { onDelete: "cascade" }), // Optional - for comment notifications
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  posts: many(posts),
  likes: many(likes),
  comments: many(comments),
  bookmarks: many(bookmarks),
  followers: many(follows, { relationName: "following" }),
  following: many(follows, { relationName: "follower" }),
  receivedNotifications: many(notifications, { relationName: "notificationRecipient" }),
  sentNotifications: many(notifications, { relationName: "notificationActor" }),
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

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  post: one(posts, { fields: [bookmarks.postId], references: [posts.id] }),
  user: one(profiles, { fields: [bookmarks.userId], references: [profiles.id] }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(profiles, { fields: [follows.followerId], references: [profiles.id], relationName: "follower" }),
  following: one(profiles, { fields: [follows.followingId], references: [profiles.id], relationName: "following" }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(profiles, { fields: [notifications.userId], references: [profiles.id], relationName: "notificationRecipient" }),
  actor: one(profiles, { fields: [notifications.actorId], references: [profiles.id], relationName: "notificationActor" }),
  post: one(posts, { fields: [notifications.postId], references: [posts.id] }),
  comment: one(comments, { fields: [notifications.commentId], references: [comments.id] }),
}));