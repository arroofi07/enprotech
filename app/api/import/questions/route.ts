import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import {
  commitQuestionsImport,
  previewQuestionsImport,
} from "@/lib/application/imports/excel-import";
import { importErrorHttpStatus } from "@/lib/application/imports/error-http-status";

async function readUploadFile(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const assessmentId = formData.get("assessmentId");

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  const buffer = await file.arrayBuffer();
  return {
    buffer,
    assessmentId: typeof assessmentId === "string" ? assessmentId : "",
  };
}

export async function POST(request: Request) {
  const actor = await getCurrentUser();
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") ?? "preview";

  const upload = await readUploadFile(request);
  if (!upload) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "File Excel wajib diupload." },
      { status: 400 },
    );
  }

  const input = { assessmentId: upload.assessmentId };
  const result =
    mode === "commit"
      ? await commitQuestionsImport(actor, input, upload.buffer)
      : await previewQuestionsImport(actor, input, upload.buffer);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: importErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data, {
    status: mode === "commit" ? 201 : 200,
  });
}
