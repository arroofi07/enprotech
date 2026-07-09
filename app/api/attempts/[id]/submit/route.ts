import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { assessmentErrorHttpStatus } from "@/lib/application/assessments/error-http-status";
import { submitAttemptUseCase } from "@/lib/application/assessments/submit-attempt";
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

export async function POST(_request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { id } = await context.params;

  const result = await submitAttemptUseCase(actor, id);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: assessmentErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}
