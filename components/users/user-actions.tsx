"use client";

import { useActionState, useState } from "react";

import {
  approveUserAction,
  setUserStatusAction,
  updateUserRoleAction,
  type UserActionState,
} from "@/app/actions/users";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useActionToast } from "@/hooks/use-action-toast";
import { formatUserDisplayName } from "@/lib/domain/users/format-display-name";
import type { PublicUserRecord } from "@/lib/infrastructure/db/repositories/user-repository";

const initialState: UserActionState = {};

type UserActionsProps = {
  user: PublicUserRecord;
  currentUserId: string;
};

export function UserActions({ user, currentUserId }: UserActionsProps) {
  const isSelf = user.id === currentUserId;
  const [approveState, approveAction, approvePending] = useActionState(
    approveUserAction,
    initialState,
  );
  const [roleState, roleAction, rolePending] = useActionState(
    updateUserRoleAction,
    initialState,
  );
  const [statusState, statusAction, statusPending] = useActionState(
    setUserStatusAction,
    initialState,
  );
  const [roleOpen, setRoleOpen] = useState(false);

  useActionToast(approveState);
  useActionToast(roleState);
  useActionToast(statusState);

  // Close controlled dialog once role update succeeds (page will also revalidate).
  const effectiveRoleOpen = roleState.success ? false : roleOpen;

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-1">
        <Dialog>
          <DialogTrigger render={<Button variant="outline" size="xs" />}>
            Detail
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Detail pengguna</DialogTitle>
              <DialogDescription>
                Informasi akun {formatUserDisplayName(user)}.
              </DialogDescription>
            </DialogHeader>
            <dl className="grid gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Nama</dt>
                <dd className="font-medium">{formatUserDisplayName(user)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Role</dt>
                <dd className="capitalize">{user.role}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="capitalize">{user.status}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Dibuat</dt>
                <dd>
                  {new Date(user.createdAt).toLocaleString("id-ID")}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Diperbarui</dt>
                <dd>
                  {new Date(user.updatedAt).toLocaleString("id-ID")}
                </dd>
              </div>
            </dl>
          </DialogContent>
        </Dialog>

        {user.status === "pending" && !isSelf ? (
          <form action={approveAction}>
            <input type="hidden" name="userId" value={user.id} />
            <Button type="submit" size="xs" disabled={approvePending}>
              Approve
            </Button>
          </form>
        ) : null}

        {!isSelf ? (
          <Dialog open={effectiveRoleOpen} onOpenChange={setRoleOpen}>
            <DialogTrigger render={<Button variant="outline" size="xs" />}>
              Role
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Ubah role</DialogTitle>
                <DialogDescription>
                  Pilih role baru untuk {formatUserDisplayName(user)}.
                </DialogDescription>
              </DialogHeader>
              <form action={roleAction} className="space-y-3">
                <input type="hidden" name="userId" value={user.id} />
                <select
                  name="role"
                  defaultValue={user.role}
                  className="flex h-8 w-full rounded-md border border-input bg-input/20 px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  <option value="admin">Admin</option>
                  <option value="trainer">Trainer</option>
                  <option value="student">Student</option>
                </select>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setRoleOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={rolePending}>
                    Simpan
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        ) : null}

        {user.status === "active" && !isSelf ? (
          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="destructive" size="xs" />}
            >
              Nonaktifkan
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Nonaktifkan pengguna?</AlertDialogTitle>
                <AlertDialogDescription>
                  {formatUserDisplayName(user)} tidak akan bisa login setelah
                  dinonaktifkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <form action={statusAction}>
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="status" value="inactive" />
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={statusPending}
                  >
                    Nonaktifkan
                  </Button>
                </form>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}

        {user.status === "inactive" && !isSelf ? (
          <form action={statusAction}>
            <input type="hidden" name="userId" value={user.id} />
            <input type="hidden" name="status" value="active" />
            <Button type="submit" size="xs" disabled={statusPending}>
              Aktifkan
            </Button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
