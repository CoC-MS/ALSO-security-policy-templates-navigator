import { describe, expect, it } from "vitest";
import {
  getSolutionPlatformIds,
  securityGoals,
  toggleSecurityGoalSelection,
} from "./solutionCatalog";

describe("security goal recommendations", () => {
  it("covers the six requested security goals", () => {
    expect(securityGoals.map((goal) => goal.name)).toEqual([
      "Attack protection",
      "Endpoint protection",
      "AI and Agent Security",
      "Endpoint management",
      "Data protection",
      "App protection",
    ]);
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
    ["token-theft", ["conditional-access", "macos", "windows-11"]],
    ["aitm-phishing", ["conditional-access"]],
    ["password-spray", ["conditional-access"]],
    ["brute-force", ["conditional-access", "windows-servers"]],
  ])("maps attack scenario %s to the requested repositories", (optionId, expected) => {
    expect(getSolutionPlatformIds("attack-protection", [optionId])).toEqual(expected);
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

  it("maps management, data protection, and AI/Agent security", () => {
    expect(
      getSolutionPlatformIds("endpoint-management", [
        "mobile-phone-management",
        "device-management",
      ]),
    ).toEqual([
      "android",
      "ios-ipados",
      "windows-11",
      "macos",
      "linux-desktop",
    ]);
    expect(getSolutionPlatformIds("data-protection", ["purview-data-protection"]))
      .toEqual(["purview"]);
    expect(getSolutionPlatformIds("ai-agent-security", ["ai-security", "agent-security"]))
      .toEqual(["ai-security", "ai-security-macos", "agent-security"]);
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
