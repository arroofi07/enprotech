import { getPostgresClient } from "@/lib/db";
import type { CommunityMessageDto } from "@/lib/domain/community/types";

const CHANNEL = "community_message_created";

type MessageListener = (message: CommunityMessageDto) => void;

const globalForEvents = globalThis as typeof globalThis & {
  communityMessageListeners?: Map<string, Set<MessageListener>>;
  communityListenPromise?: Promise<unknown>;
};

const listeners = (globalForEvents.communityMessageListeners ??= new Map<
  string,
  Set<MessageListener>
>());

function handlePayload(payload: string) {
  let parsed: unknown;

  try {
    parsed = JSON.parse(payload);
  } catch {
    return;
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("trainingId" in parsed) ||
    !("message" in parsed)
  ) {
    return;
  }

  const trainingId = String((parsed as { trainingId: unknown }).trainingId);
  const message = (parsed as { message: CommunityMessageDto }).message;
  const forRoom = listeners.get(trainingId);
  if (!forRoom) {
    return;
  }

  for (const listener of forRoom) {
    try {
      listener(message);
    } catch {
      // Listener already gone; unsubscribe cleans up.
    }
  }
}

function ensureListening(): Promise<unknown> {
  globalForEvents.communityListenPromise ??= getPostgresClient()
    .listen(CHANNEL, handlePayload)
    .catch((error: unknown) => {
      globalForEvents.communityListenPromise = undefined;
      throw error;
    });

  return globalForEvents.communityListenPromise;
}

export async function publishCommunityMessage(
  message: CommunityMessageDto,
): Promise<void> {
  try {
    const client = getPostgresClient();
    await client.notify(
      CHANNEL,
      JSON.stringify({ trainingId: message.trainingId, message }),
    );
  } catch (error) {
    console.error("[community] gagal mengirim NOTIFY", error);
  }
}

export async function subscribeToCommunityMessages(
  trainingId: string,
  listener: MessageListener,
): Promise<() => void> {
  await ensureListening();

  const forRoom = listeners.get(trainingId) ?? new Set<MessageListener>();
  forRoom.add(listener);
  listeners.set(trainingId, forRoom);

  return () => {
    forRoom.delete(listener);
    if (forRoom.size === 0) {
      listeners.delete(trainingId);
    }
  };
}
