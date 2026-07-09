import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listNotifications } from "@/lib/application/notifications/list-notifications";
import { updateNotifications } from "@/lib/application/notifications/update-notifications";
import { notificationErrorHttpStatus } from "@/lib/application/notifications/error-http-status";

export async function GET() {
  const actor = await getCurrentUser();
  const result = await listNotifications(actor);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: notificationErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}

export async function PATCH(request: Request) {
  const actor = await getCurrentUser();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Data yang dimasukkan tidak valid." },
      { status: 400 },
    );
  }

  const result = await updateNotifications(actor, body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: notificationErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}
