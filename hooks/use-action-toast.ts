"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

type ActionToastState = {
  success?: boolean;
  error?: unknown;
  message?: string;
};

/**
 * Fires a sonner toast whenever a server-action state transitions to a new
 * value carrying a message. Success states use the success variant, states
 * with an error code use the error variant, and everything else falls back to
 * a neutral toast.
 */
export function useActionToast(state: ActionToastState): void {
  const lastStateRef = useRef<ActionToastState | null>(null);

  useEffect(() => {
    if (state === lastStateRef.current) {
      return;
    }
    lastStateRef.current = state;

    if (!state?.message) {
      return;
    }

    if (state.error) {
      toast.error(state.message);
      return;
    }

    if (state.success) {
      toast.success(state.message);
      return;
    }

    toast(state.message);
  }, [state]);
}
