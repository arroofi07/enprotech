import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { UserActions } from "@/components/users/user-actions";
import { UserStatusBadge } from "@/components/users/user-status-badge";
import { ROLE_LABELS } from "@/lib/domain/auth/role-labels";
import { formatUserDisplayName } from "@/lib/domain/users/format-display-name";
import type { PublicUserRecord } from "@/lib/infrastructure/db/repositories/user-repository";

type UsersTableProps = {
  users: PublicUserRecord[];
  currentUserId: string;
};

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  return (
    <DataTable
      data={users}
      getRowKey={(user) => user.id}
      emptyState={{
        message: "Tidak ada pengguna yang cocok dengan filter.",
      }}
      columns={[
        {
          id: "name",
          header: "Nama",
          cell: (user) => (
            <span className="font-medium">{formatUserDisplayName(user)}</span>
          ),
        },
        {
          id: "email",
          header: "Email",
          cell: (user) => user.email,
        },
        {
          id: "role",
          header: "Role",
          cell: (user) => (
            <Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge>
          ),
        },
        {
          id: "status",
          header: "Status",
          cell: (user) => <UserStatusBadge status={user.status} />,
        },
        {
          id: "actions",
          header: "Aksi",
          headerClassName: "text-right",
          className: "text-right",
          cell: (user) => (
            <UserActions user={user} currentUserId={currentUserId} />
          ),
        },
      ]}
    />
  );
}
