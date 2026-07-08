import type { SessionUser } from "@/lib/domain/auth/types";
import { getSession } from "@/lib/infrastructure/auth/session-manager";

export async function getCurrentUser(): Promise<SessionUser | null> {
  return getSession();
}
