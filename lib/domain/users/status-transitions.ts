import type { UserStatus } from "@/lib/domain/auth/types";
import { UserErrorCode } from "@/lib/domain/users/errors";

export type StatusTransitionAction = "approve" | "deactivate" | "reactivate";

const ALLOWED_TRANSITIONS: Record<
  StatusTransitionAction,
  { from: UserStatus; to: UserStatus }
> = {
  approve: { from: "pending", to: "active" },
  deactivate: { from: "active", to: "inactive" },
  reactivate: { from: "inactive", to: "active" },
};

export function resolveStatusTransition(
  action: StatusTransitionAction,
  currentStatus: UserStatus,
): { success: true; nextStatus: UserStatus } | { success: false; error: typeof UserErrorCode.INVALID_STATUS_TRANSITION } {
  const rule = ALLOWED_TRANSITIONS[action];

  if (currentStatus !== rule.from) {
    return { success: false, error: UserErrorCode.INVALID_STATUS_TRANSITION };
  }

  return { success: true, nextStatus: rule.to };
}

export function resolveSetStatusTransition(
  currentStatus: UserStatus,
  targetStatus: Extract<UserStatus, "active" | "inactive">,
): { success: true; nextStatus: UserStatus } | { success: false; error: typeof UserErrorCode.INVALID_STATUS_TRANSITION } {
  if (targetStatus === "inactive") {
    return resolveStatusTransition("deactivate", currentStatus);
  }

  return resolveStatusTransition("reactivate", currentStatus);
}
