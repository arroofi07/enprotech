import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { approveUser } from "@/lib/application/users/approve-user";
import { userErrorHttpStatus } from "@/lib/application/users/error-http-status";
import { getUser } from "@/lib/application/users/get-user";
import { setUserStatus } from "@/lib/application/users/set-user-status";
import { updateUserRole } from "@/lib/application/users/update-user-role";
import {
  UserErrorCode,
  userFailure,
  type UserErrorCode as UserErrorCodeType,
} from "@/lib/domain/users/errors";

function errorResponse(error: UserErrorCodeType) {
  const failure = userFailure(error);
  return NextResponse.json(
    { error: failure.error, message: failure.message },
    { status: userErrorHttpStatus(failure.error) },
  );
}

const patchBodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve") }),
  z.object({
    action: z.literal("setRole"),
    role: z.enum(["admin", "trainer", "student"]),
  }),
  z.object({
    action: z.literal("setStatus"),
    status: z.enum(["active", "inactive"]),
  }),
]);

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { id } = await context.params;
  const result = await getUser(actor, { userId: id });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: userErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}

export async function PATCH(request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(UserErrorCode.VALIDATION_ERROR);
  }

  const parsed = patchBodySchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(UserErrorCode.VALIDATION_ERROR);
  }

  const payload = parsed.data;

  switch (payload.action) {
    case "approve": {
      const result = await approveUser(actor, { userId: id });
      if (!result.success) {
        return NextResponse.json(
          { error: result.error, message: result.message },
          { status: userErrorHttpStatus(result.error) },
        );
      }
      return NextResponse.json(result.data);
    }
    case "setRole": {
      const result = await updateUserRole(actor, {
        userId: id,
        role: payload.role,
      });
      if (!result.success) {
        return NextResponse.json(
          { error: result.error, message: result.message },
          { status: userErrorHttpStatus(result.error) },
        );
      }
      return NextResponse.json(result.data);
    }
    case "setStatus": {
      const result = await setUserStatus(actor, {
        userId: id,
        status: payload.status,
      });
      if (!result.success) {
        return NextResponse.json(
          { error: result.error, message: result.message },
          { status: userErrorHttpStatus(result.error) },
        );
      }
      return NextResponse.json(result.data);
    }
    default: {
      const _exhaustive: never = payload;
      return _exhaustive;
    }
  }
}
