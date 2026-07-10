import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { createModuleContent } from "@/lib/application/modules/create-module-content";
import { moduleErrorHttpStatus } from "@/lib/application/modules/error-http-status";
import { reorderModuleContents } from "@/lib/application/modules/reorder-module-contents";
import {
  ModuleErrorCode,
  moduleFailure,
  type ModuleErrorCode as ModuleErrorCodeType,
} from "@/lib/domain/modules/errors";
import { findModuleById } from "@/lib/infrastructure/db/repositories/module-repository";

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

export async function POST(request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(ModuleErrorCode.VALIDATION_ERROR);
  }

  const result = await createModuleContent(actor, {
    moduleId: id,
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

  const contentIds =
    body && typeof body === "object" && "contentIds" in body
      ? (body as { contentIds: string[] }).contentIds
      : [];

  const result = await reorderModuleContents(actor, {
    moduleId: id,
    contentIds,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: moduleErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}

export async function GET(_request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { id } = await context.params;

  const moduleRecord = await findModuleById(id);
  if (!moduleRecord) {
    return errorResponse(ModuleErrorCode.MODULE_NOT_FOUND);
  }

  const { listModulesByTraining } = await import(
    "@/lib/infrastructure/db/repositories/module-repository"
  );
  const modules = await listModulesByTraining(moduleRecord.trainingId);
  const found = modules.find((item) => item.id === id);

  if (!actor || (actor.role !== "admin" && actor.role !== "trainer")) {
    return errorResponse(ModuleErrorCode.FORBIDDEN);
  }

  return NextResponse.json(found ?? module);
}
