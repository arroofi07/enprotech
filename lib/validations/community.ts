import { z } from "zod";

import {
  COMMUNITY_MEETING_DESCRIPTION_MAX_LENGTH,
  COMMUNITY_MEETING_TITLE_MAX_LENGTH,
  COMMUNITY_MESSAGE_MAX_LENGTH,
} from "@/lib/domain/community/types";

function emptyToUndefined(value: unknown): unknown {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}

export const sendCommunityMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Pesan tidak boleh kosong.")
    .max(COMMUNITY_MESSAGE_MAX_LENGTH, "Pesan terlalu panjang."),
});

export const listCommunityMessagesSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  before: z.preprocess(emptyToUndefined, z.string().datetime().optional()),
  after: z.preprocess(emptyToUndefined, z.string().datetime().optional()),
});

export const createCommunityMeetingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Judul wajib diisi.")
    .max(COMMUNITY_MEETING_TITLE_MAX_LENGTH, "Judul terlalu panjang."),
  description: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .max(
        COMMUNITY_MEETING_DESCRIPTION_MAX_LENGTH,
        "Deskripsi terlalu panjang.",
      )
      .optional(),
  ),
  scheduledAt: z.string().min(1, "Jadwal wajib diisi."),
  meetLink: z
    .string()
    .trim()
    .url("Link meeting tidak valid.")
    .refine(
      (value) => value.startsWith("http://") || value.startsWith("https://"),
      "Link meeting harus memakai http atau https.",
    ),
});

export const updateCommunityMeetingSchema = createCommunityMeetingSchema;

export type SendCommunityMessageInput = z.infer<
  typeof sendCommunityMessageSchema
>;
export type ListCommunityMessagesInput = z.infer<
  typeof listCommunityMessagesSchema
>;
export type CreateCommunityMeetingInput = z.infer<
  typeof createCommunityMeetingSchema
>;
export type UpdateCommunityMeetingInput = z.infer<
  typeof updateCommunityMeetingSchema
>;
