import type { SessionUser } from "@/lib/domain/auth/types";
import {
  certificateSuccess,
  type CertificateResult,
} from "@/lib/domain/certificates/errors";
import { getStudentTrainingFlowState } from "@/lib/application/training-flow/get-student-training-flow-state";
import { listCertificatesByStudent } from "@/lib/infrastructure/db/repositories/certificate-repository";
import { listEnrolledTrainingsByStudent } from "@/lib/infrastructure/db/repositories/training-repository";

import { assertCertificateStudent } from "./assert-student";

const MAX_TRAININGS = 100;

export type CertificateChecklistStepKey =
  | "modules"
  | "postTest"
  | "project"
  | "feedback";

export type CertificateChecklistStep = {
  key: CertificateChecklistStepKey;
  label: string;
  description: string;
  done: boolean;
  href: string;
};

export type CertificateChecklist = {
  trainingId: string;
  trainingTitle: string;
  steps: CertificateChecklistStep[];
  completedCount: number;
  totalCount: number;
  isEligible: boolean;
};

export async function getStudentCertificateProgress(
  actor: SessionUser | null,
): Promise<CertificateResult<CertificateChecklist[]>> {
  const forbidden = assertCertificateStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  const [{ items: enrolledTrainings }, { items: certificates }] =
    await Promise.all([
      listEnrolledTrainingsByStudent(actor!.id, {
        page: 1,
        pageSize: MAX_TRAININGS,
      }),
      listCertificatesByStudent(actor!.id, {
        page: 1,
        pageSize: MAX_TRAININGS,
      }),
    ]);

  const certifiedTrainingIds = new Set(
    certificates.map((certificate) => certificate.trainingId),
  );
  const pendingTrainings = enrolledTrainings.filter(
    (training) => !certifiedTrainingIds.has(training.id),
  );

  const checklists = await Promise.all(
    pendingTrainings.map(async (training) => {
      const flow = await getStudentTrainingFlowState(actor!.id, training.id);
      if (!flow) {
        return null;
      }

      const steps: CertificateChecklistStep[] = [
        {
          key: "modules",
          label: "Modul Pembelajaran",
          description: "Selesaikan seluruh modul training.",
          done: flow.allModulesCompleted,
          href: `/student/trainings/${training.id}/modules`,
        },
        {
          key: "postTest",
          label: "Post-Test",
          description: "Lulus post-test sesuai nilai minimum kelulusan.",
          done: flow.hasPassedPostTest,
          href: `/student/trainings/${training.id}/post-test`,
        },
        {
          key: "project",
          label: "Upload Project",
          description: "Unggah project akhir sebagai bukti praktik.",
          done: flow.hasSubmittedProject,
          href: `/student/projects/${training.id}`,
        },
        {
          key: "feedback",
          label: "Feedback Training",
          description: "Isi formulir feedback penyelenggaraan training.",
          done: flow.hasSubmittedFeedback,
          href: `/student/feedback/${training.id}`,
        },
      ];

      const completedCount = steps.filter((step) => step.done).length;

      const checklist: CertificateChecklist = {
        trainingId: training.id,
        trainingTitle: training.title,
        steps,
        completedCount,
        totalCount: steps.length,
        isEligible: flow.canAccessCertificate,
      };

      return checklist;
    }),
  );

  const result = checklists.filter(
    (checklist): checklist is CertificateChecklist => checklist !== null,
  );

  result.sort((a, b) => b.completedCount - a.completedCount);

  return certificateSuccess(result);
}
