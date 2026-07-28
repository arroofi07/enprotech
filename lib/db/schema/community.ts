import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { trainings } from "./trainings";
import { users } from "./users";

export const communityMessages = pgTable(
  "community_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    trainingId: uuid("training_id")
      .notNull()
      .references(() => trainings.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("community_messages_training_id_created_at_idx").on(
      table.trainingId,
      table.createdAt,
    ),
  ],
);

export const communityMeetings = pgTable(
  "community_meetings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    trainingId: uuid("training_id")
      .notNull()
      .references(() => trainings.id, { onDelete: "cascade" }),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    meetLink: text("meet_link").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("community_meetings_training_id_scheduled_at_idx").on(
      table.trainingId,
      table.scheduledAt,
    ),
  ],
);

export type CommunityMessage = typeof communityMessages.$inferSelect;
export type NewCommunityMessage = typeof communityMessages.$inferInsert;
export type CommunityMeeting = typeof communityMeetings.$inferSelect;
export type NewCommunityMeeting = typeof communityMeetings.$inferInsert;
