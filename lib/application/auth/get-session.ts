import type { SessionUser } from "@/lib/domain/auth/types";
import { findUserById } from "@/lib/infrastructure/db/repositories/user-repository";
import { getSession } from "@/lib/infrastructure/auth/session-manager";

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const user = await findUserById(session.id);

  if (!user || user.status !== "active") {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
  };
}
