import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { enrollStudents } from "@/lib/application/trainings/enroll-students";
import { trainingErrorHttpStatus } from "@/lib/application/trainings/error-http-status";
import { removeEnrollment } from "@/lib/application/trainings/remove-enrollment";
import {
  TrainingErrorCode,
  trainingFailure,
  type TrainingErrorCode as TrainingErrorCodeType,
} from "@/lib/domain/trainings/errors";

function errorResponse(error: TrainingErrorCodeType) {
  const failure = trainingFailure(error);
  return NextResponse.json(
    { error: failure.error, message: failure.message },
    { status: trainingErrorHttpStatus(failure.error) },
  );
}

const enrollBodySchema = z.object({
  studentIds: z.array(z.uuid()).min(1),
});

const removeBodySchema = z.object({
  enrollmentId: z.uuid(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(TrainingErrorCode.VALIDATION_ERROR);
  }

  const parsed = enrollBodySchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(TrainingErrorCode.VALIDATION_ERROR);
  }

  const result = await enrollStudents(actor, {
    trainingId: id,
    studentIds: parsed.data.studentIds,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: trainingErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data, { status: 201 });
}

export async function DELETE(request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { id: _trainingId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(TrainingErrorCode.VALIDATION_ERROR);
  }

  const parsed = removeBodySchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(TrainingErrorCode.VALIDATION_ERROR);
  }

  const result = await removeEnrollment(actor, {
    enrollmentId: parsed.data.enrollmentId,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: trainingErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}
