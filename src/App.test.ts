import { describe, expect, it } from "vitest";
import {
  getAuxiliaryPageReturnStep,
  getEndpointPlatformsMissingCategories,
  getExcludedLicenses,
  getRepositoryRecommendations,
  getUnconfiguredGoalNames,
} from "./App";
import { getPlatform, licenses } from "./catalog";
import { getSecurityGoalOptions, securityGoals } from "./solutionCatalog";

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

describe("navigator selection edge cases", () => {
  it("requires a category for every selected endpoint platform", () => {
    const endpointGoal = securityGoals.find((goal) => goal.id === "endpoint-protection")!;
    const selectedPlatforms = endpointGoal.options.filter((option) =>
      option.id === "endpoint-windows" || option.id === "endpoint-windows-server",
    );

    expect(
      getEndpointPlatformsMissingCategories(selectedPlatforms, []),
    ).toEqual(["Windows", "Windows Server"]);
    expect(
      getEndpointPlatformsMissingCategories(
        selectedPlatforms,
        ["endpoint-protection:windows-firewall"],
      ),
    ).toEqual(["Windows Server"]);
    expect(
      getEndpointPlatformsMissingCategories(
        selectedPlatforms,
        ["endpoint-protection:windows-firewall", "endpoint-protection:server-firewall"],
      ),
    ).toEqual([]);
  });

  it("identifies each selected goal that still needs an option", () => {
    const selectedGoals = securityGoals.filter((goal) =>
      goal.id === "ai-agent-security" || goal.id === "data-protection",
    );

    expect(
      getUnconfiguredGoalNames(selectedGoals, ["ai-agent-security:agent-security"]),
    ).toEqual(["Data Security"]);
    expect(
      getUnconfiguredGoalNames(selectedGoals, [
        "ai-agent-security:agent-security",
        "data-protection:sensitive-information-types",
      ]),
    ).toEqual([]);
  });

  it("keeps auxiliary-page Back navigation anchored to the last wizard step", () => {
    const returnStep = getAuxiliaryPageReturnStep("result", "license");
    const afterFaqToCatalog = getAuxiliaryPageReturnStep("faq", returnStep);
    const afterCatalogToFaq = getAuxiliaryPageReturnStep("overview", afterFaqToCatalog);

    expect(afterFaqToCatalog).toBe("result");
    expect(afterCatalogToFaq).toBe("result");
  });

  it("identifies unsupported licenses in a mixed selection", () => {
    const selected = licenses.filter((license) =>
      license.id === "business-basic" || license.id === "business-premium",
    );

    expect(getExcludedLicenses(selected).map((license) => license.name)).toEqual([
      "Microsoft 365 Business Basic",
    ]);
  });
});
