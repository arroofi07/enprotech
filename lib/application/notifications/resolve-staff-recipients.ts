import { listActiveAdminIds } from "@/lib/infrastructure/db/repositories/notification-repository";

/**
 * Resolve the staff recipients for a training-scoped notification:
 * all active admins plus the training creator (trainer), deduplicated and
 * excluding an optional user (typically the acting student).
 */
export async function resolveStaffRecipients(
  trainingCreatedBy: string,
  excludeUserId?: string,
): Promise<string[]> {
  const adminIds = await listActiveAdminIds();
  return [...new Set([...adminIds, trainingCreatedBy])].filter(
    (userId) => userId !== excludeUserId,
  );
}
