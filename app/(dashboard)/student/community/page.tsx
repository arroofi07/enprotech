import { redirect } from "next/navigation";

import { CommunityRoomList } from "@/components/community/community-room-list";
import { StudentHeader } from "@/components/student/student-header";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listCommunityRooms } from "@/lib/application/community/list-community-rooms";

export default async function StudentCommunityPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const result = await listCommunityRooms(user);
  if (!result.success) {
    redirect("/unauthorized");
  }

  return (
    <>
      <StudentHeader
        title="Komunitas"
        breadcrumbs={[{ label: "Komunitas" }]}
      />
      <main className="relative flex-1 overflow-auto">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_10%_0%,oklch(0.78_0.1_330/0.28),transparent_60%),radial-gradient(50%_40%_at_100%_10%,oklch(0.88_0.05_300/0.35),transparent_55%)]"
        />
        <div className="relative container max-w-3xl min-w-0 space-y-5 p-3 sm:space-y-6 sm:p-6 md:p-8">
          <div className="space-y-2">
            <p className="text-[0.65rem] font-medium tracking-[0.16em] text-primary uppercase">
              Komunitas peserta
            </p>
            <h1 className="font-heading text-xl font-semibold tracking-tight sm:text-3xl">
              Ruang diskusi
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Pilih training untuk berdiskusi realtime dan mengatur jadwal
              meeting bersama peserta lain.
            </p>
          </div>
          <CommunityRoomList rooms={result.data} />
        </div>
      </main>
    </>
  );
}
