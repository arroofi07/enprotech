import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { communityErrorHttpStatus } from "@/lib/application/community/error-http-status";
import { deleteMeeting } from "@/lib/application/community/delete-meeting";
import { updateMeeting } from "@/lib/application/community/update-meeting";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { id } = await context.params;

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

  const result = await updateMeeting(actor, id, body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: communityErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { id } = await context.params;
  const result = await deleteMeeting(actor, id);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: communityErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}
