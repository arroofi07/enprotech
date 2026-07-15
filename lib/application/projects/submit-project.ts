import type { SessionUser } from "@/lib/domain/auth/types";
import {
  ProjectErrorCode,
  projectFailure,
  projectSuccess,
  type ProjectResult,
} from "@/lib/domain/projects/errors";
import type { StudentProject } from "@/lib/db/schema/student-projects";
import { issueCertificateIfEligible } from "@/lib/application/certificates/issue-certificate-if-eligible";
import { notifyProjectSubmitted } from "@/lib/application/notifications/notify-project-submitted";
import { upsertProject } from "@/lib/infrastructure/db/repositories/project-repository";
import { submitProjectSchema } from "@/lib/validations/project-schemas";

import {
  assertProjectStudent,
  assertProjectSubmissionAccess,
} from "./assert-access";

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

  const inaccessible = await assertProjectSubmissionAccess(
    actor,
    parsed.data.trainingId,
  );
  if (inaccessible) {
    return inaccessible;
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

  await notifyProjectSubmitted({
    studentId: actor!.id,
    trainingId: parsed.data.trainingId,
  });

  await issueCertificateIfEligible({
    studentId: actor!.id,
    trainingId: parsed.data.trainingId,
  });

  return projectSuccess(project);
}
