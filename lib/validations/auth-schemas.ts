import { z } from "zod";

import { PASSWORD_MIN_LENGTH } from "@/lib/domain/auth/password-policy";

export const loginSchema = z.object({
  email: z.email("Email tidak valid."),
  password: z.string().min(1, "Password wajib diisi."),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter."),
    email: z.email("Email tidak valid."),
    password: z
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        `Password minimal ${PASSWORD_MIN_LENGTH} karakter.`,
      ),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
