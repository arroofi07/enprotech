"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SOUND_SRC = "/sounds/notification.mp3";
const MUTED_KEY = "enprotech:notification-sound-muted";
const PRIMED_KEY = "enprotech:notification-primed";
const LAST_HEARD_KEY = "enprotech:notification-last-heard-at";

/**
 * Plays a chime when a notification newer than any seen before arrives.
 *
 * The bell is mounted per page rather than in a layout, so it remounts on every
 * navigation. Both the baseline and the primed flag therefore live in
 * sessionStorage instead of refs — refs would reset on each remount and chime
 * on every page change.
 */
export function useNotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mutedRef = useRef(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(MUTED_KEY) === "true";
    mutedRef.current = stored;
    setMuted(stored);
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted((current) => {
      const next = !current;
      mutedRef.current = next;
      window.localStorage.setItem(MUTED_KEY, String(next));
      return next;
    });
  }, []);

  /**
   * Call after every fetch with the createdAt of the newest unread
   * notification, or undefined when there are none. Chimes at most once per
   * call regardless of how many notifications arrived in the same batch.
   */
  const announce = useCallback((newestUnreadAt: string | undefined) => {
    // Tracked separately from the baseline: a session that starts with an empty
    // inbox has nothing to take a baseline from, and must still not treat its
    // first genuinely new notification as backlog.
    const primed = window.sessionStorage.getItem(PRIMED_KEY) === "true";
    window.sessionStorage.setItem(PRIMED_KEY, "true");

    if (!newestUnreadAt) {
      return;
    }

    const newest = new Date(newestUnreadAt).getTime();
    if (!Number.isFinite(newest)) {
      return;
    }

    const stored = window.sessionStorage.getItem(LAST_HEARD_KEY);
    const baseline = stored === null ? 0 : Number(stored);

    if (newest <= baseline) {
      return;
    }

    // Only ever moves forward. Reading the newest notification makes an older
    // one the newest unread, and that must not re-arm the chime for it.
    window.sessionStorage.setItem(LAST_HEARD_KEY, String(newest));

    // First sync of the session only establishes the baseline: an unread
    // backlog from before the tab opened is not "new".
    if (!primed || mutedRef.current) {
      return;
    }

    audioRef.current ??= new Audio(SOUND_SRC);
    const audio = audioRef.current;
    audio.currentTime = 0;
    // Rejects until the user has interacted with the page (autoplay policy).
    void audio.play().catch(() => {});
  }, []);

  return { muted, toggleMuted, announce };
}
