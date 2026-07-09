export type ModuleProgressSnapshot = {
  status: "not_started" | "in_progress" | "completed";
};

export function calculateTrainingProgress(
  totalModules: number,
  completedModules: number,
): number {
  if (totalModules <= 0) {
    return 0;
  }

  const percent = (completedModules / totalModules) * 100;
  return Math.min(100, Math.max(0, Math.round(percent)));
}

export function countCompletedModules(
  progress: ModuleProgressSnapshot[],
): number {
  return progress.filter((item) => item.status === "completed").length;
}
