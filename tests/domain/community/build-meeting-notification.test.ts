import { describe, expect, it } from "vitest";

import { buildCommunityMeetingScheduledNotification } from "@/lib/domain/notifications/build-notifications";
import { NotificationType } from "@/lib/domain/notifications/types";

describe("buildCommunityMeetingScheduledNotification", () => {
  it("builds a notification pointing to the community meetings tab", () => {
    const payload = buildCommunityMeetingScheduledNotification({
      trainingId: "t1",
      trainingName: "Training A",
      meetingId: "m1",
      meetingTitle: "Sync",
      creatorName: "Budi",
      scheduledAt: "2026-07-20T07:30:00.000Z",
      scheduledLabel: "Senin, 20 Juli 2026 pukul 14.30 WIB",
    });

    expect(payload.type).toBe(NotificationType.COMMUNITY_MEETING_SCHEDULED);
    expect(payload.data.href).toBe("/student/community/t1?tab=meetings");
    expect(payload.message).toContain("Budi");
    expect(payload.message).toContain("Sync");
  });
});
