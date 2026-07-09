import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { archiveTraining } from "@/lib/application/trainings/archive-training";
import { trainingErrorHttpStatus } from "@/lib/application/trainings/error-http-status";
import { getTraining } from "@/lib/application/trainings/get-training";
import { updateTraining } from "@/lib/application/trainings/update-training";
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

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { id } = await context.params;
  const result = await getTraining(actor, { trainingId: id });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: trainingErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}

export async function PATCH(request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(TrainingErrorCode.VALIDATION_ERROR);
  }

  const result = await updateTraining(actor, {
    trainingId: id,
    ...(body && typeof body === "object" ? body : {}),
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: trainingErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { id } = await context.params;
  const result = await archiveTraining(actor, { trainingId: id });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: trainingErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}
