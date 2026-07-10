"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { IconBell } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 30_000;

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  href: string | null;
  isRead: boolean;
  createdAt: string;
};

type NotificationResponse = {
  items: NotificationItem[];
  unreadCount: number;
};

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as NotificationResponse;
      setItems(data.items);
      setUnreadCount(data.unreadCount);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();
    const interval = window.setInterval(() => {
      void fetchNotifications();
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [fetchNotifications]);

  async function markAsRead(notificationId: string) {
    const response = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId }),
    });

    if (!response.ok) {
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === notificationId ? { ...item, isRead: true } : item,
      ),
    );
    setUnreadCount((current) => Math.max(0, current - 1));
  }

  async function markAllAsRead() {
    const response = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });

    if (!response.ok) {
      return;
    }

    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
  }

  function handleNotificationClick(notification: NotificationItem) {
    setOpen(false);

    if (!notification.isRead) {
      void markAsRead(notification.id);
    }

    if (notification.href) {
      router.push(notification.href);
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          void fetchNotifications();
        }
      }}
    >
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifikasi"
          />
        }
      >
        <IconBell className="size-5" />
        {unreadCount > 0 ? (
          <Badge className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full p-0 text-[10px]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        ) : null}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(24rem,calc(100vw-2rem))] gap-0 p-0"
      >
        <PopoverHeader className="flex shrink-0 flex-row items-center justify-between border-b px-4 py-3">
          <PopoverTitle>Notifikasi</PopoverTitle>
          {unreadCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              onClick={() => void markAllAsRead()}
            >
              Tandai semua dibaca
            </Button>
          ) : null}
        </PopoverHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {loading ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              Memuat notifikasi...
            </p>
          ) : items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              Belum ada notifikasi.
            </p>
          ) : (
            <div className="divide-y">
              {items.map((notification) => {
                const content = (
                  <div
                    className={cn(
                      "block px-4 py-3 transition-colors hover:bg-muted/50",
                      !notification.isRead && "bg-primary/5",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-medium">
                          {notification.title}
                        </p>
                        <p className="text-xs wrap-break-word text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.isRead ? (
                        <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                      ) : null}
                    </div>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: localeId,
                      })}
                    </p>
                  </div>
                );

                return (
                  <button
                    key={notification.id}
                    type="button"
                    className={cn(
                      "block w-full text-left",
                      notification.href && "cursor-pointer",
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
