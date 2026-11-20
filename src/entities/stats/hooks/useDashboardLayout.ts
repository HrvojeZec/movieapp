import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/entities/user/hooks/useAuth";
import {
  getDashboardLayout,
  saveDashboardLayout,
  saveDashboardLayoutOnExit,
} from "@/entities/stats/api/dashboard.api";
import { statsKeys } from "@/entities/stats/api/query-keys";
import { DASHBOARD_SAVE_DEBOUNCE_MS, DEFAULT_LAYOUT } from "@/entities/stats/constants";
import type { LayoutItem } from "@/entities/stats/types";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

// Saves run one after another, so an older one can't land after a newer one
const SAVE_SCOPE = { id: "dashboard-layout" };

/**
 * The stats board's layout. Changes show at once and are saved a moment after the last one;
 * a failed save puts the last saved layout back and can be retried.
 */
export function useDashboardLayout() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = statsKeys.dashboard(user?.id ?? "");
  const query = useQuery({
    queryKey,
    queryFn: getDashboardLayout,
    enabled: Boolean(user),
    // Our own edits are the newest version; a background refetch would undo unsaved ones
    staleTime: Infinity,
  });
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pending = useRef<LayoutItem[] | null>(null);
  const lastSaved = useRef<LayoutItem[] | null>(null);
  const failed = useRef<LayoutItem[] | null>(null);
  // Saves sent and not yet answered
  const inFlight = useRef(0);

  const { mutate } = useMutation({
    mutationFn: saveDashboardLayout,
    scope: SAVE_SCOPE,
    onMutate: () => {
      inFlight.current += 1;
    },
    onSuccess: (stored) => {
      lastSaved.current = stored;
      // A newer change is waiting or on its way; showing this stored one would undo it
      const newer = pending.current !== null || inFlight.current > 1;
      if (!newer) queryClient.setQueryData(queryKey, stored);
      setStatus(newer ? "saving" : "saved");
    },
    onError: (_error, layout) => {
      failed.current = layout;
      if (lastSaved.current) queryClient.setQueryData(queryKey, lastSaved.current);
      setStatus("error");
    },
    onSettled: () => {
      inFlight.current -= 1;
    },
  });

  const save = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = undefined;
    const layout = pending.current;
    pending.current = null;
    if (layout) mutate(layout);
  }, [mutate]);

  const setLayout = useCallback(
    (next: LayoutItem[]) => {
      lastSaved.current ??= queryClient.getQueryData<LayoutItem[]>(queryKey) ?? null;
      queryClient.setQueryData(queryKey, next);
      pending.current = next;
      setStatus("saving");
      clearTimeout(timer.current);
      timer.current = setTimeout(save, DASHBOARD_SAVE_DEBOUNCE_MS);
    },
    [queryClient, queryKey, save],
  );

  const retry = useCallback(() => {
    if (failed.current) setLayout(failed.current);
    save();
  }, [save, setLayout]);

  const reset = useCallback(() => {
    setLayout(DEFAULT_LAYOUT.map((item) => ({ ...item })));
    save();
  }, [save, setLayout]);

  // Leaving the view before the wait is over still saves the last change
  useEffect(() => () => save(), [save]);

  // Closing the tab or reloading doesn't unmount anything, so the waiting change goes out here
  useEffect(() => {
    const onHide = () => {
      const layout = pending.current;
      if (!layout) return;
      clearTimeout(timer.current);
      pending.current = null;
      void saveDashboardLayoutOnExit(layout);
    };
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, []);

  return {
    layout: query.data,
    isPending: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
    setLayout,
    /** Saves a waiting change now, e.g. when the user is done editing. */
    flush: save,
    status,
    retry,
    reset,
  };
}
