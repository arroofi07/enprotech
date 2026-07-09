import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { getStudentReportDetail } from "@/lib/application/reports/get-student-report-detail";
import { listTrainingReport } from "@/lib/application/reports/list-training-report";
import { reportErrorHttpStatus } from "@/lib/application/reports/error-http-status";

export async function GET(request: Request) {
  const actor = await getCurrentUser();
  const { searchParams } = new URL(request.url);
  const detail = searchParams.get("detail");

  if (detail === "student") {
    const result = await getStudentReportDetail(actor, {
      studentId: searchParams.get("studentId") ?? undefined,
      trainingId: searchParams.get("trainingId") ?? undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, message: result.message },
        { status: reportErrorHttpStatus(result.error) },
      );
    }

    return NextResponse.json(result.data);
  }

  const result = await listTrainingReport(actor, {
    studentId: searchParams.get("studentId") ?? undefined,
    trainingId: searchParams.get("trainingId") ?? undefined,
    moduleId: searchParams.get("moduleId") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: reportErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}
