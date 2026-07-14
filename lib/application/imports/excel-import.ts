import { buildQuestionOptions } from "@/lib/domain/assessments/build-options";
import { buildImportErrorReportBuffer } from "@/lib/domain/imports/build-error-report";
import { buildImportTemplateBuffer } from "@/lib/domain/imports/build-import-templates";
import {
  ImportErrorCode,
  importFailure,
  importSuccess,
  type ImportResult,
} from "@/lib/domain/imports/errors";
import {
  buildImportPreview,
  readExcelRows,
} from "@/lib/domain/imports/read-excel-rows";
import type {
  ImportCommitResult,
  ImportKind,
  ImportPreview,
  ParsedEnrollmentRow,
  ParsedQuestionRow,
  ParsedScoreRow,
} from "@/lib/domain/imports/types";
import { validateEnrollmentRows } from "@/lib/domain/imports/validate-enrollment-rows";
import { validateQuestionRows } from "@/lib/domain/imports/validate-question-rows";
import { validateScoreRows } from "@/lib/domain/imports/validate-score-rows";
import type { SessionUser } from "@/lib/domain/auth/types";
import {
  bulkCreateQuestions,
  createSubmittedAttempt,
  findAssessmentById,
  findAssessmentByModuleAndType,
  findAssessmentByTrainingAndType,
  getNextQuestionOrder,
} from "@/lib/infrastructure/db/repositories/assessment-repository";
import { findModuleByTrainingAndTitle } from "@/lib/infrastructure/db/repositories/module-repository";
import {
  enrollStudents as enrollStudentsInRepo,
  findExistingEnrollmentStudentIds,
  findTrainingById,
} from "@/lib/infrastructure/db/repositories/training-repository";
import {
  findUserByEmail,
} from "@/lib/infrastructure/db/repositories/user-repository";
import { importQuestionsBodySchema } from "@/lib/validations/import-schemas";

import { notifyEnrolled } from "@/lib/application/notifications/notify-enrolled";

import { assertImportTrainerOrAdmin } from "./assert-trainer-or-admin";

function readFileRows(buffer: ArrayBuffer) {
  try {
    return readExcelRows(buffer);
  } catch {
    return null;
  }
}

export async function downloadImportTemplate(
  actor: SessionUser | null,
  kind: ImportKind,
): Promise<ImportResult<{ buffer: ArrayBuffer; filename: string; contentType: string }>> {
  const forbidden = assertImportTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const { buffer, filename } = buildImportTemplateBuffer(kind);

  return importSuccess({
    buffer,
    filename,
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export async function previewQuestionsImport(
  actor: SessionUser | null,
  input: unknown,
  buffer: ArrayBuffer,
): Promise<ImportResult<ImportPreview<ParsedQuestionRow>>> {
  const forbidden = assertImportTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = importQuestionsBodySchema.safeParse(input);
  if (!parsed.success) {
    return importFailure(ImportErrorCode.VALIDATION_ERROR);
  }

  const assessment = await findAssessmentById(parsed.data.assessmentId);
  if (!assessment) {
    return importFailure(ImportErrorCode.ASSESSMENT_NOT_FOUND);
  }

  const rows = readFileRows(buffer);
  if (!rows) {
    return importFailure(ImportErrorCode.FILE_ERROR);
  }

  return importSuccess(buildImportPreview(validateQuestionRows(rows)));
}

export async function commitQuestionsImport(
  actor: SessionUser | null,
  input: unknown,
  buffer: ArrayBuffer,
): Promise<ImportResult<ImportCommitResult>> {
  const preview = await previewQuestionsImport(actor, input, buffer);
  if (!preview.success) {
    return preview;
  }

  const parsed = importQuestionsBodySchema.safeParse(input);
  if (!parsed.success) {
    return importFailure(ImportErrorCode.VALIDATION_ERROR);
  }

  const validRows = preview.data.rows.filter((row) => row.isValid && row.data);
  if (validRows.length === 0) {
    return importFailure(ImportErrorCode.NO_VALID_ROWS);
  }

  const startOrder = await getNextQuestionOrder(parsed.data.assessmentId);
  await bulkCreateQuestions(
    validRows.map((row, index) => ({
      assessmentId: parsed.data.assessmentId,
      questionText: row.data!.questionText,
      options: buildQuestionOptions(row.data!.options),
      order: startOrder + index,
    })),
  );

  return importSuccess({
    successCount: validRows.length,
    failedCount: preview.data.invalidCount,
    skippedCount: 0,
    errors: preview.data.rows
      .filter((row) => !row.isValid)
      .map((row) => ({
        rowNumber: row.rowNumber,
        message: row.errors.join("; "),
      })),
  });
}

async function enrichEnrollmentRows(
  rows: ReturnType<typeof validateEnrollmentRows>,
) {
  return Promise.all(
    rows.map(async (row) => {
      if (!row.isValid || !row.data) {
        return row;
      }

      const errors = [...row.errors];
      const student = await findUserByEmail(row.data.studentEmail);
      if (!student || student.role !== "student" || student.status !== "active") {
        errors.push("Student tidak ditemukan atau tidak aktif.");
      }

      const training = await findTrainingById(row.data.trainingId);
      if (!training) {
        errors.push("Training tidak ditemukan.");
      } else if (training.status === "archived") {
        errors.push("Training sudah diarsipkan.");
      }

      if (student && training) {
        const existing = await findExistingEnrollmentStudentIds(training.id, [
          student.id,
        ]);
        if (existing.length > 0) {
          errors.push("Student sudah terdaftar di training ini.");
        }
      }

      return {
        ...row,
        errors,
        isValid: errors.length === 0,
        data: errors.length === 0 ? row.data : null,
      };
    }),
  );
}

export async function previewEnrollmentsImport(
  actor: SessionUser | null,
  buffer: ArrayBuffer,
): Promise<ImportResult<ImportPreview<ParsedEnrollmentRow>>> {
  const forbidden = assertImportTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const rows = readFileRows(buffer);
  if (!rows) {
    return importFailure(ImportErrorCode.FILE_ERROR);
  }

  const enriched = await enrichEnrollmentRows(validateEnrollmentRows(rows));
  return importSuccess(buildImportPreview(enriched));
}

export async function commitEnrollmentsImport(
  actor: SessionUser | null,
  buffer: ArrayBuffer,
): Promise<ImportResult<ImportCommitResult>> {
  const preview = await previewEnrollmentsImport(actor, buffer);
  if (!preview.success) {
    return preview;
  }

  const validRows = preview.data.rows.filter((row) => row.isValid && row.data);
  if (validRows.length === 0) {
    return importFailure(ImportErrorCode.NO_VALID_ROWS);
  }

  let successCount = 0;
  const errors = preview.data.rows
    .filter((row) => !row.isValid)
    .map((row) => ({
      rowNumber: row.rowNumber,
      message: row.errors.join("; "),
    }));

  for (const row of validRows) {
    const student = await findUserByEmail(row.data!.studentEmail);
    if (!student) {
      continue;
    }

    await enrollStudentsInRepo(row.data!.trainingId, [student.id]);
    await notifyEnrolled({
      studentIds: [student.id],
      trainingId: row.data!.trainingId,
    });
    successCount += 1;
  }

  return importSuccess({
    successCount,
    failedCount: preview.data.invalidCount,
    skippedCount: 0,
    errors,
  });
}

async function enrichScoreRows(rows: ReturnType<typeof validateScoreRows>) {
  return Promise.all(
    rows.map(async (row) => {
      if (!row.isValid || !row.data) {
        return row;
      }

      const errors = [...row.errors];
      const student = await findUserByEmail(row.data.studentEmail);
      if (!student || student.role !== "student" || student.status !== "active") {
        errors.push("Student tidak ditemukan atau tidak aktif.");
      }

      const training = await findTrainingById(row.data.trainingId);
      if (!training) {
        errors.push("Training tidak ditemukan.");
      }

      if (student && training) {
        const existing = await findExistingEnrollmentStudentIds(training.id, [
          student.id,
        ]);
        if (existing.length === 0) {
          errors.push("Student belum terdaftar di training ini.");
        }
      }

      let assessmentId: string | null = null;
      if (training && row.data) {
        if (
          row.data.assessmentType === "pre_test" ||
          row.data.assessmentType === "post_test"
        ) {
          const assessment = await findAssessmentByTrainingAndType(
            training.id,
            row.data.assessmentType,
          );
          if (!assessment) {
            errors.push(`${row.data.assessmentType} belum dibuat.`);
          } else {
            assessmentId = assessment.id;
          }
        } else if (row.data.moduleName) {
          const module = await findModuleByTrainingAndTitle(
            training.id,
            row.data.moduleName,
          );
          if (!module) {
            errors.push("Modul tidak ditemukan.");
          } else {
            const assessment = await findAssessmentByModuleAndType(
              module.id,
              row.data.assessmentType,
            );
            if (!assessment) {
              errors.push(`${row.data.assessmentType} belum dibuat untuk modul ini.`);
            } else {
              assessmentId = assessment.id;
            }
          }
        }
      }

      return {
        ...row,
        errors,
        isValid: errors.length === 0,
        data:
          errors.length === 0
            ? { ...row.data!, assessmentId: assessmentId! }
            : null,
      };
    }),
  );
}

type EnrichedScoreRow = ParsedScoreRow & { assessmentId: string };

export async function previewScoresImport(
  actor: SessionUser | null,
  buffer: ArrayBuffer,
): Promise<ImportResult<ImportPreview<ParsedScoreRow>>> {
  const forbidden = assertImportTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const rows = readFileRows(buffer);
  if (!rows) {
    return importFailure(ImportErrorCode.FILE_ERROR);
  }

  const enriched = await enrichScoreRows(validateScoreRows(rows));
  return importSuccess(
    buildImportPreview(
      enriched.map((row) => ({
        rowNumber: row.rowNumber,
        raw: row.raw,
        data: row.data
          ? {
              studentEmail: row.data.studentEmail,
              trainingId: row.data.trainingId,
              moduleName: row.data.moduleName,
              assessmentType: row.data.assessmentType,
              score: row.data.score,
            }
          : null,
        errors: row.errors,
        isValid: row.isValid,
      })),
    ),
  );
}

export async function commitScoresImport(
  actor: SessionUser | null,
  buffer: ArrayBuffer,
): Promise<ImportResult<ImportCommitResult>> {
  const forbidden = assertImportTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const rows = readFileRows(buffer);
  if (!rows) {
    return importFailure(ImportErrorCode.FILE_ERROR);
  }

  const enriched = await enrichScoreRows(validateScoreRows(rows));
  const validRows = enriched.filter(
    (row): row is typeof row & { data: EnrichedScoreRow } =>
      row.isValid && row.data !== null,
  );

  if (validRows.length === 0) {
    return importFailure(ImportErrorCode.NO_VALID_ROWS);
  }

  let successCount = 0;
  for (const row of validRows) {
    const student = await findUserByEmail(row.data.studentEmail);
    if (!student) {
      continue;
    }

    await createSubmittedAttempt({
      studentId: student.id,
      assessmentId: row.data.assessmentId,
      score: row.data.score,
    });
    successCount += 1;
  }

  return importSuccess({
    successCount,
    failedCount: enriched.length - validRows.length,
    skippedCount: 0,
    errors: enriched
      .filter((row) => !row.isValid)
      .map((row) => ({
        rowNumber: row.rowNumber,
        message: row.errors.join("; "),
      })),
  });
}

export function buildErrorReportFromPreview(
  preview: ImportPreview<unknown>,
): ArrayBuffer {
  return buildImportErrorReportBuffer(preview.rows);
}
