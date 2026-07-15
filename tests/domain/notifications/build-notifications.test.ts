import { describe, expect, it } from "vitest";

import {
  buildAccountApprovedNotification,
  buildAccountDeactivatedNotification,
  buildCertificateIssuedNotification,
  buildDeadlineReminderNotification,
  buildDeadlineReminderDedupKey,
  buildEnrolledNotification,
  buildFeedbackSubmittedNotification,
  buildModuleCompletedDedupKey,
  buildModuleCompletedNotification,
  buildNewRegistrationNotification,
  buildPostTestResultNotification,
  buildPostTestResultStaffNotification,
  buildProjectSubmittedNotification,
  buildRoleChangedNotification,
  buildStudentCertificateIssuedNotification,
  buildTrainingPublishedNotification,
  buildVideoConferenceScheduledNotification,
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

describe("Tier 1 notification builders", () => {
  it("builds enrolled notification for the student", () => {
    const n = buildEnrolledNotification({
      trainingId: "t-1",
      trainingName: "Safety Training",
    });
    expect(n.type).toBe("enrolled");
    expect(n.message).toContain("Safety Training");
    expect(n.data.href).toBe("/student/trainings/t-1");
  });

  it("builds new registration notification for admins", () => {
    const n = buildNewRegistrationNotification({
      userName: "Budi",
      email: "budi@example.com",
    });
    expect(n.type).toBe("new_registration");
    expect(n.message).toContain("Budi");
    expect(n.message).toContain("budi@example.com");
    expect(n.data.href).toBe("/admin/users?status=pending");
  });

  it("builds account approved notification", () => {
    const n = buildAccountApprovedNotification();
    expect(n.type).toBe("account_approved");
    expect(n.data.href).toBe("/student/dashboard");
  });

  it("builds certificate issued notification with dedup key", () => {
    const n = buildCertificateIssuedNotification({
      studentId: "s-1",
      trainingId: "t-1",
      trainingName: "Safety Training",
      certificateId: "cert-1",
    });
    expect(n.type).toBe("certificate_issued");
    expect(n.message).toContain("Safety Training");
    expect(n.data.href).toBe("/student/trainings/t-1");
    expect(n.data.dedupKey).toBe("certificate_issued:t-1:s-1");
  });

  it("builds staff certificate notification with dedup key", () => {
    const n = buildStudentCertificateIssuedNotification({
      studentId: "s-1",
      studentName: "Budi",
      trainingId: "t-1",
      trainingName: "Safety Training",
    });
    expect(n.type).toBe("student_certificate_issued");
    expect(n.message).toContain("Budi");
    expect(n.data.href).toBe("/trainer/trainings/t-1/modules");
    expect(n.data.dedupKey).toBe("student_certificate_issued:t-1:s-1");
  });

  it("builds project submitted notification for staff", () => {
    const n = buildProjectSubmittedNotification({
      studentId: "s-1",
      studentName: "Budi",
      trainingId: "t-1",
      trainingName: "Safety Training",
    });
    expect(n.type).toBe("project_submitted");
    expect(n.message).toContain("Budi");
    expect(n.data.href).toBe("/trainer/projects?trainingId=t-1");
    expect(n.data.dedupKey).toBeUndefined();
  });

  it("builds feedback submitted notification for staff", () => {
    const n = buildFeedbackSubmittedNotification({
      studentId: "s-1",
      studentName: "Budi",
      trainingId: "t-1",
      trainingName: "Safety Training",
    });
    expect(n.type).toBe("feedback_submitted");
    expect(n.message).toContain("Budi");
    expect(n.data.href).toBe("/trainer/feedback?trainingId=t-1");
    expect(n.data.dedupKey).toBeUndefined();
  });
});

describe("Tier 2 notification builders", () => {
  it("builds post-test result (passed) for student", () => {
    const n = buildPostTestResultNotification({
      attemptId: "a-1",
      trainingId: "t-1",
      trainingName: "Safety Training",
      score: 90,
      passingGrade: 70,
      passed: true,
    });
    expect(n.type).toBe("post_test_result");
    expect(n.title).toBe("Post-test lulus");
    expect(n.message).toContain("90");
    expect(n.data.dedupKey).toBe("post_test_result:a-1");
  });

  it("builds post-test result (failed) with passing grade", () => {
    const n = buildPostTestResultNotification({
      attemptId: "a-2",
      trainingId: "t-1",
      trainingName: "Safety Training",
      score: 50,
      passingGrade: 70,
      passed: false,
    });
    expect(n.title).toBe("Post-test belum lulus");
    expect(n.message).toContain("50");
    expect(n.message).toContain("70");
  });

  it("builds staff post-test result with dedup key", () => {
    const n = buildPostTestResultStaffNotification({
      attemptId: "a-1",
      studentId: "s-1",
      studentName: "Budi",
      trainingId: "t-1",
      trainingName: "Safety Training",
      score: 90,
      passed: true,
    });
    expect(n.type).toBe("post_test_result_staff");
    expect(n.message).toContain("Budi");
    expect(n.message).toContain("lulus");
    expect(n.data.dedupKey).toBe("post_test_result_staff:a-1");
  });

  it("builds training published notification with dedup key", () => {
    const n = buildTrainingPublishedNotification({
      trainingId: "t-1",
      trainingName: "Safety Training",
    });
    expect(n.type).toBe("training_published");
    expect(n.data.href).toBe("/student/trainings/t-1");
    expect(n.data.dedupKey).toBe("training_published:t-1");
  });

  it("builds video conference scheduled notification with dedup key", () => {
    const n = buildVideoConferenceScheduledNotification({
      trainingId: "t-1",
      moduleId: "m-1",
      moduleName: "Modul A",
      scheduledAt: "2026-07-20T02:00:00.000Z",
      scheduledLabel: "Senin, 20 Juli 2026",
    });
    expect(n.type).toBe("video_conference_scheduled");
    expect(n.message).toContain("Modul A");
    expect(n.message).toContain("Senin, 20 Juli 2026");
    expect(n.data.dedupKey).toBe(
      "vc_scheduled:m-1:2026-07-20T02:00:00.000Z",
    );
  });
});

describe("Tier 3 notification builders", () => {
  it("builds role changed notification routed to new role", () => {
    const n = buildRoleChangedNotification({ role: "trainer" });
    expect(n.type).toBe("role_changed");
    expect(n.message).toContain("Trainer");
    expect(n.data.href).toBe("/trainer/dashboard");
    expect(n.data.dedupKey).toBeUndefined();
  });

  it("builds account deactivated notification", () => {
    const n = buildAccountDeactivatedNotification();
    expect(n.type).toBe("account_deactivated");
    expect(n.data.href).toBe("/login");
  });
});
