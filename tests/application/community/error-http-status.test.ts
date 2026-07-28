import { describe, expect, it } from "vitest";

import { communityErrorHttpStatus } from "@/lib/application/community/error-http-status";
import { CommunityErrorCode } from "@/lib/domain/community/errors";

describe("communityErrorHttpStatus", () => {
  it("maps domain errors to http statuses", () => {
    expect(communityErrorHttpStatus(CommunityErrorCode.UNAUTHORIZED)).toBe(401);
    expect(communityErrorHttpStatus(CommunityErrorCode.FORBIDDEN)).toBe(403);
    expect(communityErrorHttpStatus(CommunityErrorCode.NOT_ENROLLED)).toBe(403);
    expect(communityErrorHttpStatus(CommunityErrorCode.MEETING_NOT_FOUND)).toBe(
      404,
    );
    expect(communityErrorHttpStatus(CommunityErrorCode.VALIDATION_ERROR)).toBe(
      400,
    );
  });
});
