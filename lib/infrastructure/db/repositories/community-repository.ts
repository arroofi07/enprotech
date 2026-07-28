import { and, asc, count, desc, eq, gt, isNull, lt } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  communityMeetings,
  communityMessages,
} from "@/lib/db/schema/community";
import { enrollments, trainings } from "@/lib/db/schema/trainings";
import { users } from "@/lib/db/schema/users";
import type {
  CommunityMeetingDto,
  CommunityMessageDto,
  CommunityRoomDto,
} from "@/lib/domain/community/types";

function toMessageDto(row: {
  id: string;
  trainingId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: Date;
}): CommunityMessageDto {
  return {
    id: row.id,
    trainingId: row.trainingId,
    authorId: row.authorId,
    authorName: row.authorName,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
  };
}

function toMeetingDto(row: {
  id: string;
  trainingId: string;
  creatorId: string;
  creatorName: string;
  title: string;
  description: string | null;
  scheduledAt: Date;
  meetLink: string;
  createdAt: Date;
  updatedAt: Date;
}): CommunityMeetingDto {
  return {
    id: row.id,
    trainingId: row.trainingId,
    creatorId: row.creatorId,
    creatorName: row.creatorName,
    title: row.title,
    description: row.description,
    scheduledAt: row.scheduledAt.toISOString(),
    meetLink: row.meetLink,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listCommunityRoomsByStudent(
  studentId: string,
): Promise<CommunityRoomDto[]> {
  const rows = await db
    .select({
      trainingId: trainings.id,
      trainingTitle: trainings.title,
      enrollmentStatus: enrollments.status,
      enrolledAt: enrollments.enrolledAt,
    })
    .from(enrollments)
    .innerJoin(trainings, eq(enrollments.trainingId, trainings.id))
    .where(eq(enrollments.studentId, studentId))
    .orderBy(desc(enrollments.enrolledAt));

  return rows.map((row) => ({
    trainingId: row.trainingId,
    trainingTitle: row.trainingTitle,
    enrollmentStatus: row.enrollmentStatus,
    enrolledAt: row.enrolledAt.toISOString(),
  }));
}

export async function insertCommunityMessage(input: {
  trainingId: string;
  authorId: string;
  body: string;
}): Promise<CommunityMessageDto | null> {
  const [inserted] = await db
    .insert(communityMessages)
    .values({
      trainingId: input.trainingId,
      authorId: input.authorId,
      body: input.body,
    })
    .returning({
      id: communityMessages.id,
      trainingId: communityMessages.trainingId,
      authorId: communityMessages.authorId,
      body: communityMessages.body,
      createdAt: communityMessages.createdAt,
    });

  if (!inserted) {
    return null;
  }

  const [author] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, inserted.authorId))
    .limit(1);

  return toMessageDto({
    ...inserted,
    authorName: author?.name ?? "Peserta",
  });
}

export async function listCommunityMessages(input: {
  trainingId: string;
  limit: number;
  before?: string;
  after?: string;
}): Promise<CommunityMessageDto[]> {
  const conditions = [
    eq(communityMessages.trainingId, input.trainingId),
    isNull(communityMessages.deletedAt),
  ];

  if (input.before) {
    conditions.push(lt(communityMessages.createdAt, new Date(input.before)));
  }

  if (input.after) {
    conditions.push(gt(communityMessages.createdAt, new Date(input.after)));
  }

  const rows = await db
    .select({
      id: communityMessages.id,
      trainingId: communityMessages.trainingId,
      authorId: communityMessages.authorId,
      authorName: users.name,
      body: communityMessages.body,
      createdAt: communityMessages.createdAt,
    })
    .from(communityMessages)
    .innerJoin(users, eq(communityMessages.authorId, users.id))
    .where(and(...conditions))
    .orderBy(desc(communityMessages.createdAt))
    .limit(input.limit);

  // Return chronological order for the UI.
  return rows.reverse().map(toMessageDto);
}

export async function softDeleteCommunityMessage(input: {
  messageId: string;
  authorId: string;
}): Promise<boolean> {
  const [row] = await db
    .update(communityMessages)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(communityMessages.id, input.messageId),
        eq(communityMessages.authorId, input.authorId),
        isNull(communityMessages.deletedAt),
      ),
    )
    .returning({ id: communityMessages.id });

  return Boolean(row);
}

export async function listCommunityMeetings(
  trainingId: string,
): Promise<CommunityMeetingDto[]> {
  const rows = await db
    .select({
      id: communityMeetings.id,
      trainingId: communityMeetings.trainingId,
      creatorId: communityMeetings.creatorId,
      creatorName: users.name,
      title: communityMeetings.title,
      description: communityMeetings.description,
      scheduledAt: communityMeetings.scheduledAt,
      meetLink: communityMeetings.meetLink,
      createdAt: communityMeetings.createdAt,
      updatedAt: communityMeetings.updatedAt,
    })
    .from(communityMeetings)
    .innerJoin(users, eq(communityMeetings.creatorId, users.id))
    .where(eq(communityMeetings.trainingId, trainingId))
    .orderBy(asc(communityMeetings.scheduledAt));

  return rows.map(toMeetingDto);
}

export async function findCommunityMeetingById(
  meetingId: string,
): Promise<CommunityMeetingDto | null> {
  const [row] = await db
    .select({
      id: communityMeetings.id,
      trainingId: communityMeetings.trainingId,
      creatorId: communityMeetings.creatorId,
      creatorName: users.name,
      title: communityMeetings.title,
      description: communityMeetings.description,
      scheduledAt: communityMeetings.scheduledAt,
      meetLink: communityMeetings.meetLink,
      createdAt: communityMeetings.createdAt,
      updatedAt: communityMeetings.updatedAt,
    })
    .from(communityMeetings)
    .innerJoin(users, eq(communityMeetings.creatorId, users.id))
    .where(eq(communityMeetings.id, meetingId))
    .limit(1);

  return row ? toMeetingDto(row) : null;
}

export async function insertCommunityMeeting(input: {
  trainingId: string;
  creatorId: string;
  title: string;
  description: string | null;
  scheduledAt: Date;
  meetLink: string;
}): Promise<CommunityMeetingDto | null> {
  const [inserted] = await db
    .insert(communityMeetings)
    .values({
      trainingId: input.trainingId,
      creatorId: input.creatorId,
      title: input.title,
      description: input.description,
      scheduledAt: input.scheduledAt,
      meetLink: input.meetLink,
    })
    .returning({
      id: communityMeetings.id,
      trainingId: communityMeetings.trainingId,
      creatorId: communityMeetings.creatorId,
      title: communityMeetings.title,
      description: communityMeetings.description,
      scheduledAt: communityMeetings.scheduledAt,
      meetLink: communityMeetings.meetLink,
      createdAt: communityMeetings.createdAt,
      updatedAt: communityMeetings.updatedAt,
    });

  if (!inserted) {
    return null;
  }

  const [creator] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, inserted.creatorId))
    .limit(1);

  return toMeetingDto({
    ...inserted,
    creatorName: creator?.name ?? "Peserta",
  });
}

export async function updateCommunityMeeting(input: {
  meetingId: string;
  title: string;
  description: string | null;
  scheduledAt: Date;
  meetLink: string;
}): Promise<CommunityMeetingDto | null> {
  const [updated] = await db
    .update(communityMeetings)
    .set({
      title: input.title,
      description: input.description,
      scheduledAt: input.scheduledAt,
      meetLink: input.meetLink,
      updatedAt: new Date(),
    })
    .where(eq(communityMeetings.id, input.meetingId))
    .returning({
      id: communityMeetings.id,
      trainingId: communityMeetings.trainingId,
      creatorId: communityMeetings.creatorId,
      title: communityMeetings.title,
      description: communityMeetings.description,
      scheduledAt: communityMeetings.scheduledAt,
      meetLink: communityMeetings.meetLink,
      createdAt: communityMeetings.createdAt,
      updatedAt: communityMeetings.updatedAt,
    });

  if (!updated) {
    return null;
  }

  const [creator] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, updated.creatorId))
    .limit(1);

  return toMeetingDto({
    ...updated,
    creatorName: creator?.name ?? "Peserta",
  });
}

export async function deleteCommunityMeeting(
  meetingId: string,
): Promise<boolean> {
  const [row] = await db
    .delete(communityMeetings)
    .where(eq(communityMeetings.id, meetingId))
    .returning({ id: communityMeetings.id });

  return Boolean(row);
}

export async function countCommunityMeetings(
  trainingId: string,
): Promise<number> {
  const [result] = await db
    .select({ value: count() })
    .from(communityMeetings)
    .where(eq(communityMeetings.trainingId, trainingId));

  return result?.value ?? 0;
}
