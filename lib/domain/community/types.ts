export const COMMUNITY_MESSAGE_MAX_LENGTH = 2000;
export const COMMUNITY_MEETING_TITLE_MAX_LENGTH = 200;
export const COMMUNITY_MEETING_DESCRIPTION_MAX_LENGTH = 2000;

export type CommunityMessageDto = {
  id: string;
  trainingId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export type CommunityMeetingDto = {
  id: string;
  trainingId: string;
  creatorId: string;
  creatorName: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  meetLink: string;
  createdAt: string;
  updatedAt: string;
};

export type CommunityRoomDto = {
  trainingId: string;
  trainingTitle: string;
  enrollmentStatus: string;
  enrolledAt: string;
};
