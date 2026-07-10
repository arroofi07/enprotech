import { describe, expect, it } from "vitest";

import {
  buildDeadlineReminderNotification,
  buildDeadlineReminderDedupKey,
  buildModuleCompletedDedupKey,
  buildModuleCompletedNotification,
  getCalendarDaysUntilDeadline,
  getDeadlineReminderDays,
} from "@/lib/domain/notifications/build-notifications";

describe("buildModuleCompletedNotification", () => {
  it("includes student, module, and training details", () => {
    const notification = buildModuleCompletedNotification({
      studentId: "student-1",
      studentName: "Budi",
      moduleId: "module-1",
      moduleName: "Modul A",
      trainingId: "training-1",
      trainingName: "Safety Training",
    });

    expect(notification.type).toBe("module_completed");
    expect(notification.message).toContain("Budi");
    expect(notification.message).toContain("Modul A");
    expect(notification.message).toContain("Safety Training");
    expect(notification.data.href).toBe("/trainer/trainings/training-1/modules");
    expect(buildModuleCompletedDedupKey({
      studentId: "student-1",
      moduleId: "module-1",
    })).toBe(notification.data.dedupKey);
  });
});

describe("buildDeadlineReminderNotification", () => {
  it("builds H-3 reminder message", () => {
    const notification = buildDeadlineReminderNotification({
      trainingId: "training-1",
      trainingName: "Safety Training",
      deadline: "2026-07-12",
      reminderDay: 3,
    });

    expect(notification.title).toContain("H-3");
    expect(notification.message).toContain("Safety Training");
    expect(notification.data.href).toBe("/student/trainings/training-1");
    expect(buildDeadlineReminderDedupKey({
      trainingId: "training-1",
      reminderDay: 3,
    })).toBe(notification.data.dedupKey);
  });
});

describe("getDeadlineReminderDays", () => {
  it("returns H-3 and H-1 only on matching days", () => {
    expect(
      getDeadlineReminderDays("2026-07-12", new Date(2026, 6, 9)),
    ).toEqual([3]);
    expect(
      getDeadlineReminderDays("2026-07-12", new Date(2026, 6, 11)),
    ).toEqual([1]);
    expect(
      getDeadlineReminderDays("2026-07-12", new Date(2026, 6, 10)),
    ).toEqual([]);
  });
});

describe("getCalendarDaysUntilDeadline", () => {
  it("calculates calendar day difference", () => {
    expect(
      getCalendarDaysUntilDeadline("2026-07-12", new Date(2026, 6, 9)),
    ).toBe(3);
  });
});
