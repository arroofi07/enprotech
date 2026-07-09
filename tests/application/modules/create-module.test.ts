import { beforeEach, describe, expect, it, vi } from "vitest";

import { createModule } from "@/lib/application/modules/create-module";
import { uploadModuleFile } from "@/lib/application/modules/upload-module-file";
import type { SessionUser } from "@/lib/domain/auth/types";
import { ModuleErrorCode } from "@/lib/domain/modules/errors";
import * as moduleRepository from "@/lib/infrastructure/db/repositories/module-repository";
import * as blobStorage from "@/lib/infrastructure/storage/blob-storage";

const trainer: SessionUser = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "trainer@example.com",
  name: "Trainer",
  role: "trainer",
  status: "active",
};

const student: SessionUser = {
  ...trainer,
  id: "22222222-2222-4222-8222-222222222222",
  role: "student",
  email: "student@example.com",
  name: "Student",
};

const moduleRecord = {
  id: "44444444-4444-4444-8444-444444444444",
  trainingId: "33333333-3333-4333-8333-333333333333",
  title: "Modul 1",
  description: null,
  thumbnail: null,
  videoConferenceLink: null,
  minQuizScore: 0,
  minLatihanScore: 0,
  minAttendance: 0,
  order: 0,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

describe("createModule", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects unauthenticated actors", async () => {
    const result = await createModule(null, {
      trainingId: moduleRecord.trainingId,
      title: "Modul 1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(ModuleErrorCode.UNAUTHORIZED);
    }
  });

  it("rejects students", async () => {
    const result = await createModule(student, {
      trainingId: moduleRecord.trainingId,
      title: "Modul 1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(ModuleErrorCode.FORBIDDEN);
    }
  });

  it("creates module for trainer when training exists", async () => {
    vi.spyOn(moduleRepository, "findTrainingByIdForModule").mockResolvedValue({
      id: moduleRecord.trainingId,
      status: "active",
    });
    vi.spyOn(moduleRepository, "createModule").mockResolvedValue(moduleRecord);

    const result = await createModule(trainer, {
      trainingId: moduleRecord.trainingId,
      title: "Modul 1",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Modul 1");
    }
  });
});

describe("uploadModuleFile", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects invalid file type", async () => {
    const file = new File(["hello"], "test.txt", { type: "text/plain" });

    const result = await uploadModuleFile(trainer, { purpose: "document" }, file);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(ModuleErrorCode.INVALID_FILE_TYPE);
    }
  });

  it("rejects oversized thumbnail", async () => {
    const bytes = new Uint8Array(1 * 1024 * 1024 + 1);
    const file = new File([bytes], "thumb.png", { type: "image/png" });

    const result = await uploadModuleFile(trainer, { purpose: "thumbnail" }, file);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(ModuleErrorCode.FILE_TOO_LARGE);
    }
  });

  it("uploads valid document", async () => {
    vi.spyOn(blobStorage, "uploadFileToBlob").mockResolvedValue({
      url: "https://blob.example/doc.pdf",
      size: 1024,
    });

    const file = new File(["pdf"], "materi.pdf", {
      type: "application/pdf",
    });

    const result = await uploadModuleFile(trainer, { purpose: "document" }, file);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.url).toContain("blob.example");
    }
  });
});
