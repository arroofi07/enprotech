"use client";

import Link from "next/link";
import { IconChevronRight, IconUsersGroup } from "@tabler/icons-react";

import type { CommunityRoomDto } from "@/lib/domain/community/types";

type CommunityRoomListProps = {
  rooms: CommunityRoomDto[];
};

const STATUS_LABEL: Record<string, string> = {
  enrolled: "Terdaftar",
  in_progress: "Berjalan",
  completed: "Selesai",
};

export function CommunityRoomList({ rooms }: CommunityRoomListProps) {
  if (rooms.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-card/60 p-10 text-center">
        <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <IconUsersGroup className="size-6" />
        </span>
        <p className="font-heading text-sm font-semibold">Belum ada ruang</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Daftar ke training terlebih dahulu untuk bergabung ke komunitas.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-3">
      {rooms.map((room) => (
        <li key={room.trainingId}>
          <Link
            href={`/student/community/${room.trainingId}`}
            className="group flex min-w-0 items-center gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-[0_12px_40px_-28px_oklch(0.45_0.16_330/0.4)] transition-[transform,box-shadow,background-color] hover:-translate-y-0.5 hover:bg-accent/30 hover:shadow-[0_18px_44px_-24px_oklch(0.45_0.16_330/0.55)] sm:gap-4 sm:rounded-2xl sm:p-4"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/15 sm:size-11 sm:rounded-2xl">
              <IconUsersGroup className="size-4 sm:size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-heading text-sm font-semibold tracking-tight sm:text-base">
                {room.trainingTitle}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {STATUS_LABEL[room.enrollmentStatus] ?? room.enrollmentStatus}
                <span className="hidden sm:inline"> · masuk ruang diskusi</span>
              </span>
            </span>
            <IconChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
