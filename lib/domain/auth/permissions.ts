import type { UserRole } from "./types";

const ADMIN_PREFIX = "/admin";
const TRAINER_PREFIX = "/trainer";
const STUDENT_PREFIX = "/student";

export const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/unauthorized",
  "/verify",
] as const;

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )) {
    return true;
  }

  if (pathname.startsWith("/api/verify/")) {
    return true;
  }

  return false;
}

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "trainer":
      return "/trainer/dashboard";
    case "student":
      return "/student/dashboard";
  }
}

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  if (pathname.startsWith(ADMIN_PREFIX)) {
    return role === "admin";
  }

  if (pathname.startsWith(TRAINER_PREFIX)) {
    return role === "admin" || role === "trainer";
  }

  if (pathname.startsWith(STUDENT_PREFIX)) {
    return true;
  }

  return true;
}
