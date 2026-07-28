import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { communityErrorHttpStatus } from "@/lib/application/community/error-http-status";
import { createMeeting } from "@/lib/application/community/create-meeting";
import { listMeetings } from "@/lib/application/community/list-meetings";

type RouteContext = {
  params: Promise<{ trainingId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { trainingId } = await context.params;
  const result = await listMeetings(actor, trainingId);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: communityErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}

export async function POST(request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { trainingId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: "Data yang dimasukkan tidak valid.",
      },
      { status: 400 },
    );
  }

  const result = await createMeeting(actor, trainingId, body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: communityErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data, { status: 201 });
}
