import type { SessionUser } from "@/lib/domain/auth/types";
import {
  ProjectErrorCode,
  projectFailure,
  projectSuccess,
  type ProjectResult,
} from "@/lib/domain/projects/errors";
import { MAX_PROJECTS_PER_TRAINING } from "@/lib/domain/projects/limits";
import type { StudentProject } from "@/lib/db/schema/student-projects";
import { issueCertificateIfEligible } from "@/lib/application/certificates/issue-certificate-if-eligible";
import { notifyProjectSubmitted } from "@/lib/application/notifications/notify-project-submitted";
import {
  countProjectsByStudentAndTraining,
  insertProject,
  updateProjectForStudent,
} from "@/lib/infrastructure/db/repositories/project-repository";
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

  const values = {
    title: parsed.data.title,
    description: parsed.data.description,
    imageUrl: parsed.data.imageUrl,
    videoUrl: parsed.data.videoUrl,
    pdfUrl: parsed.data.pdfUrl,
    pdfFileSize: parsed.data.pdfFileSize,
  };

  let project: StudentProject;

  if (parsed.data.projectId) {
    // Update an existing project (ownership enforced in the repository).
    const updated = await updateProjectForStudent(
      parsed.data.projectId,
      actor!.id,
      values,
    );
    if (!updated) {
      return projectFailure(ProjectErrorCode.PROJECT_NOT_FOUND);
    }
    project = updated;
  } else {
    // Create a new project, enforcing the per-training cap.
    const existingCount = await countProjectsByStudentAndTraining(
      actor!.id,
      parsed.data.trainingId,
    );
    if (existingCount >= MAX_PROJECTS_PER_TRAINING) {
      return projectFailure(ProjectErrorCode.PROJECT_LIMIT_REACHED);
    }

    project = await insertProject({
      studentId: actor!.id,
      trainingId: parsed.data.trainingId,
      ...values,
    });
  }

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
