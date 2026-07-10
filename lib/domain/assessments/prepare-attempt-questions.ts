export type AssessmentDisplaySettings = {
  questionDisplayCount: number | null;
  shuffleQuestions: boolean;
};

export type PrepareAttemptQuestion = {
  id: string;
};

function hashSeed(seed: string): number {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  const result = [...items];
  let state = hashSeed(seed);

  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

export function prepareAttemptQuestions<T extends PrepareAttemptQuestion>(
  questions: T[],
  settings: AssessmentDisplaySettings,
  seed: string,
): T[] {
  if (questions.length === 0) {
    return [];
  }

  let pool = [...questions];

  if (settings.shuffleQuestions) {
    pool = seededShuffle(pool, seed);
  }

  const displayCount = settings.questionDisplayCount;
  if (
    displayCount === null ||
    displayCount <= 0 ||
    displayCount >= pool.length
  ) {
    return pool;
  }

  return pool.slice(0, displayCount);
}

export function resolveAttemptQuestions<T extends PrepareAttemptQuestion>(
  allQuestions: T[],
  questionIds: string[] | null | undefined,
): T[] {
  if (!questionIds || questionIds.length === 0) {
    return allQuestions;
  }

  const byId = new Map(allQuestions.map((question) => [question.id, question]));

  return questionIds
    .map((questionId) => byId.get(questionId))
    .filter((question): question is T => question !== undefined);
}

export function getEffectiveDisplayCount(
  totalQuestions: number,
  questionDisplayCount: number | null,
): number {
  if (
    questionDisplayCount === null ||
    questionDisplayCount <= 0 ||
    questionDisplayCount >= totalQuestions
  ) {
    return totalQuestions;
  }

  return questionDisplayCount;
}
