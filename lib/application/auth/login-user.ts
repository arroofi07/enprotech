import {
  AuthErrorCode,
  authFailure,
  authSuccess,
  type AuthResult,
} from "@/lib/domain/auth/errors";
import { getDashboardPath } from "@/lib/domain/auth/permissions";
import type { SessionUser } from "@/lib/domain/auth/types";
import { verifyPassword } from "@/lib/infrastructure/auth/password-hasher";
import {
  findUserByEmail,
  type UserRecord,
} from "@/lib/infrastructure/db/repositories/user-repository";
import { loginSchema, type LoginInput } from "@/lib/validations/auth-schemas";

function toSessionUser(user: UserRecord): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
  };
}

export type LoginUserResult = {
  user: SessionUser;
  redirectTo: string;
};

export async function loginUser(
  input: LoginInput,
): Promise<AuthResult<LoginUserResult>> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return authFailure(AuthErrorCode.VALIDATION_ERROR);
  }

  const user = await findUserByEmail(parsed.data.email);

  if (!user) {
    return authFailure(AuthErrorCode.INVALID_CREDENTIALS);
  }

  const isValidPassword = await verifyPassword(
    parsed.data.password,
    user.passwordHash,
  );

  if (!isValidPassword) {
    return authFailure(AuthErrorCode.INVALID_CREDENTIALS);
  }

  if (user.status === "pending") {
    return authFailure(AuthErrorCode.PENDING_APPROVAL);
  }

  if (user.status === "inactive") {
    return authFailure(AuthErrorCode.ACCOUNT_INACTIVE);
  }

  const sessionUser = toSessionUser(user);

  return authSuccess({
    user: sessionUser,
    redirectTo: getDashboardPath(sessionUser.role),
  });
}
