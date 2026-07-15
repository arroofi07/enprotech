import type { SessionUser } from "@/lib/domain/auth/types";
import {
  NotificationErrorCode,
  notificationFailure,
  notificationSuccess,
  type NotificationResult,
} from "@/lib/domain/notifications/errors";
import type { NotificationRecord } from "@/lib/domain/notifications/types";

export function assertAuthenticated(
  actor: SessionUser | null,
): NotificationResult<never> | null {
  if (!actor) {
    return notificationFailure(NotificationErrorCode.UNAUTHORIZED);
  }

  return null;
}

function resolveNotificationHref(
  notification: NotificationRecord,
): string | null {
  const href = notification.data?.href ?? null;
  if (!href) {
    return null;
  }

  // Rows written before the href fix point at routes that never existed.
  // Repair them on read; new rows already arrive in the correct shape.
  const trainingMatch = href.match(/^\/trainer\/trainings\/([^/]+)$/);
  if (trainingMatch) {
    return `/trainer/trainings/${trainingMatch[1]}/modules`;
  }

  const projectsMatch = href.match(/^\/trainer\/trainings\/([^/]+)\/projects$/);
  if (projectsMatch) {
    return `/trainer/projects?trainingId=${projectsMatch[1]}`;
  }

  const feedbackMatch = href.match(/^\/trainer\/trainings\/([^/]+)\/feedback$/);
  if (feedbackMatch) {
    return `/trainer/feedback?trainingId=${feedbackMatch[1]}`;
  }

  if (href === "/admin" || href === "/trainer" || href === "/student") {
    return `${href}/dashboard`;
  }

  return href;
}

export function toNotificationView(notification: NotificationRecord) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    href: resolveNotificationHref(notification),
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString(),
    data: notification.data,
  };
}
