import { describe, expect, it } from "vitest";
import {
  getRecommendedPolicyIds,
  getSecurityGoalOptionExperience,
  getSolutionPlatformIds,
  securityGoals,
  toggleSecurityGoalSelection,
} from "./solutionCatalog";

describe("security goal recommendations", () => {
  it("includes administrator protection with the requested Conditional Access policies", () => {
    expect(securityGoals.map((goal) => goal.name)).toEqual([
      "Attack protection",
      "Administrator protection",
      "Endpoint protection",
      "AI and Agent Security",
      "Data protection",
      "App protection",
    ]);

    expect(getSolutionPlatformIds("administrator-protection", []))
      .toEqual(["conditional-access"]);
    expect(
      getRecommendedPolicyIds(
        "administrator-protection",
        [],
        "conditional-access",
      ),
    ).toEqual([
      "CA100",
      "CA101",
      "CA102",
      "CA103",
      "CA104",
      "CA105",
      "CA107",
      "CA108",
      "CA109",
      "CA110",
    ]);
    const administratorOption = securityGoals
      .find((goal) => goal.id === "administrator-protection")!
      .options[0];
    expect(administratorOption.autoSelect).toBe(true);
    expect(administratorOption.recommendedPolicyNote)
      .toBe(
        "CA106 requires Microsoft Entra ID Plan 2. These recommended policies are a good starting point, but implementing them does not guarantee full protection.",
      );
  });

  it("supports selecting multiple security goals and deselecting one", () => {
    const selected = toggleSecurityGoalSelection(
      toggleSecurityGoalSelection([], "attack-protection"),
      "endpoint-protection",
    );

    expect(selected).toEqual(["attack-protection", "endpoint-protection"]);
    expect(toggleSecurityGoalSelection(selected, "attack-protection"))
      .toEqual(["endpoint-protection"]);
  });

  it.each([
    ["device-code-phishing", ["conditional-access"]],
    ["clickfix", ["windows-11", "macos"]],
    ["ransomware", ["windows-11", "macos", "windows-servers"]],
    ["token-theft", ["conditional-access", "macos", "windows-11"]],
    ["aitm-phishing", ["conditional-access"]],
    ["password-spray", ["conditional-access"]],
    ["brute-force", ["conditional-access", "windows-servers"]],
  ])("maps attack scenario %s to the requested repositories", (optionId, expected) => {
    expect(getSolutionPlatformIds("attack-protection", [optionId])).toEqual(expected);
  });

  it.each([
    ["device-code-phishing", "full"],
    ["clickfix", "limited"],
    ["ransomware", "limited"],
    ["token-theft", "limited"],
    ["aitm-phishing", "full"],
    ["password-spray", "full"],
    ["brute-force", "limited"],
  ] as const)(
    "derives the %s experience from all its actual repository prerequisites for Business Premium",
    (optionId, expectedExperience) => {
      const attackGoal = securityGoals.find((goal) => goal.id === "attack-protection")!;
      const option = attackGoal.options.find((item) => item.id === optionId)!;
      expect(
        getSecurityGoalOptionExperience(
          "attack-protection",
          ["business-premium"],
          option.platformIds,
        ),
      ).toBe(expectedExperience);
    },
  );

  it("requires every mapped repository to meet its prerequisites for Full experience", () => {
    const attackGoal = securityGoals.find((goal) => goal.id === "attack-protection")!;
    const clickfix = attackGoal.options.find((option) => option.id === "clickfix")!;
    const ransomware = attackGoal.options.find((option) => option.id === "ransomware")!;

    expect(
      getSecurityGoalOptionExperience(
        "attack-protection",
        ["business-premium-defender"],
        clickfix.platformIds,
      ),
    ).toBe("full");
    expect(
      getSecurityGoalOptionExperience(
        "attack-protection",
        ["business-premium-defender"],
        ransomware.platformIds,
      ),
    ).toBe("limited");
  });

  it("does not treat generic Conditional Access upsell guidance as an attack prerequisite", () => {
    expect(
      getSecurityGoalOptionExperience(
        "attack-protection",
        ["business-premium"],
        ["conditional-access"],
      ),
    ).toBe("full");
  });

  it("keeps license-based experience badges for non-attack goal options", () => {
    expect(
      getSecurityGoalOptionExperience(
        "app-protection",
        ["business-premium"],
        ["windows-11", "macos"],
      ),
    ).toBe("limited");
  });

  it.each([
    ["device-code-phishing", ["CA004"]],
    ["aitm-phishing", ["CA105", "CA107"]],
    ["token-theft", ["CA105", "CA107"]],
    ["password-spray", ["CA002", "CA000"]],
    ["brute-force", ["CA002", "CA000"]],
  ])("recommends the specified Conditional Access policies for %s", (optionId, expected) => {
    expect(
      getRecommendedPolicyIds("attack-protection", [optionId], "conditional-access"),
    ).toEqual(expected);
  });

  it("shows attack policy IDs only on the Conditional Access repository", () => {
    expect(
      getRecommendedPolicyIds("attack-protection", ["token-theft"], "windows-11"),
    ).toEqual([]);
    expect(
      getRecommendedPolicyIds("attack-protection", ["token-theft"], "macos"),
    ).toEqual([]);
  });

  it("adds a protection disclaimer to each attack policy recommendation", () => {
    const attackOptions = securityGoals.find((goal) => goal.id === "attack-protection")!.options;
    const policyRecommendations = attackOptions.filter(
      (option) => "recommendedPolicyIds" in option,
    );

    expect(policyRecommendations.every((option) =>
      "recommendedPolicyNote" in option &&
      option.recommendedPolicyNote ===
      "These recommended policies are a good starting point, but implementing them does not guarantee full protection.",
    )).toBe(true);
  });

  it("deduplicates policies when multiple attack scenarios are selected", () => {
    expect(
      getRecommendedPolicyIds(
        "attack-protection",
        ["aitm-phishing", "token-theft"],
        "conditional-access",
      ),
    ).toEqual(["CA105", "CA107"]);
  });

  it("maps endpoint protection to all seven requested platforms", () => {
    expect(
      getSolutionPlatformIds("endpoint-protection", [
        "endpoint-windows",
        "endpoint-macos",
        "endpoint-windows-server",
        "endpoint-linux-server",
        "endpoint-linux-desktop",
        "endpoint-ios-ipados",
        "endpoint-android",
      ]),
    ).toEqual([
      "windows-11",
      "macos",
      "windows-servers",
      "linux-server",
      "linux-desktop",
      "ios-ipados",
      "android",
    ]);
  });

  it("maps data protection directly and AI/Agent security by option", () => {
    expect(getSolutionPlatformIds("data-protection", []))
      .toEqual(["purview"]);
    const dataProtectionOption = securityGoals
      .find((goal) => goal.id === "data-protection")!
      .options[0];
    expect(dataProtectionOption.name).toBe("Data protection");
    expect(dataProtectionOption.autoSelect)
      .toBe(true);
    expect(getSolutionPlatformIds("ai-agent-security", ["ai-security", "agent-security"]))
      .toEqual(["ai-security", "ai-security-macos", "purview", "agent-security"]);
  });

  it.each([
    ["oauth-apps", ["conditional-access"]],
    ["desktop-apps", ["windows-11", "macos"]],
    ["mobile-apps", ["ios-ipados", "android"]],
    ["cloud-apps", ["windows-11", "windows-servers", "macos", "conditional-access"]],
  ])("maps app protection option %s to the requested repositories", (optionId, expected) => {
    expect(getSolutionPlatformIds("app-protection", [optionId])).toEqual(expected);
  });

  it("combines app protection types and deduplicates shared repositories", () => {
    expect(
      getSolutionPlatformIds("app-protection", [
        "oauth-apps",
        "desktop-apps",
        "mobile-apps",
        "cloud-apps",
      ]),
    ).toEqual([
      "conditional-access",
      "windows-11",
      "macos",
      "ios-ipados",
      "android",
      "windows-servers",
    ]);
  });
});
