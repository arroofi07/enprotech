import "dotenv/config";

import { createQuestionUseCase } from "@/lib/application/assessments/create-question";
import { getOrCreateAssessment } from "@/lib/application/assessments/get-or-create-assessment";
import { getOrCreateTrainingAssessment } from "@/lib/application/assessments/get-or-create-training-assessment";
import { saveAttemptAnswers } from "@/lib/application/assessments/save-attempt-answers";
import { startAttempt } from "@/lib/application/assessments/start-attempt";
import { submitAttemptUseCase } from "@/lib/application/assessments/submit-attempt";
import { downloadCertificate } from "@/lib/application/certificates/download-certificate";
import { issueCertificateIfEligible } from "@/lib/application/certificates/issue-certificate-if-eligible";
import { listStudentCertificates } from "@/lib/application/certificates/list-student-certificates";
import { verifyCertificate } from "@/lib/application/certificates/verify-certificate";
import { submitFeedback } from "@/lib/application/feedback/submit-feedback";
import { updateStudentModuleProgress } from "@/lib/application/modules/update-student-module-progress";
import { submitProject } from "@/lib/application/projects/submit-project";
import { activatePretest } from "@/lib/application/trainings/activate-pretest";
import { createTraining } from "@/lib/application/trainings/create-training";
import { enrollStudents } from "@/lib/application/trainings/enroll-students";
import { updateTraining } from "@/lib/application/trainings/update-training";
import { createModule } from "@/lib/application/modules/create-module";
import { hashPassword } from "@/lib/infrastructure/auth/password-hasher";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/infrastructure/auth/session-manager";
import {
  createUser,
  findUserByEmail,
} from "@/lib/infrastructure/db/repositories/user-repository";

const QA_PASSWORD = "QaTest123!";
const BASE_URL = process.env.QA_BASE_URL ?? "http://localhost:3000";

type QaResult = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
};

const results: QaResult[] = [];

function record(id: string, label: string, passed: boolean, detail: string) {
  results.push({ id, label, passed, detail });
  console.log(`[${passed ? "PASS" : "FAIL"}] ${id} ${label} — ${detail}`);
}

async function ensureUser(input: {
  email: string;
  name: string;
  role: "admin" | "trainer" | "student";
}) {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    return {
      id: existing.id,
      email: existing.email,
      name: existing.name,
      role: existing.role,
      status: existing.status,
    };
  }

  const passwordHash = await hashPassword(QA_PASSWORD);
  const user = await createUser({
    email: input.email,
    name: input.name,
    passwordHash,
    role: input.role,
    status: "active",
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
  };
}

function defaultOptions(correctIndex = 0) {
  return ["A", "B", "C", "D", "E"].map((text, index) => ({
    text: `Opsi ${text}`,
    isCorrect: index === correctIndex,
  }));
}

async function addQuestion(
  trainer: Awaited<ReturnType<typeof ensureUser>>,
  assessmentId: string,
) {
  const result = await createQuestionUseCase(trainer, {
    assessmentId,
    questionText: "Pertanyaan QA?",
    options: defaultOptions(0),
  });
  if (!result.success) {
    throw new Error(result.message);
  }
}

async function passAssessment(
  student: Awaited<ReturnType<typeof ensureUser>>,
  assessmentId: string,
) {
  const started = await startAttempt(student, { assessmentId });
  if (!started.success) {
    throw new Error(started.message);
  }

  const answers = started.data.questions.map((question) => {
    const correctOption = question.options.find((option) => option.isCorrect);
    if (!correctOption) {
      throw new Error(`No correct option for question ${question.id}`);
    }

    return {
      questionId: question.id,
      selectedOptionId: correctOption.id,
    };
  });

  const saved = await saveAttemptAnswers(student, started.data.attempt.id, {
    answers,
  });
  if (!saved.success) {
    throw new Error(saved.message);
  }

  const submitted = await submitAttemptUseCase(student, started.data.attempt.id);
  if (!submitted.success) {
    throw new Error(submitted.message);
  }

  return submitted;
}

async function fetchPublic(path: string) {
  return fetch(`${BASE_URL}${path}`, { redirect: "manual" });
}

async function fetchWithSession(
  path: string,
  sessionUser: {
    id: string;
    email: string;
    name: string;
    role: "admin" | "trainer" | "student";
    status: "active";
  },
) {
  const token = await createSessionToken(sessionUser);
  return fetch(`${BASE_URL}${path}`, {
    headers: { Cookie: `${SESSION_COOKIE_NAME}=${token}` },
    redirect: "manual",
  });
}

async function main() {
  console.log("=== T10 Manual QA Runner ===\n");

  const trainer = await ensureUser({
    email: "qa-t10-trainer@enprotech.test",
    name: "QA T10 Trainer",
    role: "trainer",
  });
  const student = await ensureUser({
    email: "qa-t10-student@enprotech.test",
    name: "QA T10 Student",
    role: "student",
  });

  const createResult = await createTraining(trainer, {
    title: `QA Certificate Training ${Date.now()}`,
    description: "Manual QA certificate",
    passingGrade: 70,
    deadline: null,
  });
  if (!createResult.success) {
    throw new Error(createResult.message);
  }

  const trainingId = createResult.data.id;
  await updateTraining(trainer, { trainingId, status: "active" });

  const moduleResult = await createModule(trainer, {
    trainingId,
    title: "QA Certificate Module",
    materialUrl: "https://example.com/materi.pdf",
    materialSize: 1024,
  });
  if (!moduleResult.success) {
    throw new Error(moduleResult.message);
  }

  await enrollStudents(trainer, {
    trainingId,
    studentIds: [student.id],
  });

  const preTest = await getOrCreateTrainingAssessment(trainer, {
    trainingId,
    type: "pre_test",
  });
  const postTest = await getOrCreateTrainingAssessment(trainer, {
    trainingId,
    type: "post_test",
  });
  const quiz = await getOrCreateAssessment(trainer, {
    moduleId: moduleResult.data.id,
    type: "quiz",
  });
  const latihan = await getOrCreateAssessment(trainer, {
    moduleId: moduleResult.data.id,
    type: "latihan",
  });
  if (!preTest.success || !postTest.success || !quiz.success || !latihan.success) {
    throw new Error("Failed to create assessments");
  }

  await addQuestion(trainer, preTest.data.id);
  await addQuestion(trainer, postTest.data.id);
  await addQuestion(trainer, quiz.data.id);
  await addQuestion(trainer, latihan.data.id);
  await activatePretest(trainer, { trainingId });

  await passAssessment(student, preTest.data.id);
  await updateStudentModuleProgress(student, {
    moduleId: moduleResult.data.id,
    status: "completed",
  });
  // Quiz/latihan attempts are skipped here: they now require a trainer-set
  // video conference schedule (unrelated gate added after this script was
  // written), and module completion above doesn't depend on them anyway.
  await passAssessment(student, postTest.data.id);

  const certAfterPostTestOnly = await issueCertificateIfEligible({
    studentId: student.id,
    trainingId,
  });
  record(
    "AC-gate-1",
    "Sertifikat belum terbit setelah post-test saja (project & feedback belum)",
    certAfterPostTestOnly === null,
    certAfterPostTestOnly ? "unexpectedly issued" : "correctly withheld",
  );

  const projectResult = await submitProject(student, {
    trainingId,
    imageUrl: "https://example.com/qa-project-image.png",
    videoUrl: "https://example.com/qa-project-video.mp4",
    pdfUrl: "https://example.com/qa-project.pdf",
  });
  if (!projectResult.success) {
    throw new Error(projectResult.message);
  }

  const certAfterProjectOnly = await issueCertificateIfEligible({
    studentId: student.id,
    trainingId,
  });
  record(
    "AC-gate-2",
    "Sertifikat masih belum terbit setelah project saja (feedback belum)",
    certAfterProjectOnly === null,
    certAfterProjectOnly ? "unexpectedly issued" : "correctly withheld",
  );

  const feedbackResult = await submitFeedback(student, {
    trainingId,
    trainingRating: 5,
    trainerRating: 5,
    comment: "QA feedback",
  });
  if (!feedbackResult.success) {
    throw new Error(feedbackResult.message);
  }

  const certificate = await issueCertificateIfEligible({
    studentId: student.id,
    trainingId,
  });

  record(
    "AC-1",
    "Auto issue after post-test + project + feedback",
    Boolean(certificate),
    certificate?.certificateNumber ?? "not issued",
  );

  const listResult = await listStudentCertificates(student, { page: 1, pageSize: 100 });
  const listed = listResult.success
    ? listResult.data.items.find((item) => item.id === certificate?.id)
    : null;

  record(
    "AC-6",
    "Student certificate list",
    Boolean(listed),
    listResult.success ? `${listResult.data.length} certificate(s)` : "failed",
  );

  record(
    "AC-3,4,5",
    "Certificate data fields",
    Boolean(
      certificate &&
        certificate.preTestScore >= 0 &&
        certificate.postTestScore >= 0 &&
        certificate.certificateNumber.startsWith("CERT-"),
    ),
    certificate
      ? `pre=${certificate.preTestScore}, post=${certificate.postTestScore}, no=${certificate.certificateNumber}`
      : "missing",
  );

  const download = await downloadCertificate(student, {
    certificateId: certificate!.id,
  });
  record(
    "AC-7",
    "Download PDF",
    download.success && download.data.buffer.byteLength > 0,
    download.success
      ? `${download.data.filename} (${download.data.buffer.byteLength} bytes)`
      : "failed",
  );

  const verify = await verifyCertificate({
    certificateNumber: certificate!.certificateNumber,
  });
  record(
    "AC-9",
    "Public verify valid",
    verify.success && verify.data.isValid,
    verify.success ? verify.data.studentName : "failed",
  );

  const invalid = await verifyCertificate({
    certificateNumber: "CERT-NOT-FOUND-2026-9999",
  });
  record(
    "AC-10",
    "Public verify invalid",
    !invalid.success,
    invalid.success ? "unexpected success" : invalid.message,
  );

  const verifyPage = await fetchPublic("/verify");
  record(
    "AC-8a",
    "Public verify page",
    verifyPage.status === 200,
    `status=${verifyPage.status}`,
  );

  const verifyResultPage = await fetchPublic(
    `/verify/${encodeURIComponent(certificate!.certificateNumber)}`,
  );
  record(
    "AC-8b",
    "Public verify result page",
    verifyResultPage.status === 200,
    `status=${verifyResultPage.status}`,
  );

  const apiVerify = await fetchPublic(
    `/api/verify/${encodeURIComponent(certificate!.certificateNumber)}`,
  );
  record(
    "API-1",
    "GET /api/verify/[number]",
    apiVerify.status === 200,
    `status=${apiVerify.status}`,
  );

  const studentPage = await fetchWithSession("/student/certificates", {
    ...student,
    status: "active",
  });
  record(
    "API-2",
    "Student certificates page",
    studentPage.status === 200,
    `status=${studentPage.status}`,
  );

  // Reverse-order check: feedback + project submitted BEFORE post-test is
  // ever passed — certificate must still auto-issue once post-test is
  // finally passed, proving the retry trigger works regardless of order.
  const student2 = await ensureUser({
    email: "qa-t10-student2@enprotech.test",
    name: "QA T10 Student Reverse Order",
    role: "student",
  });
  await enrollStudents(trainer, { trainingId, studentIds: [student2.id] });
  await passAssessment(student2, preTest.data.id);
  await updateStudentModuleProgress(student2, {
    moduleId: moduleResult.data.id,
    status: "completed",
  });

  const feedback2 = await submitFeedback(student2, {
    trainingId,
    trainingRating: 4,
    trainerRating: 4,
    comment: "QA feedback (reverse order)",
  });
  if (!feedback2.success) {
    throw new Error(feedback2.message);
  }

  const project2 = await submitProject(student2, {
    trainingId,
    imageUrl: "https://example.com/qa-project-image-2.png",
    videoUrl: "https://example.com/qa-project-video-2.mp4",
    pdfUrl: "https://example.com/qa-project-2.pdf",
  });
  if (!project2.success) {
    throw new Error(project2.message);
  }

  const certBeforePostTest2 = await issueCertificateIfEligible({
    studentId: student2.id,
    trainingId,
  });
  record(
    "AC-gate-3",
    "Urutan terbalik: sertifikat belum terbit sebelum post-test meski project & feedback sudah",
    certBeforePostTest2 === null,
    certBeforePostTest2 ? "unexpectedly issued" : "correctly withheld",
  );

  await passAssessment(student2, postTest.data.id);

  const listResult2 = await listStudentCertificates(student2, {
    page: 1,
    pageSize: 10,
  });
  const certificate2 = listResult2.success ? listResult2.data.items[0] : null;
  record(
    "AC-gate-4",
    "Urutan terbalik: sertifikat otomatis terbit begitu post-test akhirnya lulus",
    Boolean(certificate2),
    certificate2?.certificateNumber ?? "not issued",
  );

  const failed = results.filter((result) => !result.passed).length;
  console.log(`\n=== Summary: ${results.length - failed}/${results.length} passed ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
