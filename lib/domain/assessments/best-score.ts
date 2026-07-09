export function getBestScore(scores: number[]): number {
  if (scores.length === 0) {
    return 0;
  }

  return Math.max(...scores);
}

export function hasPassed(bestScore: number, passingGrade: number): boolean {
  return bestScore >= passingGrade;
}
