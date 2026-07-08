"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { approveUser } from "@/lib/application/users/approve-user";
import { setUserStatus } from "@/lib/application/users/set-user-status";
import { updateUserRole } from "@/lib/application/users/update-user-role";
import type { UserErrorCode } from "@/lib/domain/users/errors";
import { UserErrorCode as Codes, userFailure } from "@/lib/domain/users/errors";

export type UserActionState = {
  error?: UserErrorCode;
  message?: string;
  success?: boolean;
};

function failureState(error: UserErrorCode): UserActionState {
  const failure = userFailure(error);
  return { error: failure.error, message: failure.message, success: false };
}

export async function approveUserAction(
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const actor = await getCurrentUser();
  const result = await approveUser(actor, {
    userId: String(formData.get("userId") ?? ""),
  });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  revalidatePath("/admin/users");
  return { success: true, message: "Pengguna berhasil disetujui." };
}

export async function updateUserRoleAction(
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const actor = await getCurrentUser();
  const result = await updateUserRole(actor, {
    userId: String(formData.get("userId") ?? ""),
    role: String(formData.get("role") ?? "") as "admin" | "trainer" | "student",
  });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  revalidatePath("/admin/users");
  return { success: true, message: "Role pengguna berhasil diubah." };
}

export async function setUserStatusAction(
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const actor = await getCurrentUser();
  const status = String(formData.get("status") ?? "");

  if (status !== "active" && status !== "inactive") {
    return failureState(Codes.VALIDATION_ERROR);
  }

  const result = await setUserStatus(actor, {
    userId: String(formData.get("userId") ?? ""),
    status,
  });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  revalidatePath("/admin/users");
  return {
    success: true,
    message:
      status === "inactive"
        ? "Pengguna berhasil dinonaktifkan."
        : "Pengguna berhasil diaktifkan kembali.",
  };
}
