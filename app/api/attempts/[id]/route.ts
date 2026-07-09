import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { assessmentErrorHttpStatus } from "@/lib/application/assessments/error-http-status";
import { saveAttemptAnswers } from "@/lib/application/assessments/save-attempt-answers";
import {
  AssessmentErrorCode,
  assessmentFailure,
} from "@/lib/domain/assessments/errors";

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

export async function PATCH(request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(AssessmentErrorCode.VALIDATION_ERROR);
  }

  const result = await saveAttemptAnswers(actor, id, body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: assessmentErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}
