import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listStudentCertificates } from "@/lib/application/certificates/list-student-certificates";
import { certificateErrorHttpStatus } from "@/lib/application/certificates/error-http-status";

export async function GET(request: Request) {
  const actor = await getCurrentUser();
  const { searchParams } = new URL(request.url);

  const result = await listStudentCertificates(actor, {
    trainingId: searchParams.get("trainingId") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: certificateErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}
