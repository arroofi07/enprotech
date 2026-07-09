import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import {
  commitEnrollmentsImport,
  previewEnrollmentsImport,
} from "@/lib/application/imports/excel-import";
import { importErrorHttpStatus } from "@/lib/application/imports/error-http-status";

export async function POST(request: Request) {
  const actor = await getCurrentUser();
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") ?? "preview";

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "File Excel wajib diupload." },
      { status: 400 },
    );
  }

  const buffer = await file.arrayBuffer();
  const result =
    mode === "commit"
      ? await commitEnrollmentsImport(actor, buffer)
      : await previewEnrollmentsImport(actor, buffer);

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
