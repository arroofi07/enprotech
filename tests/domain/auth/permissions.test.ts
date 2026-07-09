import { describe, expect, it } from "vitest";

import {
  canAccessRoute,
  getDashboardPath,
  isPublicPath,
} from "@/lib/domain/auth/permissions";

describe("permissions", () => {
  it("identifies public paths", () => {
    expect(isPublicPath("/login")).toBe(true);
    expect(isPublicPath("/register")).toBe(true);
    expect(isPublicPath("/verify")).toBe(true);
    expect(isPublicPath("/verify/CERT-ABC-2026-0001")).toBe(true);
    expect(isPublicPath("/api/verify/CERT-ABC-2026-0001")).toBe(true);
    expect(isPublicPath("/admin/dashboard")).toBe(false);
  });

  it("returns dashboard path by role", () => {
    expect(getDashboardPath("admin")).toBe("/admin/dashboard");
    expect(getDashboardPath("trainer")).toBe("/trainer/dashboard");
    expect(getDashboardPath("student")).toBe("/student/dashboard");
  });

  it("restricts admin routes to admin only", () => {
    expect(canAccessRoute("admin", "/admin/users")).toBe(true);
    expect(canAccessRoute("trainer", "/admin/users")).toBe(false);
    expect(canAccessRoute("student", "/admin/users")).toBe(false);
  });

  it("allows admin and trainer on trainer routes", () => {
    expect(canAccessRoute("admin", "/trainer/dashboard")).toBe(true);
    expect(canAccessRoute("trainer", "/trainer/dashboard")).toBe(true);
    expect(canAccessRoute("student", "/trainer/dashboard")).toBe(false);
  });

  it("allows all authenticated roles on student routes", () => {
    expect(canAccessRoute("admin", "/student/dashboard")).toBe(true);
    expect(canAccessRoute("trainer", "/student/dashboard")).toBe(true);
    expect(canAccessRoute("student", "/student/dashboard")).toBe(true);
  });
});
