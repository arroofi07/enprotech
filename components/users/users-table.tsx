import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserActions } from "@/components/users/user-actions";
import { UserStatusBadge } from "@/components/users/user-status-badge";
import { formatUserDisplayName } from "@/lib/domain/users/format-display-name";
import type { PublicUserRecord } from "@/lib/infrastructure/db/repositories/user-repository";

type UsersTableProps = {
  users: PublicUserRecord[];
  currentUserId: string;
};

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Tidak ada pengguna yang cocok dengan filter.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">
              {formatUserDisplayName(user)}
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge variant="secondary" className="capitalize">
                {user.role}
              </Badge>
            </TableCell>
            <TableCell>
              <UserStatusBadge status={user.status} />
            </TableCell>
            <TableCell className="text-right">
              <UserActions user={user} currentUserId={currentUserId} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
