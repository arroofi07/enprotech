import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { moduleErrorHttpStatus } from "@/lib/application/modules/error-http-status";
import { uploadModuleFile } from "@/lib/application/modules/upload-module-file";
import {
  ModuleErrorCode,
  moduleFailure,
} from "@/lib/domain/modules/errors";

export async function POST(request: Request) {
  const actor = await getCurrentUser();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    const failure = moduleFailure(ModuleErrorCode.VALIDATION_ERROR);
    return NextResponse.json(
      { error: failure.error, message: failure.message },
      { status: moduleErrorHttpStatus(failure.error) },
    );
  }

  const purpose = String(formData.get("purpose") ?? "");
  const file = formData.get("file");

  const result = await uploadModuleFile(
    actor,
    { purpose },
    file instanceof File ? file : null,
  );

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: moduleErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data, { status: 201 });
}
