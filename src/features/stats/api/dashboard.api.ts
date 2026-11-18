import type { LayoutItem } from "@/features/stats/types";
import { API_ROUTES } from "@/shared/api-routes";
import { fetchJson, putJson } from "@/shared/lib/http";

type DashboardResponse = { layout: LayoutItem[] };

export const getDashboardLayout = async () =>
  (await fetchJson<DashboardResponse>(API_ROUTES.user.dashboard)).layout;

/** Returns the layout as the server stored it (packed). */
export const saveDashboardLayout = async (layout: LayoutItem[]) =>
  (await putJson<DashboardResponse>(API_ROUTES.user.dashboard, { layout })).layout;
