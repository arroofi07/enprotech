"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  createCommunityMeetingAction,
  updateCommunityMeetingAction,
  type CommunityMeetingActionState,
} from "@/app/actions/community";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CommunityMeetingDto } from "@/lib/domain/community/types";
import { toDateTimeLocalValue } from "@/lib/domain/modules/format-video-conference-schedule";

type CommunityMeetingFormDialogProps = {
  trainingId: string;
  meeting?: CommunityMeetingDto;
  triggerLabel?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const initialState: CommunityMeetingActionState = {};

export function CommunityMeetingFormDialog({
  trainingId,
  meeting,
  triggerLabel = "Buat jadwal",
  open: controlledOpen,
  onOpenChange,
}: CommunityMeetingFormDialogProps) {
  const isEdit = Boolean(meeting);
  const action = isEdit
    ? updateCommunityMeetingAction
    : createCommunityMeetingAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  useEffect(() => {
    if (state.success) {
      toast.success(state.message ?? "Berhasil disimpan.");
      setOpen(false);
    } else if (state.message && state.error) {
      toast.error(state.message);
    }
  }, [state, setOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined ? (
        <DialogTrigger
          render={
            <Button type="button" className="w-full touch-manipulation sm:w-auto" />
          }
        >
          {triggerLabel}
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Ubah jadwal meeting" : "Buat jadwal meeting"}
          </DialogTitle>
          <DialogDescription>
            Tambahkan judul, waktu (WIB), dan link Meet/Zoom untuk peserta
            training ini.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="trainingId" value={trainingId} />
          {meeting ? (
            <input type="hidden" name="meetingId" value={meeting.id} />
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="title">Judul</Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={meeting?.title ?? ""}
              placeholder="Diskusi modul 1"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="scheduledAt">Jadwal (WIB)</Label>
            <Input
              id="scheduledAt"
              name="scheduledAt"
              type="datetime-local"
              required
              defaultValue={
                meeting
                  ? toDateTimeLocalValue(new Date(meeting.scheduledAt))
                  : ""
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="meetLink">Link meeting</Label>
            <Input
              id="meetLink"
              name="meetLink"
              type="url"
              required
              defaultValue={meeting?.meetLink ?? ""}
              placeholder="https://meet.google.com/..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Deskripsi (opsional)</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={meeting?.description ?? ""}
              placeholder="Agenda singkat…"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan…" : isEdit ? "Simpan" : "Buat jadwal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
