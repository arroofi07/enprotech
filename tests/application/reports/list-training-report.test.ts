import { describe, expect, it, vi } from "vitest";

import { listTrainingReport } from "@/lib/application/reports/list-training-report";
import type { SessionUser } from "@/lib/domain/auth/types";

vi.mock("@/lib/infrastructure/db/repositories/report-repository", () => ({
  listTrainingReportRows: vi.fn(async () => ({
    items: [
      {
        rowKey: "s1:m1",
        studentId: "s1",
        studentName: "Ani",
        studentEmail: "ani@example.com",
        trainingId: "t1",
        trainingTitle: "Training A",
        moduleId: "m1",
        moduleTitle: "Modul 1",
        moduleOrder: 1,
        quizScore: 80,
        latihanScore: 75,
        moduleStatus: "completed",
        enrollmentStatus: "completed",
        enrolledAt: "2026-01-01T00:00:00.000Z",
        completedAt: "2026-01-02T00:00:00.000Z",
      },
    ],
    total: 1,
  })),
}));

const trainer: SessionUser = {
  id: "trainer-1",
  email: "trainer@test.com",
  name: "Trainer",
  role: "trainer",
  status: "active",
};

describe("listTrainingReport", () => {
  it("rejects unauthenticated users", async () => {
    const result = await listTrainingReport(null, {});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("UNAUTHORIZED");
    }
  });

  it("rejects students", async () => {
    const result = await listTrainingReport(
      { ...trainer, role: "student" },
      {},
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("FORBIDDEN");
    }
  });

  it("returns paginated report rows for trainer", async () => {
    const result = await listTrainingReport(trainer, { page: 1, pageSize: 10 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(1);
      expect(result.data.totalPages).toBe(1);
    }
  });
});
