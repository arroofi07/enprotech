import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";
import { IconArrowLeft } from "@tabler/icons-react";

import { CommunityRoomTabs } from "@/components/community/community-room-tabs";
import { StudentHeader } from "@/components/student/student-header";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listMeetings } from "@/lib/application/community/list-meetings";
import { listMessages } from "@/lib/application/community/list-messages";
import { listCommunityRooms } from "@/lib/application/community/list-community-rooms";
import { cn } from "@/lib/utils";

type StudentCommunityRoomPageProps = {
  params: Promise<{ trainingId: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function StudentCommunityRoomPage({
  params,
  searchParams,
}: StudentCommunityRoomPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { trainingId } = await params;
  const { tab } = await searchParams;

  const [roomsResult, messagesResult, meetingsResult] = await Promise.all([
    listCommunityRooms(user),
    listMessages(user, trainingId, { limit: 50 }),
    listMeetings(user, trainingId),
  ]);

  if (!roomsResult.success) {
    redirect("/unauthorized");
  }

  if (!messagesResult.success || !meetingsResult.success) {
    if (
      messagesResult.success === false &&
      messagesResult.error === "NOT_ENROLLED"
    ) {
      notFound();
    }
    if (
      meetingsResult.success === false &&
      meetingsResult.error === "NOT_ENROLLED"
    ) {
      notFound();
    }
    redirect("/unauthorized");
  }

  const room = roomsResult.data.find((item) => item.trainingId === trainingId);
  if (!room) {
    notFound();
  }

  const defaultTab = tab === "meetings" ? "meetings" : "chat";

  return (
    <>
      <StudentHeader
        title={room.trainingTitle}
        breadcrumbs={[
          { label: "Komunitas", href: "/student/community" },
          { label: room.trainingTitle },
        ]}
      />
      <main className="relative flex-1 overflow-auto">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_10%_0%,oklch(0.78_0.1_330/0.28),transparent_60%),radial-gradient(50%_40%_at_100%_20%,oklch(0.88_0.05_300/0.35),transparent_55%)]"
        />
        <div className="relative container max-w-5xl min-w-0 space-y-4 p-3 sm:space-y-5 sm:p-6 md:p-8">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1">
              <p className="text-[0.65rem] font-medium tracking-[0.16em] text-primary uppercase">
                Ruang komunitas
              </p>
              <h1 className="font-heading text-xl font-semibold tracking-tight wrap-break-word sm:truncate sm:text-3xl">
                {room.trainingTitle}
              </h1>
              <p className="text-sm text-muted-foreground">
                Diskusi realtime dan jadwal meeting antar peserta.
              </p>
            </div>
            <Link
              href="/student/community"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-full touch-manipulation gap-1.5 rounded-xl sm:w-auto",
              )}
            >
              <IconArrowLeft className="size-3.5" />
              Semua ruang
            </Link>
          </div>

          <Suspense
            fallback={
              <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                Memuat ruang diskusi…
              </div>
            }
          >
            <CommunityRoomTabs
              trainingId={trainingId}
              trainingTitle={room.trainingTitle}
              currentUserId={user.id}
              messages={messagesResult.data}
              meetings={meetingsResult.data}
              defaultTab={defaultTab}
            />
          </Suspense>
        </div>
      </main>
    </>
  );
}
