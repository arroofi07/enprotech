import { describe, expect, it } from "vitest";

import { TrainingErrorCode } from "@/lib/domain/trainings/errors";
import {
  isStudentVisibleTrainingStatus,
  resolveDirectStatusChange,
  resolveTrainingStatusTransition,
} from "@/lib/domain/trainings/status-transitions";

describe("resolveTrainingStatusTransition", () => {
  it("publishes draft trainings", () => {
    expect(resolveTrainingStatusTransition("publish", "draft")).toEqual({
      success: true,
      nextStatus: "active",
    });
  });

  it("rejects publish for non-draft trainings", () => {
    expect(resolveTrainingStatusTransition("publish", "active")).toEqual({
      success: false,
      error: TrainingErrorCode.INVALID_STATUS_TRANSITION,
    });
  });

  it("completes active trainings", () => {
    expect(resolveTrainingStatusTransition("complete", "active")).toEqual({
      success: true,
      nextStatus: "completed",
    });
  });

  it("archives draft, active, and completed trainings", () => {
    expect(resolveTrainingStatusTransition("archive", "draft")).toEqual({
      success: true,
      nextStatus: "archived",
    });
    expect(resolveTrainingStatusTransition("archive", "active")).toEqual({
      success: true,
      nextStatus: "archived",
    });
    expect(resolveTrainingStatusTransition("archive", "completed")).toEqual({
      success: true,
      nextStatus: "archived",
    });
  });

  it("restores archived trainings to active", () => {
    expect(resolveTrainingStatusTransition("restore", "archived")).toEqual({
      success: true,
      nextStatus: "active",
    });
  });
});

describe("isStudentVisibleTrainingStatus", () => {
  it("returns true only for active and completed trainings", () => {
    expect(isStudentVisibleTrainingStatus("active")).toBe(true);
    expect(isStudentVisibleTrainingStatus("completed")).toBe(true);
    expect(isStudentVisibleTrainingStatus("draft")).toBe(false);
    expect(isStudentVisibleTrainingStatus("archived")).toBe(false);
  });
});

describe("resolveDirectStatusChange", () => {
  it("allows publish and complete transitions", () => {
    expect(resolveDirectStatusChange("draft", "active")).toEqual({
      success: true,
      nextStatus: "active",
    });
    expect(resolveDirectStatusChange("active", "completed")).toEqual({
      success: true,
      nextStatus: "completed",
    });
  });

  it("rejects invalid direct transitions", () => {
    expect(resolveDirectStatusChange("draft", "completed")).toEqual({
      success: false,
      error: TrainingErrorCode.INVALID_STATUS_TRANSITION,
    });
  });
});
