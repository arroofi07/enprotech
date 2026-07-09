import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { assessmentErrorHttpStatus } from "@/lib/application/assessments/error-http-status";
import { getOrCreateAssessment } from "@/lib/application/assessments/get-or-create-assessment";
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

export async function GET(request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type !== "quiz" && type !== "latihan") {
    return errorResponse(AssessmentErrorCode.VALIDATION_ERROR);
  }

  const result = await getOrCreateAssessment(actor, { moduleId: id, type });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: assessmentErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}
