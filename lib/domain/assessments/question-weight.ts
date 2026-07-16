/**
 * Bobot soal: trainer menetapkan berapa poin satu jawaban benar bernilai, mis.
 * 40 soal x 2.5 = 100. Bobot null berarti assessment memakai penilaian rata
 * lama (benar / total * 100).
 */

export const TARGET_TOTAL_SCORE = 100;
export const MAX_QUESTION_WEIGHT = 100;
export const MIN_QUESTION_WEIGHT = 0.01;

export type QuestionWeightStatus =
  | "unset"
  | "no_questions"
  | "exact"
  | "under"
  | "over";

/** numeric(5,2) di DB, jadi 2 desimal adalah presisi yang bisa disimpan utuh. */
export function roundWeight(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Soal yang benar-benar dinilai. Kalau questionDisplayCount diset, peserta hanya
 * mengerjakan sebagian soal — total nilai dihitung dari jumlah itu, bukan dari
 * seluruh bank soal.
 */
export function getScoredQuestionCount(
  totalQuestions: number,
  questionDisplayCount: number | null,
): number {
  if (questionDisplayCount === null || questionDisplayCount >= totalQuestions) {
    return totalQuestions;
  }

  return Math.max(0, questionDisplayCount);
}

export function getWeightedTotal(
  scoredQuestionCount: number,
  questionWeight: number,
): number {
  return roundWeight(scoredQuestionCount * questionWeight);
}

/** Bobot yang pas 100 untuk jumlah soal ini, atau null kalau belum ada soal. */
export function suggestQuestionWeight(
  scoredQuestionCount: number,
): number | null {
  if (scoredQuestionCount <= 0) {
    return null;
  }

  return roundWeight(TARGET_TOTAL_SCORE / scoredQuestionCount);
}

export function getQuestionWeightStatus(input: {
  scoredQuestionCount: number;
  questionWeight: number | null;
}): QuestionWeightStatus {
  if (input.questionWeight === null) {
    return "unset";
  }

  if (input.scoredQuestionCount <= 0) {
    return "no_questions";
  }

  const total = getWeightedTotal(input.scoredQuestionCount, input.questionWeight);

  if (total === TARGET_TOTAL_SCORE) {
    return "exact";
  }

  return total < TARGET_TOTAL_SCORE ? "under" : "over";
}
