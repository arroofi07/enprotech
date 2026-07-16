import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    data: jsonb("data").$type<Record<string, unknown>>(),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Serves the bell's two hot queries — the unread badge count and the
    // newest-first list — which every logged-in user runs on every page.
    // Without it both are sequential scans over the whole table.
    index("notifications_user_id_created_at_idx").on(
      table.userId,
      table.createdAt.desc(),
    ),
    // Makes dedupKey a guarantee rather than a convention: two concurrent
    // deadline-reminder syncs can no longer both insert the same reminder.
    // Partial, because only reminder notifications carry a dedupKey and NULLs
    // would otherwise bloat the index without constraining anything.
    uniqueIndex("notifications_user_id_dedup_key_idx")
      .on(table.userId, sql`(${table.data} ->> 'dedupKey')`)
      .where(sql`${table.data} ->> 'dedupKey' IS NOT NULL`),
  ],
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
