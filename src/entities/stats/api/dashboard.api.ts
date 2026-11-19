import type { LayoutItem } from "@/entities/stats/types";
import { API_ROUTES } from "@/shared/api-routes";
import { fetchJson, putJson } from "@/shared/lib/http";

type DashboardResponse = { layout: LayoutItem[] };

export const getDashboardLayout = async () =>
  (await fetchJson<DashboardResponse>(API_ROUTES.user.dashboard)).layout;

/** Returns the layout as the server stored it (packed). */
export const saveDashboardLayout = async (layout: LayoutItem[]) =>
  (await putJson<DashboardResponse>(API_ROUTES.user.dashboard, { layout })).layout;

/**
 * Saves while the page is being left: keepalive lets the request finish after the page is gone.
 * Nobody is left to see the answer, so failures are ignored.
 */
export const saveDashboardLayoutOnExit = (layout: LayoutItem[]) =>
  fetchJson(API_ROUTES.user.dashboard, {
    method: "PUT",
    body: JSON.stringify({ layout }),
    keepalive: true,
  }).catch(() => undefined);
