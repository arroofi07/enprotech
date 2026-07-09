import { and, count, desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema/notifications";
import { users } from "@/lib/db/schema/users";
import type {
  NotificationData,
  NotificationRecord,
  NotificationType,
} from "@/lib/domain/notifications/types";

const notificationColumns = {
  id: notifications.id,
  userId: notifications.userId,
  type: notifications.type,
  title: notifications.title,
  message: notifications.message,
  data: notifications.data,
  isRead: notifications.isRead,
  createdAt: notifications.createdAt,
};

function mapNotification(
  row: typeof notifications.$inferSelect,
): NotificationRecord {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type as NotificationType,
    title: row.title,
    message: row.message,
    data: (row.data as NotificationData | null) ?? null,
    isRead: row.isRead,
    createdAt: row.createdAt,
  };
}

export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
}): Promise<NotificationRecord> {
  const [row] = await db
    .insert(notifications)
    .values({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data ?? null,
    })
    .returning(notificationColumns);

  return mapNotification(row);
}

export async function createNotifications(
  items: Array<{
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: NotificationData;
  }>,
): Promise<NotificationRecord[]> {
  if (items.length === 0) {
    return [];
  }

  const rows = await db
    .insert(notifications)
    .values(
      items.map((item) => ({
        userId: item.userId,
        type: item.type,
        title: item.title,
        message: item.message,
        data: item.data ?? null,
      })),
    )
    .returning(notificationColumns);

  return rows.map(mapNotification);
}

export async function listNotificationsByUser(
  userId: string,
  limit = 50,
): Promise<NotificationRecord[]> {
  const rows = await db
    .select(notificationColumns)
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);

  return rows.map(mapNotification);
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  const [result] = await db
    .select({ value: count() })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
    );

  return result?.value ?? 0;
}

export async function hasNotificationWithDedupKey(
  userId: string,
  dedupKey: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        sql`${notifications.data}->>'dedupKey' = ${dedupKey}`,
      ),
    )
    .limit(1);

  return Boolean(row);
}

export async function markNotificationRead(
  userId: string,
  notificationId: string,
): Promise<NotificationRecord | null> {
  const [row] = await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId),
      ),
    )
    .returning(notificationColumns);

  return row ? mapNotification(row) : null;
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  const updated = await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
    )
    .returning({ id: notifications.id });

  return updated.length;
}

export async function listActiveAdminIds(): Promise<string[]> {
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.role, "admin"), eq(users.status, "active")));

  return rows.map((row) => row.id);
}
