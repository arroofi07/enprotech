import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { downloadImportTemplate } from "@/lib/application/imports/excel-import";
import { importErrorHttpStatus } from "@/lib/application/imports/error-http-status";
import type { ImportKind } from "@/lib/domain/imports/types";

type RouteContext = {
  params: Promise<{ type: string }>;
};

const VALID_TYPES = new Set<ImportKind>(["questions", "enrollments", "scores"]);

export async function GET(_request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { type } = await context.params;

  if (!VALID_TYPES.has(type as ImportKind)) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Jenis template tidak valid." },
      { status: 400 },
    );
  }

  const result = await downloadImportTemplate(actor, type as ImportKind);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: importErrorHttpStatus(result.error) },
    );
  }

  const { buffer, contentType, filename } = result.data;

  return new NextResponse(Buffer.from(buffer), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
