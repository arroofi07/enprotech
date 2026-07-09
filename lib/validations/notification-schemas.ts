import { z } from "zod";

export const markNotificationReadSchema = z.object({
  notificationId: z.string().uuid(),
});

export const markAllNotificationsReadSchema = z.object({
  markAll: z.literal(true),
});

export const updateNotificationsSchema = z.union([
  markNotificationReadSchema,
  markAllNotificationsReadSchema,
]);
