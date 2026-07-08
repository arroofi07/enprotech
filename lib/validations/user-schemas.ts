import { z } from "zod";

const userRoleSchema = z.enum(["admin", "trainer", "student"]);
const userStatusSchema = z.enum(["pending", "active", "inactive"]);
const settableStatusSchema = z.enum(["active", "inactive"]);

function emptyToUndefined(value: unknown): unknown {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}

export const listUsersQuerySchema = z.object({
  search: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  role: z.preprocess(emptyToUndefined, userRoleSchema.optional()),
  status: z.preprocess(emptyToUndefined, userStatusSchema.optional()),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export const approveUserSchema = z.object({
  userId: z.uuid("ID pengguna tidak valid."),
});

export const updateUserRoleSchema = z.object({
  userId: z.uuid("ID pengguna tidak valid."),
  role: userRoleSchema,
});

export const setUserStatusSchema = z.object({
  userId: z.uuid("ID pengguna tidak valid."),
  status: settableStatusSchema,
});

export const getUserSchema = z.object({
  userId: z.uuid("ID pengguna tidak valid."),
});

export type ListUsersQueryInput = z.infer<typeof listUsersQuerySchema>;
export type ApproveUserInput = z.infer<typeof approveUserSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type SetUserStatusInput = z.infer<typeof setUserStatusSchema>;
export type GetUserInput = z.infer<typeof getUserSchema>;
