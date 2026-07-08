"use server";

import { redirect } from "next/navigation";

import { loginUser } from "@/lib/application/auth/login-user";
import { logoutUser } from "@/lib/application/auth/logout-user";
import { registerUser } from "@/lib/application/auth/register-user";
import type { AuthErrorCode } from "@/lib/domain/auth/errors";
import { createSession } from "@/lib/infrastructure/auth/session-manager";

export type AuthActionState = {
  error?: AuthErrorCode;
  message?: string;
  success?: boolean;
};

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = await loginUser({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!result.success) {
    return { error: result.error, message: result.message };
  }

  await createSession(result.data.user);
  redirect(result.data.redirectTo);
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = await registerUser({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });

  if (!result.success) {
    return { error: result.error, message: result.message };
  }

  return { success: true, message: result.data.message };
}

export async function logoutAction(): Promise<void> {
  await logoutUser();
  redirect("/login");
}
