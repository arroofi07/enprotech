import { Badge } from "@/components/ui/badge";
import type { UserStatus } from "@/lib/domain/auth/types";

const STATUS_LABEL: Record<UserStatus, string> = {
  pending: "Pending",
  active: "Active",
  inactive: "Inactive",
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const variant =
    status === "active"
      ? "default"
      : status === "pending"
        ? "secondary"
        : "outline";

  return <Badge variant={variant}>{STATUS_LABEL[status]}</Badge>;
}
