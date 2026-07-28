"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  IconMessageCircle2,
  IconRefresh,
  IconSend,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getCommunityWsUrl } from "@/lib/community/ws-url";
import type { CommunityMessageDto } from "@/lib/domain/community/types";
import { COMMUNITY_MESSAGE_MAX_LENGTH } from "@/lib/domain/community/types";
import { cn } from "@/lib/utils";

type CommunityChatPanelProps = {
  trainingId: string;
  trainingTitle?: string;
  currentUserId: string;
  initialMessages: CommunityMessageDto[];
};

type ConnectionStatus = "connecting" | "connected" | "disconnected";

function formatMessageTime(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatDayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) {
    return "Hari ini";
  }
  if (sameDay(date, yesterday)) {
    return "Kemarin";
  }

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function dayKey(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function avatarTone(seed: string): string {
  const tones = [
    "bg-primary/15 text-primary",
    "bg-chart-2/20 text-chart-2",
    "bg-chart-3/20 text-chart-3",
    "bg-accent text-accent-foreground",
    "bg-secondary text-secondary-foreground",
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % tones.length;
  }
  return tones[hash] ?? tones[0]!;
}

export function CommunityChatPanel({
  trainingId,
  trainingTitle,
  currentUserId,
  initialMessages,
}: CommunityChatPanelProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = useEffectEvent(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const upsertMessage = useEffectEvent((message: CommunityMessageDto) => {
    setMessages((prev) => {
      if (prev.some((item) => item.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });
  });

  const loadHistory = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/community/trainings/${trainingId}/messages?limit=50`,
      );
      if (!response.ok) {
        throw new Error("Gagal memuat riwayat chat.");
      }
      const data = (await response.json()) as CommunityMessageDto[];
      startTransition(() => {
        setMessages(data);
        setError(null);
      });
    } catch {
      setError("Gagal memuat riwayat chat.");
    }
  }, [trainingId]);

  useEffect(() => {
    let cancelled = false;

    const connect = () => {
      if (cancelled) {
        return;
      }

      setStatus("connecting");
      const url = getCommunityWsUrl();
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.addEventListener("open", () => {
        if (cancelled) {
          return;
        }
        setStatus("connected");
        setError(null);
        socket.send(JSON.stringify({ type: "join", trainingId }));
      });

      socket.addEventListener("message", (event) => {
        let payload: unknown;
        try {
          payload = JSON.parse(String(event.data));
        } catch {
          return;
        }

        if (!payload || typeof payload !== "object" || !("type" in payload)) {
          return;
        }

        const type = (payload as { type: string }).type;
        if (type === "message") {
          const message = (payload as { payload?: CommunityMessageDto })
            .payload;
          if (message) {
            upsertMessage(message);
          }
          return;
        }

        if (type === "error") {
          const maybeMessage = (payload as { message?: unknown }).message;
          const message =
            typeof maybeMessage === "string"
              ? maybeMessage
              : "Terjadi kesalahan pada chat.";
          setError(message);
        }
      });

      socket.addEventListener("close", () => {
        if (cancelled) {
          return;
        }
        setStatus("disconnected");
        reconnectTimer.current = setTimeout(connect, 2_500);
      });

      socket.addEventListener("error", () => {
        socket.close();
      });
    };

    connect();

    const heartbeat = setInterval(() => {
      const socket = socketRef.current;
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "ping" }));
      }
    }, 25_000);

    return () => {
      cancelled = true;
      clearInterval(heartbeat);
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [trainingId]);

  function handleSend() {
    const body = draft.trim();
    if (!body) {
      return;
    }

    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError("Koneksi chat terputus. Coba refresh atau kirim ulang.");
      return;
    }

    socket.send(JSON.stringify({ type: "message", body }));
    setDraft("");
  }

  const remaining = COMMUNITY_MESSAGE_MAX_LENGTH - draft.length;

  return (
    <div className="flex h-[min(calc(100dvh-11.5rem),36rem)] flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-[0_18px_50px_-28px_oklch(0.45_0.16_330/0.45)] sm:h-[min(calc(100dvh-13rem),42rem)] sm:rounded-2xl md:h-[min(78dvh,45rem)]">
      <header className="relative overflow-hidden border-b border-border/60 px-3 py-3 sm:px-5 sm:py-3.5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,oklch(0.72_0.14_330/0.22),transparent_55%),radial-gradient(90%_70%_at_100%_0%,oklch(0.82_0.08_300/0.18),transparent_50%)]"
        />
        <div className="relative flex items-start justify-between gap-2 sm:items-center sm:gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[0.65rem] font-medium tracking-[0.14em] text-primary uppercase">
              Diskusi peserta
            </p>
            <h2 className="truncate font-heading text-sm font-semibold tracking-tight sm:text-lg">
              {trainingTitle ?? "Ruang komunitas"}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <span
              className={cn(
                "inline-flex max-w-[9.5rem] items-center gap-1.5 rounded-full px-2 py-1 text-[0.65rem] font-medium ring-1 ring-inset sm:max-w-none sm:px-2.5",
                status === "connected" &&
                  "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25",
                status === "connecting" &&
                  "bg-amber-500/10 text-amber-700 ring-amber-500/25",
                status === "disconnected" &&
                  "bg-destructive/10 text-destructive ring-destructive/20",
              )}
            >
              <span
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  status === "connected" && "bg-emerald-500 animate-pulse",
                  status === "connecting" && "bg-amber-500 animate-pulse",
                  status === "disconnected" && "bg-destructive",
                )}
              />
              <span className="truncate">
                {status === "connected"
                  ? "Realtime"
                  : status === "connecting"
                    ? "Menghubungkan"
                    : "Terputus"}
              </span>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="touch-manipulation"
              onClick={() => void loadHistory()}
              aria-label="Muat ulang riwayat"
            >
              <IconRefresh className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <div
        ref={listRef}
        className="relative flex-1 overflow-y-auto bg-[linear-gradient(180deg,oklch(0.98_0.02_330)_0%,oklch(0.96_0.03_330)_100%)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(oklch(0.55_0.12_330/0.12)_1px,transparent_1px)] bg-size-[18px_18px] opacity-[0.35]"
        />

        <div className="relative space-y-1 px-2.5 py-3 sm:px-5 sm:py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center sm:px-6 sm:py-16">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner sm:size-14">
                <IconMessageCircle2 className="size-6 sm:size-7" />
              </span>
              <div className="space-y-1">
                <p className="font-heading text-sm font-semibold">
                  Mulai diskusi pertama
                </p>
                <p className="max-w-xs text-xs text-muted-foreground">
                  Sapa teman se-training, bagikan pertanyaan, atau koordinasikan
                  belajar bersama di sini.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => {
              const mine = message.authorId === currentUserId;
              const prev = messages[index - 1];
              const next = messages[index + 1];
              const showDay =
                !prev || dayKey(prev.createdAt) !== dayKey(message.createdAt);
              const isFirstInGroup =
                !prev ||
                prev.authorId !== message.authorId ||
                dayKey(prev.createdAt) !== dayKey(message.createdAt);
              const isLastInGroup =
                !next ||
                next.authorId !== message.authorId ||
                dayKey(next.createdAt) !== dayKey(message.createdAt);

              return (
                <div key={message.id} className="min-w-0">
                  {showDay ? (
                    <div className="my-3 flex items-center justify-center sm:my-4">
                      <span className="max-w-[90%] truncate rounded-full bg-background/80 px-2.5 py-1 text-[0.65rem] font-medium text-muted-foreground shadow-sm ring-1 ring-border/60 backdrop-blur sm:px-3">
                        {formatDayLabel(message.createdAt)}
                      </span>
                    </div>
                  ) : null}

                  <div
                    className={cn(
                      "flex min-w-0 gap-1.5 sm:gap-2",
                      mine ? "flex-row-reverse" : "flex-row",
                      isFirstInGroup ? "mt-3" : "mt-0.5",
                    )}
                  >
                    {!mine ? (
                      <div
                        className={cn(
                          "mt-auto flex size-7 shrink-0 items-center justify-center rounded-full text-[0.6rem] font-semibold sm:size-8 sm:text-[0.65rem]",
                          isLastInGroup
                            ? avatarTone(message.authorId)
                            : "invisible",
                        )}
                        aria-hidden={!isLastInGroup}
                      >
                        {isLastInGroup ? initials(message.authorName) : null}
                      </div>
                    ) : null}

                    <div
                      className={cn(
                        "flex min-w-0 flex-col gap-0.5",
                        mine
                          ? "max-w-[min(92%,22rem)] items-end sm:max-w-[min(80%,28rem)]"
                          : "max-w-[min(88%,22rem)] items-start sm:max-w-[min(80%,28rem)]",
                      )}
                    >
                      {isFirstInGroup && !mine ? (
                        <span className="max-w-full truncate px-1 text-[0.7rem] font-medium text-muted-foreground">
                          {message.authorName}
                        </span>
                      ) : null}

                      <div
                        className={cn(
                          "max-w-full px-3 py-2 text-[0.8125rem] leading-relaxed wrap-break-word whitespace-pre-wrap shadow-sm sm:px-3.5 sm:text-sm",
                          mine
                            ? "rounded-2xl rounded-br-md bg-primary text-primary-foreground"
                            : "rounded-2xl rounded-bl-md bg-background text-foreground ring-1 ring-border/70",
                          !isFirstInGroup && mine && "rounded-tr-md",
                          !isFirstInGroup && !mine && "rounded-tl-md",
                          !isLastInGroup && mine && "rounded-br-2xl",
                          !isLastInGroup && !mine && "rounded-bl-2xl",
                        )}
                      >
                        {message.body}
                      </div>

                      {isLastInGroup ? (
                        <span className="px-1 text-[0.65rem] text-muted-foreground/80">
                          {formatMessageTime(message.createdAt)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {error ? (
        <div className="border-t border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive sm:px-4">
          {error}
        </div>
      ) : null}

      <footer className="border-t border-border/60 bg-card/95 p-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur sm:p-4 sm:pb-4">
        <div className="rounded-xl bg-muted/40 p-1.5 ring-1 ring-border/50 focus-within:ring-2 focus-within:ring-ring/30 sm:rounded-2xl sm:p-2">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Tulis pesan…"
            maxLength={COMMUNITY_MESSAGE_MAX_LENGTH}
            rows={2}
            className="min-h-14 resize-none border-0 bg-transparent px-2.5 py-2 text-sm shadow-none focus-visible:ring-0 sm:min-h-18"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="flex items-center justify-between gap-2 px-1 pb-0.5 sm:px-1.5 sm:pb-1">
            <p className="min-w-0 truncate text-[0.65rem] text-muted-foreground">
              <span className="sm:hidden">Ketuk Kirim untuk mengirim</span>
              <span className="hidden sm:inline">
                Enter kirim · Shift+Enter baris baru
              </span>
              {draft.length > 0 ? (
                <span className="ml-2 tabular-nums opacity-70">{remaining}</span>
              ) : null}
            </p>
            <Button
              type="button"
              size="sm"
              className="h-8 shrink-0 touch-manipulation gap-1.5 rounded-xl px-3"
              onClick={handleSend}
              disabled={!draft.trim() || status !== "connected"}
            >
              Kirim
              <IconSend className="size-3.5" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
