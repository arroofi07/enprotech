import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { assessmentErrorHttpStatus } from "@/lib/application/assessments/error-http-status";
import { createQuestionUseCase } from "@/lib/application/assessments/create-question";
import {
  AssessmentErrorCode,
  assessmentFailure,
} from "@/lib/domain/assessments/errors";
import { listQuestionsByAssessment } from "@/lib/infrastructure/db/repositories/assessment-repository";

function errorResponse(error: AssessmentErrorCode) {
  const failure = assessmentFailure(error);
  return NextResponse.json(
    { error: failure.error, message: failure.message },
    { status: assessmentErrorHttpStatus(failure.error) },
  );
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  if (!actor) {
    return errorResponse(AssessmentErrorCode.UNAUTHORIZED);
  }

  const { id } = await context.params;
  const questions = await listQuestionsByAssessment(id);
  return NextResponse.json(questions);
}

export async function POST(request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(AssessmentErrorCode.VALIDATION_ERROR);
  }

  const result = await createQuestionUseCase(actor, {
    assessmentId: id,
    ...(body && typeof body === "object" ? body : {}),
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: assessmentErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data, { status: 201 });
}
