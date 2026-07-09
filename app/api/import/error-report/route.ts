import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { buildErrorReportFromPreview } from "@/lib/application/imports/excel-import";
import { importErrorHttpStatus } from "@/lib/application/imports/error-http-status";
import { assertImportTrainerOrAdmin } from "@/lib/application/imports/assert-trainer-or-admin";
import type { ImportPreview } from "@/lib/domain/imports/types";

export async function POST(request: Request) {
  const actor = await getCurrentUser();
  const forbidden = assertImportTrainerOrAdmin(actor);
  if (forbidden) {
    return NextResponse.json(
      { error: forbidden.error, message: forbidden.message },
      { status: importErrorHttpStatus(forbidden.error) },
    );
  }

  let body: { preview?: ImportPreview<unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Data preview tidak valid." },
      { status: 400 },
    );
  }

  if (!body.preview?.rows) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Data preview tidak valid." },
      { status: 400 },
    );
  }

  const buffer = buildErrorReportFromPreview(body.preview);

  return new NextResponse(Buffer.from(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="import-errors.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
