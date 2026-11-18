import { describe, expect, it } from "vitest";
import { SIDEBAR_INIT_SCRIPT, SIDEBAR_STORAGE_KEY } from "@/shared/lib/sidebar-script";

// Runs the inline script against a stand-in window, as the browser does before the first paint
function run({
  saved,
  width,
  storageThrows = false,
}: {
  saved?: string;
  width: number;
  storageThrows?: boolean;
}) {
  const dataset: Record<string, string> = {};
  const window = {
    innerWidth: width,
    localStorage: {
      getItem: (key: string) => {
        if (storageThrows) throw new Error("blocked");
        return key === SIDEBAR_STORAGE_KEY ? (saved ?? null) : null;
      },
    },
  };
  const document = { documentElement: { dataset } };
  new Function("window", "document", SIDEBAR_INIT_SCRIPT)(window, document);
  return dataset.sidebar;
}

describe("SIDEBAR_INIT_SCRIPT", () => {
  it("uses the saved choice", () => {
    expect(run({ saved: "collapsed", width: 1600 })).toBe("collapsed");
    expect(run({ saved: "expanded", width: 1280 })).toBe("expanded");
  });

  it("without a saved choice, wide screens get the wide sidebar", () => {
    expect(run({ width: 1440 })).toBe("expanded");
    expect(run({ width: 1439 })).toBe("collapsed");
    expect(run({ saved: "garbage", width: 1600 })).toBe("expanded");
  });

  it("still picks a state when storage is blocked", () => {
    expect(run({ width: 1600, storageThrows: true })).toBe("expanded");
  });
});
