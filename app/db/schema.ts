import { pgTable, text, timestamp, integer, serial, varchar, primaryKey } from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

// --- NextAuth Tables ---

export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable("account", {
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").$type<AdapterAccount>().notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (account) => ({
  compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
}));

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// --- Your Custom Tables ---

export const wins = pgTable("win", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  text: text("text").notNull(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow(),
});

// --- Sessions Table ---
// Stores the core "Heat" logs for releases and edging
export const mast_sessions = pgTable('mast_sessions', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 256 })
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  
  // Session Metrics
  sessionType: varchar('session_type', { length: 50 }).notNull(), // 'Release' or 'Edging'
  sessionIntensity: integer('session_intensity').notNull(), // Satisfaction/Arousal index 1-10
  duration: integer('duration').notNull(), // Minutes
  notes: text("notes").notNull(),
  
  // Timing
  loggedAt: timestamp('logged_at').notNull(), // The actual date/time of the session
  createdAt: timestamp('created_at').defaultNow(), // Record creation time
});

// --- Achievements (Medals) Table ---
// Tracks unlocked milestones for the "Hall of Satisfaction"
export const medals = pgTable('medals', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 256 })
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  medalId: varchar('medal_id', { length: 100 }).notNull(), // e.g., 'stamina_1', 'iron_grip'
  label: varchar('label', { length: 256 }).notNull(), // The display name of the medal
  unlockedAt: timestamp('unlocked_at').defaultNow(),
});

// --- User Stats View/Cache (Optional but recommended for performance) ---
// You can also store calculated streaks here to avoid heavy queries
export const userStats = pgTable('user_stats', {
  userId: varchar('user_id', { length: 256 })
    .references(() => users.id, { onDelete: 'cascade' })
    .primaryKey(),
  currentStreak: integer('current_streak').default(0),
  totalReleases: integer('total_releases').default(0),
  avgIntensity: integer('avg_intensity').default(0),
  lastActivity: timestamp('last_activity'),
});