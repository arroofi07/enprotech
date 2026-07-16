import type { UserRole } from "./types";

/**
 * How each role is named in the interface. The `student` role is stored and
 * routed under that name, but is always shown to users as "Peserta" — never
 * render a raw role value.
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  trainer: "Trainer",
  student: "Peserta",
};
