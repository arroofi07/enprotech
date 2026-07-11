import { cache } from "react";

import type { SessionUser } from "@/lib/domain/auth/types";
import { isDatabaseConnectionError } from "@/lib/infrastructure/db/errors";
import { findUserById } from "@/lib/infrastructure/db/repositories/user-repository";
import { getSession } from "@/lib/infrastructure/auth/session-manager";

async function resolveCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();

  if (!session) {
    return null;
  }

  try {
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
  } catch (error) {
    if (isDatabaseConnectionError(error) && session.status === "active") {
      return session;
    }

    throw error;
  }
}

export const getCurrentUser = cache(resolveCurrentUser);
