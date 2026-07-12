import { describe, expect, it } from "vitest";

import {
  getDashboardNav,
  isNavItemActive,
} from "@/lib/navigation/dashboard-nav";
import type { SessionUser } from "@/lib/domain/auth/types";

const LEARNING_FLOW_TITLES = [
  "Pre Test",
  "Modul",
  "Video Conference",
  "Quiz",
  "Latihan",
  "Post Test",
  "Nilai",
  "Sertifikat",
] as const;

const admin: SessionUser = {
  id: "1",
  email: "admin@test.com",
  name: "Admin",
  role: "admin",
  status: "active",
};

const trainer: SessionUser = {
  ...admin,
  id: "2",
  role: "trainer",
  email: "trainer@test.com",
  name: "Trainer",
};

const student: SessionUser = {
  ...admin,
  id: "3",
  role: "student",
  email: "student@test.com",
  name: "Student",
};

describe("getDashboardNav", () => {
  it("returns admin navigation with administration and learning flow", () => {
    const nav = getDashboardNav(admin);
    const titles = nav.groups.flatMap((group) =>
      group.items.map((item) => item.title),
    );

    expect(titles).toEqual([
      "Dashboard",
      "Pengguna",
      "Buat Training",
      ...LEARNING_FLOW_TITLES,
    ]);
  });

  it("returns trainer navigation with administration and learning flow", () => {
    const nav = getDashboardNav(trainer);
    const titles = nav.groups.flatMap((group) =>
      group.items.map((item) => item.title),
    );

    expect(titles).toEqual([
      "Dashboard",
      "Buat Training",
      ...LEARNING_FLOW_TITLES,
    ]);
  });

  it("returns student navigation with administration and learning flow", () => {
    const nav = getDashboardNav(student);
    const titles = nav.groups.flatMap((group) =>
      group.items.map((item) => item.title),
    );

    expect(titles).toEqual([
      "Dashboard",
      "Training Saya",
      ...LEARNING_FLOW_TITLES,
    ]);
    expect(nav.homeHref).toBe("/student/dashboard");
  });
});

describe("isNavItemActive", () => {
  it("matches nested training routes for modul", () => {
    expect(
      isNavItemActive("/student/trainings/abc/modules/xyz", {
        href: "/student/modules",
        isActive: (pathname) =>
          pathname === "/student/modules" ||
          pathname.startsWith("/student/modules/") ||
          /^\/student\/trainings\/[^/]+\/modules(?:\/|$)/.test(pathname),
      }),
    ).toBe(true);
  });

  it("highlights training overview on detail page", () => {
    expect(
      isNavItemActive("/student/trainings/abc", {
        href: "/student/trainings",
        isActive: (pathname) =>
          pathname === "/student/trainings" ||
          /^\/student\/trainings\/[^/]+$/.test(pathname),
      }),
    ).toBe(true);
  });

  it("does not highlight modul on training overview page", () => {
    expect(
      isNavItemActive("/student/trainings/abc", {
        href: "/student/modules",
        isActive: (pathname) =>
          pathname === "/student/modules" ||
          pathname.startsWith("/student/modules/") ||
          /^\/student\/trainings\/[^/]+\/modules(?:\/|$)/.test(pathname),
      }),
    ).toBe(false);
  });

  it("matches nested trainer module routes", () => {
    expect(
      isNavItemActive("/trainer/trainings/abc/modules", {
        href: "/trainer/modules",
        activePrefixes: ["/trainer/modules", "/trainer/trainings"],
      }),
    ).toBe(true);
  });
});
