import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { communityErrorHttpStatus } from "@/lib/application/community/error-http-status";
import { listMessages } from "@/lib/application/community/list-messages";

type RouteContext = {
  params: Promise<{ trainingId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { trainingId } = await context.params;
  const { searchParams } = new URL(request.url);

  const result = await listMessages(actor, trainingId, {
    limit: searchParams.get("limit") ?? undefined,
    before: searchParams.get("before") ?? undefined,
    after: searchParams.get("after") ?? undefined,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: communityErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}
