import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { moduleErrorHttpStatus } from "@/lib/application/modules/error-http-status";
import { createModule } from "@/lib/application/modules/create-module";
import { listModules } from "@/lib/application/modules/list-modules";
import { reorderModules } from "@/lib/application/modules/reorder-modules";
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
  const result = await listModules(actor, { trainingId: id });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: moduleErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}

export async function POST(request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(ModuleErrorCode.VALIDATION_ERROR);
  }

  const result = await createModule(actor, {
  trainingId: id,
    ...(body && typeof body === "object" ? body : {}),
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: moduleErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data, { status: 201 });
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

  const moduleIds =
    body && typeof body === "object" && "moduleIds" in body
      ? (body as { moduleIds: string[] }).moduleIds
      : [];

  const result = await reorderModules(actor, {
    trainingId: id,
    moduleIds,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: moduleErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}
