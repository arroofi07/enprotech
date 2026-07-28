import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { communityErrorHttpStatus } from "@/lib/application/community/error-http-status";
import { listCommunityRooms } from "@/lib/application/community/list-community-rooms";

export async function GET() {
  const actor = await getCurrentUser();
  const result = await listCommunityRooms(actor);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: communityErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}
