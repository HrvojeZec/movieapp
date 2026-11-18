import connectDB from "@/server/db/mongodb";
import User from "@/server/models/User";
import { notFound } from "@/server/http/route-error";
import { DEFAULT_LAYOUT } from "@/features/stats/constants";
import { sanitizeLayout } from "@/features/stats/lib/grid-layout";
import type { LayoutItem } from "@/features/stats/types";

/** The user's stats dashboard; nothing saved yet means the default board. */
export async function getDashboardLayout(userId: string): Promise<LayoutItem[]> {
  await connectDB();
  const user = await User.findById(userId).select({ dashboardLayout: 1 }).lean();
  if (!user) throw notFound("User");
  const saved = user.dashboardLayout ?? [];
  // Saved by an older version of the board, so it may name widgets that no longer exist
  return saved.length > 0 ? sanitizeLayout(saved) : DEFAULT_LAYOUT.map((item) => ({ ...item }));
}

/** Stores the board as the grid would show it: packed, inside the grid, one of each widget. */
export async function saveDashboardLayout(
  userId: string,
  layout: LayoutItem[],
): Promise<LayoutItem[]> {
  await connectDB();
  const dashboardLayout = sanitizeLayout(layout);
  const { matchedCount } = await User.updateOne({ _id: userId }, { $set: { dashboardLayout } });
  if (matchedCount === 0) throw notFound("User");
  return dashboardLayout;
}
