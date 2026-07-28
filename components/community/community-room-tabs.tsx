"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { IconCalendarEvent, IconMessages } from "@tabler/icons-react";

import { CommunityChatPanel } from "@/components/community/community-chat-panel";
import { CommunityMeetingList } from "@/components/community/community-meeting-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  CommunityMeetingDto,
  CommunityMessageDto,
} from "@/lib/domain/community/types";
import { cn } from "@/lib/utils";

type CommunityRoomTabsProps = {
  trainingId: string;
  trainingTitle: string;
  currentUserId: string;
  messages: CommunityMessageDto[];
  meetings: CommunityMeetingDto[];
  defaultTab?: "chat" | "meetings";
};

export function CommunityRoomTabs({
  trainingId,
  trainingTitle,
  currentUserId,
  messages,
  meetings,
  defaultTab = "chat",
}: CommunityRoomTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab =
    tabParam === "meetings" || tabParam === "chat" ? tabParam : defaultTab;

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        const next = value === "meetings" ? "meetings" : "chat";
        router.replace(`?tab=${next}`, { scroll: false });
      }}
      className="min-w-0 gap-3 sm:gap-4"
    >
      <TabsList
        variant="line"
        className="h-auto w-full justify-start gap-0 overflow-x-auto rounded-none border-b border-border/70 bg-transparent p-0"
      >
        <TabsTrigger
          value="chat"
          className={cn(
            "shrink-0 rounded-none px-2.5 py-2.5 text-xs data-active:shadow-none sm:px-3 sm:text-sm",
          )}
        >
          <IconMessages className="size-4" />
          Diskusi
        </TabsTrigger>
        <TabsTrigger
          value="meetings"
          className={cn(
            "shrink-0 rounded-none px-2.5 py-2.5 text-xs data-active:shadow-none sm:px-3 sm:text-sm",
          )}
        >
          <IconCalendarEvent className="size-4" />
          <span className="sm:hidden">Meeting</span>
          <span className="hidden sm:inline">Jadwal Meeting</span>
          {meetings.length > 0 ? (
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[0.65rem] tabular-nums text-muted-foreground">
              {meetings.length}
            </span>
          ) : null}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="chat" className="mt-0 min-w-0 outline-none">
        <CommunityChatPanel
          trainingId={trainingId}
          trainingTitle={trainingTitle}
          currentUserId={currentUserId}
          initialMessages={messages}
        />
      </TabsContent>
      <TabsContent value="meetings" className="mt-0 min-w-0 outline-none">
        <div className="rounded-xl border border-border/70 bg-card p-3 shadow-[0_18px_50px_-28px_oklch(0.45_0.16_330/0.35)] sm:rounded-2xl sm:p-5">
          <CommunityMeetingList
            trainingId={trainingId}
            currentUserId={currentUserId}
            meetings={meetings}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
