import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { moduleErrorHttpStatus } from "@/lib/application/modules/error-http-status";
import { listStudentModules } from "@/lib/application/modules/list-student-modules";
import { updateStudentModuleProgress } from "@/lib/application/modules/update-student-module-progress";
import {
  ModuleErrorCode,
  moduleFailure,
  type ModuleErrorCode as ModuleErrorCodeType,
} from "@/lib/domain/modules/errors";

function errorResponse(error: ModuleErrorCodeType) {
  const failure = moduleFailure(error);
  return NextResponse.json(
    { error: failure.error, message: failure.message },
    { status: moduleErrorHttpStatus(failure.error) },
  );
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { id } = await context.params;
  const result = await listStudentModules(actor, { trainingId: id });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: moduleErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}

export async function PATCH(request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { id: moduleId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(ModuleErrorCode.VALIDATION_ERROR);
  }

  const status =
    body && typeof body === "object" && "status" in body
      ? (body as { status: "in_progress" | "completed" }).status
      : undefined;

  const result = await updateStudentModuleProgress(actor, {
    moduleId,
    status: status ?? "in_progress",
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: moduleErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}
