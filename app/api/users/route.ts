import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { userErrorHttpStatus } from "@/lib/application/users/error-http-status";
import { listUsers } from "@/lib/application/users/list-users";

export async function GET(request: Request) {
  const actor = await getCurrentUser();
  const { searchParams } = new URL(request.url);

  const result = await listUsers(actor, {
    search: searchParams.get("search") ?? undefined,
    role: searchParams.get("role") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: userErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}
