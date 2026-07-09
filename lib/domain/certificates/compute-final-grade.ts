export function computeFinalGrade(
  preTestScore: number,
  postTestScore: number,
): number {
  return Math.round((preTestScore + postTestScore) / 2);
}
