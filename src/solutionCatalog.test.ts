import { describe, expect, it } from "vitest";
import { platforms } from "./catalog";
import { getSolutionPlatformIds, securityGoals } from "./solutionCatalog";

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

  it("maps management, data protection, AI/Agent, and app protection", () => {
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
    expect(getSolutionPlatformIds("app-protection", ["all-app-protection"]))
      .toEqual(platforms.map((platform) => platform.id));
  });
});
