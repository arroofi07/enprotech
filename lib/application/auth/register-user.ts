import {
  AuthErrorCode,
  authFailure,
  authSuccess,
  type AuthResult,
} from "@/lib/domain/auth/errors";
import { hashPassword } from "@/lib/infrastructure/auth/password-hasher";
import {
  createUser,
  findUserByEmail,
} from "@/lib/infrastructure/db/repositories/user-repository";
import {
  registerSchema,
  type RegisterInput,
} from "@/lib/validations/auth-schemas";

export type RegisterUserResult = {
  message: string;
};

export async function registerUser(
  input: RegisterInput,
): Promise<AuthResult<RegisterUserResult>> {
  const parsed = registerSchema.safeParse(input);

  if (!parsed.success) {
    return authFailure(AuthErrorCode.VALIDATION_ERROR);
  }

  const existingUser = await findUserByEmail(parsed.data.email);

  if (existingUser) {
    return authFailure(AuthErrorCode.EMAIL_EXISTS);
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await createUser({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
    role: "student",
    status: "pending",
  });

  return authSuccess({
    message:
      "Pendaftaran berhasil. Akun Anda menunggu persetujuan Admin sebelum dapat login.",
  });
}
