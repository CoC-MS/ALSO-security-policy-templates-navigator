import { describe, expect, it } from "vitest";
import { getPlatform, platforms } from "./catalog";
import {
  filterPlatformsByTopics,
  getRepositoryMetadata,
  getTotalTemplateCount,
  isValidCategoryCounts,
  type RepositoryMetadata,
} from "./repositoryMetadata";

const repositories: RepositoryMetadata[] = [
  {
    name: "ALSO-Microsoft-Security-Windows",
    url: "https://github.com/CoC-MS/ALSO-Microsoft-Security-Windows",
    description: "Windows policies",
    topics: ["app-control", "bitlocker", "windows"],
  },
  {
    name: "ALSO-Microsoft-Security-Conditional-Access",
    url: "https://github.com/CoC-MS/ALSO-Microsoft-Security-Conditional-Access",
    description: "Conditional Access policies",
    topics: ["conditional-access", "device-code-flow", "phishing-resistant-mfa"],
  },
  {
    name: "ALSO-Microsoft-Security-AI-Security-Windows11",
    url: "https://github.com/CoC-MS/ALSO-Microsoft-Security-AI-Security-Windows11",
    description: "AI policies",
    topics: ["agentsecurity", "aisecurity"],
  },
];

describe("repository topic metadata", () => {
  it("totals exactly the seven displayed categories", () => {
    const counts = {
      conditionalAccess: 43,
      devicePolicies: 130,
      compliance: 34,
      scripts: 30,
      filters: 17,
      applications: 9,
      purviewPolicies: 24,
    };
    expect(getTotalTemplateCount(counts)).toBe(287);
    expect(getTotalTemplateCount({ ...counts, scripts: 31 })).toBe(288);
    expect(getTotalTemplateCount({ ...counts, extra: 100 })).toBe(287);
  });

  describe("dashboard category counts", () => {
    it("accepts complete non-negative integer counts", () => {
      expect(isValidCategoryCounts({
        conditionalAccess: 43,
        devicePolicies: 130,
        compliance: 34,
        scripts: 30,
        filters: 17,
        applications: 9,
        purviewPolicies: 24,
      })).toBe(true);
    });

    it("rejects missing or invalid counts instead of rendering misleading totals", () => {
      expect(isValidCategoryCounts({ conditionalAccess: 1 })).toBe(false);
      expect(isValidCategoryCounts({
        conditionalAccess: 1,
        devicePolicies: -1,
        compliance: 0,
        scripts: 0,
        filters: 0,
        applications: 0,
        purviewPolicies: 24,
      })).toBe(false);
    });
  });

  it("does not display a partial or invalid template total", () => {
    expect(getTotalTemplateCount(undefined)).toBeUndefined();
    expect(getTotalTemplateCount({ conditionalAccess: 43 })).toBeUndefined();
    const counts = { conditionalAccess: 43, devicePolicies: 130, compliance: 34, scripts: 30, filters: 17, applications: 9, purviewPolicies: 24 };
    expect(getTotalTemplateCount({ ...counts, scripts: -1 })).toBeUndefined();
    expect(getTotalTemplateCount({ ...counts, scripts: 1.5 })).toBeUndefined();
    expect(getTotalTemplateCount({ ...counts, scripts: Number.MAX_SAFE_INTEGER })).toBeUndefined();
  });

  it("looks up metadata by repository URL", () => {
    expect(
      getRepositoryMetadata(
        repositories,
        "https://github.com/CoC-MS/ALSO-Microsoft-Security-Windows",
      )?.topics,
    ).toContain("bitlocker");
  });

  it.each([
    ["Phishing Resistant MFA", ["agent-security", "conditional-access"]],
    ["Device Code Flow", ["agent-security", "conditional-access"]],
    ["App Control", ["windows-11"]],
    ["BitLocker", ["windows-11"]],
    ["Agent", ["ai-security", "agent-security"]],
  ] as const)("filters %s using repository topics", (query, expectedIds) => {
    expect(
      filterPlatformsByTopics(platforms, repositories, query).map(
        (platform) => platform.id,
      ),
    ).toEqual(expectedIds);
  });

  it("returns all candidates for an empty search", () => {
    const candidates = [getPlatform("windows-11"), getPlatform("purview")];

    expect(filterPlatformsByTopics(candidates, repositories, " ")).toEqual(
      candidates,
    );
  });

  it("does not invent matches for repositories without matching topics", () => {
    expect(filterPlatformsByTopics(platforms, repositories, "android")).toEqual(
      [],
    );
  });
});
