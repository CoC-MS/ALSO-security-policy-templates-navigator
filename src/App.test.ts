import { describe, expect, it } from "vitest";
import { getRepositoryRecommendations } from "./App";
import { getPlatform } from "./catalog";
import { getSecurityGoalOptions } from "./solutionCatalog";

describe("repository recommendation licensing scopes", () => {
  it.each([
    ["linux-server", "linux-desktop"],
    ["linux-desktop", "linux-server"],
  ] as const)("retains both Linux licensing scopes when %s is selected first", (...platformIds) => {
    const options = getSecurityGoalOptions("endpoint-protection").filter((option) =>
      option.id === "linux-server-antivirus" || option.id === "linux-desktop-antivirus",
    );
    const recommendations = getRepositoryRecommendations(
      platformIds.map(getPlatform),
      options,
    );

    expect(recommendations).toHaveLength(1);
    expect(recommendations[0].sourcePlatformIds).toEqual(platformIds);
    expect(recommendations[0].sourcePlatform.id).toBe(platformIds[0]);
  });
});
