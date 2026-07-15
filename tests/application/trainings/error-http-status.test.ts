import { describe, expect, it } from "vitest";

import { trainingErrorHttpStatus } from "@/lib/application/trainings/error-http-status";
import { TrainingErrorCode } from "@/lib/domain/trainings/errors";

describe("trainingErrorHttpStatus", () => {
  it("maps auth errors", () => {
    expect(trainingErrorHttpStatus(TrainingErrorCode.UNAUTHORIZED)).toBe(401);
    expect(trainingErrorHttpStatus(TrainingErrorCode.FORBIDDEN)).toBe(403);
  });

  it("maps not found errors", () => {
    expect(trainingErrorHttpStatus(TrainingErrorCode.TRAINING_NOT_FOUND)).toBe(
      404,
    );
    expect(trainingErrorHttpStatus(TrainingErrorCode.ENROLLMENT_NOT_FOUND)).toBe(
      404,
    );
  });

  it("maps conflict errors", () => {
    expect(
      trainingErrorHttpStatus(TrainingErrorCode.INVALID_STATUS_TRANSITION),
    ).toBe(409);
    expect(trainingErrorHttpStatus(TrainingErrorCode.ALREADY_ENROLLED)).toBe(
      409,
    );
    expect(trainingErrorHttpStatus(TrainingErrorCode.MODULES_NOT_READY)).toBe(
      409,
    );
    expect(trainingErrorHttpStatus(TrainingErrorCode.TRAINING_NOT_READY)).toBe(
      409,
    );
  });
});
