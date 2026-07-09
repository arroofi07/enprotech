import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { createTraining } from "@/lib/application/trainings/create-training";
import { trainingErrorHttpStatus } from "@/lib/application/trainings/error-http-status";
import { listTrainings } from "@/lib/application/trainings/list-trainings";

export async function GET(request: Request) {
  const actor = await getCurrentUser();
  const { searchParams } = new URL(request.url);

  const result = await listTrainings(actor, {
    search: searchParams.get("search") ?? undefined,
    status: searchParams.get("status") ?? undefined,
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

export async function POST(request: Request) {
  const actor = await getCurrentUser();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Data tidak valid." },
      { status: 400 },
    );
  }

  const result = await createTraining(actor, body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: trainingErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data, { status: 201 });
}
