"use client";

import { useActionState, useEffect, useState } from "react";
import {
  IconExternalLink,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { toast } from "sonner";

import {
  deleteCommunityMeetingAction,
  type CommunityMeetingActionState,
} from "@/app/actions/community";
import { CommunityMeetingFormDialog } from "@/components/community/community-meeting-form";
import { Button, buttonVariants } from "@/components/ui/button";
import type { CommunityMeetingDto } from "@/lib/domain/community/types";
import { formatVideoConferenceSchedule } from "@/lib/domain/modules/format-video-conference-schedule";
import { cn } from "@/lib/utils";

type CommunityMeetingListProps = {
  trainingId: string;
  currentUserId: string;
  meetings: CommunityMeetingDto[];
};

const deleteInitial: CommunityMeetingActionState = {};

function DeleteMeetingButton({
  meeting,
}: {
  meeting: CommunityMeetingDto;
}) {
  const [state, formAction, pending] = useActionState(
    deleteCommunityMeetingAction,
    deleteInitial,
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.message ?? "Jadwal dihapus.");
    } else if (state.message && state.error) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="meetingId" value={meeting.id} />
      <input type="hidden" name="trainingId" value={meeting.trainingId} />
      <Button
        type="submit"
        variant="ghost"
        size="icon-sm"
        className="touch-manipulation"
        disabled={pending}
        aria-label="Hapus jadwal"
      >
        <IconTrash className="size-4" />
      </Button>
    </form>
  );
}

function MeetingRow({
  meeting,
  currentUserId,
  trainingId,
}: {
  meeting: CommunityMeetingDto;
  currentUserId: string;
  trainingId: string;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const isOwner = meeting.creatorId === currentUserId;
  const scheduledLabel = formatVideoConferenceSchedule(
    new Date(meeting.scheduledAt),
  );
  const isPast = new Date(meeting.scheduledAt).getTime() < Date.now();

  return (
    <li className="space-y-3 px-3 py-3 sm:px-4">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-medium wrap-break-word">{meeting.title}</p>
          <p className="text-xs text-muted-foreground wrap-break-word">
            {scheduledLabel}
          </p>
          <p className="text-xs text-muted-foreground">
            Dibuat oleh {meeting.creatorName}
            {isPast ? " · sudah lewat" : ""}
          </p>
          {meeting.description ? (
            <p className="text-sm text-muted-foreground wrap-break-word">
              {meeting.description}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
          <a
            href={meeting.meetLink}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "touch-manipulation",
            )}
          >
            <IconExternalLink className="size-3.5" />
            Buka link
          </a>
          {isOwner ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="touch-manipulation"
                aria-label="Ubah jadwal"
                onClick={() => setEditOpen(true)}
              >
                <IconPencil className="size-4" />
              </Button>
              <CommunityMeetingFormDialog
                trainingId={trainingId}
                meeting={meeting}
                open={editOpen}
                onOpenChange={setEditOpen}
              />
              <DeleteMeetingButton meeting={meeting} />
            </>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export function CommunityMeetingList({
  trainingId,
  currentUserId,
  meetings,
}: CommunityMeetingListProps) {
  const upcoming = meetings.filter(
    (meeting) => new Date(meeting.scheduledAt).getTime() >= Date.now(),
  );
  const past = meetings.filter(
    (meeting) => new Date(meeting.scheduledAt).getTime() < Date.now(),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Jadwal meeting yang dibuat peserta di training ini.
        </p>
        <div className="w-full sm:w-auto">
          <CommunityMeetingFormDialog trainingId={trainingId} />
        </div>
      </div>

      {meetings.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground sm:rounded-lg sm:p-8">
          Belum ada jadwal meeting. Buat jadwal pertama untuk teman se-training.
        </div>
      ) : (
        <div className="space-y-4">
          {upcoming.length > 0 ? (
            <section className="space-y-2">
              <h3 className="text-sm font-medium">Mendatang</h3>
              <ul className="divide-y overflow-hidden rounded-xl border sm:rounded-lg">
                {upcoming.map((meeting) => (
                  <MeetingRow
                    key={meeting.id}
                    meeting={meeting}
                    currentUserId={currentUserId}
                    trainingId={trainingId}
                  />
                ))}
              </ul>
            </section>
          ) : null}
          {past.length > 0 ? (
            <section className="space-y-2">
              <h3 className="text-sm font-medium">Sebelumnya</h3>
              <ul className="divide-y overflow-hidden rounded-xl border opacity-80 sm:rounded-lg">
                {past.map((meeting) => (
                  <MeetingRow
                    key={meeting.id}
                    meeting={meeting}
                    currentUserId={currentUserId}
                    trainingId={trainingId}
                  />
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
