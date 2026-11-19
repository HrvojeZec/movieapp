import { describe, expect, it } from "vitest";
import type { AuthUser } from "@/entities/user/types";
import {
  SIDEBAR_GROUPS,
  lockedPlanName,
  visibleGroups,
} from "@/widgets/app-shell/ui/Sidebar/sidebar-links";

const user = { id: "1", name: "Test", email: "test@example.com" } as AuthUser;
const link = (label: string) =>
  SIDEBAR_GROUPS.flatMap((group) => group.links).find((item) => item.label === label)!;

describe("visibleGroups", () => {
  it("logged-out visitors only see the browse links", () => {
    expect(visibleGroups(null).map((group) => group.label)).toEqual(["Browse"]);
  });

  it("signed-in users also see their library and the personal pages", () => {
    expect(visibleGroups(user).map((group) => group.label)).toEqual([
      "Browse",
      "Library",
      "For you",
    ]);
  });
});

describe("lockedPlanName", () => {
  it("locked links are marked for the plan they need", () => {
    expect(lockedPlanName(link("Watchlist"), "basic")).toBe("Premium");
    expect(lockedPlanName(link("Stats"), "basic")).toBe("Pro");
    expect(lockedPlanName(link("Stats"), "premium")).toBe("Pro");
    expect(lockedPlanName(link("Watchlist"), "premium")).toBeNull();
  });

  it("links every plan has are never locked", () => {
    expect(lockedPlanName(link("Favorites"), "basic")).toBeNull();
    expect(lockedPlanName(link("Watched"), "basic")).toBeNull();
    expect(
      SIDEBAR_GROUPS.flatMap((group) => group.links).every(
        (item) => lockedPlanName(item, "pro") === null,
      ),
    ).toBe(true);
  });
});
