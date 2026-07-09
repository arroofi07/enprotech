import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { deleteModule } from "@/lib/application/modules/delete-module";
import { moduleErrorHttpStatus } from "@/lib/application/modules/error-http-status";
import { getModule } from "@/lib/application/modules/reorder-modules";
import { updateModule } from "@/lib/application/modules/update-module";
import {
  ModuleErrorCode,
  moduleFailure,
  type ModuleErrorCode as ModuleErrorCodeType,
} from "@/lib/domain/modules/errors";
import { listModulesByTraining } from "@/lib/infrastructure/db/repositories/module-repository";

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
  const result = await getModule(actor, { moduleId: id });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: moduleErrorHttpStatus(result.error) },
    );
  }

  const contents = await listModulesByTraining(result.data!.trainingId);
  const moduleWithContents = contents.find((item) => item.id === id);

  return NextResponse.json(moduleWithContents ?? result.data);
}

export async function PATCH(request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(ModuleErrorCode.VALIDATION_ERROR);
  }

  const result = await updateModule(actor, {
    moduleId: id,
    ...(body && typeof body === "object" ? body : {}),
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: moduleErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { id } = await context.params;
  const result = await deleteModule(actor, { moduleId: id });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: moduleErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}
