import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { exportTrainingReport } from "@/lib/application/reports/export-training-report";
import { reportErrorHttpStatus } from "@/lib/application/reports/error-http-status";

export async function GET(request: Request) {
  const actor = await getCurrentUser();
  const { searchParams } = new URL(request.url);

  const result = await exportTrainingReport(actor, {
    studentId: searchParams.get("studentId") ?? undefined,
    trainingId: searchParams.get("trainingId") ?? undefined,
    moduleId: searchParams.get("moduleId") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
    format: searchParams.get("format") ?? undefined,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: reportErrorHttpStatus(result.error) },
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
