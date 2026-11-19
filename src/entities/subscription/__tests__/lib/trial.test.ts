import { describe, expect, it } from "vitest";
import { isTrialAvailable } from "@/entities/subscription/lib/trial";

describe("isTrialAvailable", () => {
  it("offers the trial to someone who never subscribed", () => {
    expect(isTrialAvailable({ hasUsedTrial: false })).toBe(true);
    expect(isTrialAvailable({})).toBe(true);
  });

  it("not after a trial", () => {
    expect(isTrialAvailable({ hasUsedTrial: true })).toBe(false);
  });

  it("not to a returning subscriber, even one from before trials existed", () => {
    expect(isTrialAvailable({ hasUsedTrial: false, subscriptionId: "sub_old" })).toBe(false);
  });
});
