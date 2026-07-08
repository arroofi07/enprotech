import type { SessionUser } from "@/lib/domain/auth/types";
import {
  UserErrorCode,
  userFailure,
  userSuccess,
  type UserResult,
} from "@/lib/domain/users/errors";
import {
  listUsers as listUsersFromRepo,
  type PublicUserRecord,
} from "@/lib/infrastructure/db/repositories/user-repository";
import { listUsersQuerySchema } from "@/lib/validations/user-schemas";

import { assertAdmin } from "./assert-admin";

export type ListUsersResult = {
  items: PublicUserRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listUsers(
  actor: SessionUser | null,
  input: unknown,
): Promise<UserResult<ListUsersResult>> {
  const forbidden = assertAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = listUsersQuerySchema.safeParse(input);
  if (!parsed.success) {
    return userFailure(UserErrorCode.VALIDATION_ERROR);
  }

  const { page, pageSize, role, status, search } = parsed.data;
  const result = await listUsersFromRepo({
    page,
    pageSize,
    role,
    status,
    search,
  });

  return userSuccess({
    items: result.items,
    total: result.total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(result.total / pageSize)),
  });
}
