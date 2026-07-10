import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listEnrolledTrainings } from "@/lib/application/trainings/list-enrolled-trainings";
import { trainingErrorHttpStatus } from "@/lib/application/trainings/error-http-status";

export async function GET(request: Request) {
  const actor = await getCurrentUser();
  const { searchParams } = new URL(request.url);
  const result = await listEnrolledTrainings(actor, {
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: trainingErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}
