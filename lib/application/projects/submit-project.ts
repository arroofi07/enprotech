import type { SessionUser } from "@/lib/domain/auth/types";
import {
  ProjectErrorCode,
  projectFailure,
  projectSuccess,
  type ProjectResult,
} from "@/lib/domain/projects/errors";
import type { StudentProject } from "@/lib/db/schema/student-projects";
import { issueCertificateIfEligible } from "@/lib/application/certificates/issue-certificate-if-eligible";
import { isStudentEnrolled } from "@/lib/infrastructure/db/repositories/report-repository";
import { upsertProject } from "@/lib/infrastructure/db/repositories/project-repository";
import { submitProjectSchema } from "@/lib/validations/project-schemas";

import { assertProjectStudent } from "./assert-access";

export async function submitProject(
  actor: SessionUser | null,
  input: unknown,
): Promise<ProjectResult<StudentProject>> {
  const forbidden = assertProjectStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = submitProjectSchema.safeParse(input);
  if (!parsed.success) {
    return projectFailure(ProjectErrorCode.VALIDATION_ERROR);
  }

  const enrolled = await isStudentEnrolled(actor!.id, parsed.data.trainingId);
  if (!enrolled) {
    return projectFailure(ProjectErrorCode.NOT_ENROLLED);
  }

  const project = await upsertProject({
    studentId: actor!.id,
    trainingId: parsed.data.trainingId,
    title: parsed.data.title,
    description: parsed.data.description,
    imageUrl: parsed.data.imageUrl,
    videoUrl: parsed.data.videoUrl,
    pdfUrl: parsed.data.pdfUrl,
    pdfFileSize: parsed.data.pdfFileSize,
  });

  await issueCertificateIfEligible({
    studentId: actor!.id,
    trainingId: parsed.data.trainingId,
  });

  return projectSuccess(project);
}
