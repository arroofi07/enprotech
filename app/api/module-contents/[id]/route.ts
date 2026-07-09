import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { deleteModuleContent } from "@/lib/application/modules/delete-module-content";
import { moduleErrorHttpStatus } from "@/lib/application/modules/error-http-status";
import { updateModuleContent } from "@/lib/application/modules/update-module-content";
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

export async function PATCH(request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(ModuleErrorCode.VALIDATION_ERROR);
  }

  const result = await updateModuleContent(actor, {
    contentId: id,
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
  const result = await deleteModuleContent(actor, { contentId: id });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: moduleErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}
