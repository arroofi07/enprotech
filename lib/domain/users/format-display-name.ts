import type { UserStatus } from "@/lib/domain/auth/types";

export function formatUserDisplayName(user: {
  name: string;
  status: UserStatus;
}): string {
  if (user.status === "inactive") {
    return `${user.name} (nonaktif)`;
  }

  return user.name;
}
