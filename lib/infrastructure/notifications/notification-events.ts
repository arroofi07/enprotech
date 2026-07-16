import { getPostgresClient } from "@/lib/db";

const CHANNEL = "notification_created";

/**
 * Postgres caps a NOTIFY payload at 8000 bytes. A uuid costs ~37 bytes inside a
 * JSON array, so 100 ids (~3.7 KB) stays well clear even with the quoting.
 * Broadcasts larger than this fan out across several NOTIFYs.
 */
const MAX_IDS_PER_NOTIFY = 100;

type Listener = () => void;

const globalForEvents = globalThis as typeof globalThis & {
  notificationListeners?: Map<string, Set<Listener>>;
  notificationListenPromise?: Promise<unknown>;
};

const listeners = (globalForEvents.notificationListeners ??= new Map<
  string,
  Set<Listener>
>());

function handlePayload(payload: string) {
  let userIds: unknown;

  try {
    userIds = JSON.parse(payload);
  } catch {
    return;
  }

  if (!Array.isArray(userIds)) {
    return;
  }

  for (const userId of userIds) {
    const forUser = listeners.get(String(userId));
    if (!forUser) {
      continue;
    }

    for (const listener of forUser) {
      // One listener must not be able to starve the others.
      try {
        listener();
      } catch {
        // The stream is already torn down; unsubscribe will clean it up.
      }
    }
  }
}

/**
 * postgres.js opens a dedicated connection for listeners (separate from the
 * `max: 10` query pool) and re-subscribes automatically when that connection
 * drops, which it does every `max_lifetime`. One channel serves every user;
 * fan-out to the right connection happens in-process.
 */
function ensureListening(): Promise<unknown> {
  globalForEvents.notificationListenPromise ??= getPostgresClient()
    .listen(CHANNEL, handlePayload)
    .catch((error: unknown) => {
      // Let the next subscriber retry rather than caching a rejected promise.
      globalForEvents.notificationListenPromise = undefined;
      throw error;
    });

  return globalForEvents.notificationListenPromise;
}

/**
 * Announces that rows were inserted for `userIds`, so any connected stream can
 * refetch. Never throws: a failed NOTIFY only costs immediacy, since the
 * client's fallback poll still picks the notification up.
 */
export async function publishNotificationCreated(
  userIds: string[],
): Promise<void> {
  const unique = [...new Set(userIds)];

  if (unique.length === 0) {
    return;
  }

  try {
    const client = getPostgresClient();

    for (let i = 0; i < unique.length; i += MAX_IDS_PER_NOTIFY) {
      const chunk = unique.slice(i, i + MAX_IDS_PER_NOTIFY);
      await client.notify(CHANNEL, JSON.stringify(chunk));
    }
  } catch (error) {
    console.error("[notifications] gagal mengirim NOTIFY", error);
  }
}

/** Resolves to an unsubscribe function. */
export async function subscribeToNotifications(
  userId: string,
  listener: Listener,
): Promise<() => void> {
  await ensureListening();

  const forUser = listeners.get(userId) ?? new Set<Listener>();
  forUser.add(listener);
  listeners.set(userId, forUser);

  return () => {
    forUser.delete(listener);
    if (forUser.size === 0) {
      listeners.delete(userId);
    }
  };
}
