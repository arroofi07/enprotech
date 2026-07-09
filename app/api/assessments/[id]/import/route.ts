import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { assessmentErrorHttpStatus } from "@/lib/application/assessments/error-http-status";
import { importQuestionsUseCase } from "@/lib/application/assessments/import-questions";
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

export async function POST(request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { id } = await context.params;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return errorResponse(AssessmentErrorCode.VALIDATION_ERROR);
  }

  const buffer = await file.arrayBuffer();
  const result = await importQuestionsUseCase(actor, id, buffer);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: assessmentErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data, { status: 201 });
}
