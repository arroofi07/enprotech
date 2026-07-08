import { destroySession } from "@/lib/infrastructure/auth/session-manager";

export async function logoutUser(): Promise<void> {
  await destroySession();
}
