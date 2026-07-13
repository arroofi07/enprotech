import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { projectErrorHttpStatus } from "@/lib/application/projects/error-http-status";
import { uploadProjectFile } from "@/lib/application/projects/upload-project-file";
import { ProjectErrorCode, projectFailure } from "@/lib/domain/projects/errors";

export async function POST(request: Request) {
  const actor = await getCurrentUser();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    const failure = projectFailure(ProjectErrorCode.VALIDATION_ERROR);
    return NextResponse.json(
      { error: failure.error, message: failure.message },
      { status: projectErrorHttpStatus(failure.error) },
    );
  }

  const kind = String(formData.get("kind") ?? "");
  const file = formData.get("file");

  const result = await uploadProjectFile(
    actor,
    { kind },
    file instanceof File ? file : null,
  );

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: projectErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data, { status: 201 });
}
