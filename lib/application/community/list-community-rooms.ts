import type { SessionUser } from "@/lib/domain/auth/types";
import {
  communitySuccess,
  type CommunityResult,
} from "@/lib/domain/community/errors";
import type { CommunityRoomDto } from "@/lib/domain/community/types";
import { listCommunityRoomsByStudent } from "@/lib/infrastructure/db/repositories/community-repository";

import { assertCommunityStudent } from "./assert-community-access";

export async function listCommunityRooms(
  actor: SessionUser | null,
): Promise<CommunityResult<CommunityRoomDto[]>> {
  const denied = assertCommunityStudent(actor);
  if (denied) {
    return denied;
  }

  const rooms = await listCommunityRoomsByStudent(actor!.id);
  return communitySuccess(rooms);
}
