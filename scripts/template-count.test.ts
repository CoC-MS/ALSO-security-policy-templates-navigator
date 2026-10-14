import { describe, expect, it } from "vitest";
import {
  countPolicyJsonFiles,
  countRepositoryTemplates,
  deduplicateRepositoryCounts,
  getPolicyJsonHashes,
  getRepositoryCategoryHashes,
  getUniqueCategoryCounts,
} from "./template-count.mjs";

describe("policy JSON file count", () => {
  it("deduplicates identical JSON content within a repository", () => {
    expect(getPolicyJsonHashes({ tree: [
      { type: "blob", path: "Basic/policy.json", sha: "same" },
      { type: "blob", path: "Full/copy.json", sha: "same" },
      { type: "blob", path: "Full/other.json", sha: "different" },
      { type: "blob", path: "Groups/group.json", sha: "excluded" },
    ] })).toEqual(["different", "same"]);
  });

  it("deduplicates across repositories and retains Purview's 24 templates", () => {
    const result = deduplicateRepositoryCounts([
      { name: "Windows", templateHashes: ["one", "one", "two"] },
      { name: "AI", templateHashes: ["two", "three"] },
      { name: "ALSO-Microsoft-Security-Purview", templateHashes: [] },
    ]);
    expect(result.map((repository) => repository.templateCount)).toEqual([2, 1, 24]);
  });

  it("refuses to publish a total without cached content hashes", () => {
    expect(() => deduplicateRepositoryCounts([{ name: "Windows" }])).toThrow("Missing template hashes");
    expect(() => getPolicyJsonHashes({ tree: [
      { type: "blob", path: "policy.json" },
    ] })).toThrow("Missing Git content hash");
  });

  it("includes the specified 24 Purview templates even without JSON files", () => {
    expect(countRepositoryTemplates("ALSO-Microsoft-Security-Purview", {
      tree: [],
    })).toBe(24);
  });

  it("continues counting JSON files for other repositories", () => {
    expect(countRepositoryTemplates("ALSO-Microsoft-Security-Windows", {
      tree: [{ type: "blob", path: "policy.json" }],
    })).toBe(1);
  });

  it("counts JSON files at every depth, case-insensitively", () => {
    expect(countPolicyJsonFiles({
      tree: [
        { type: "blob", path: "policy.json" },
        { type: "blob", path: "Windows/Intune/policy.JSON" },
        { type: "blob", path: "Windows/script.ps1" },
        { type: "tree", path: "folder.json" },
      ],
    })).toBe(2);
  });

  it("excludes the requested folders and their nested files", () => {
    expect(countPolicyJsonFiles({
      tree: [
        { type: "blob", path: "CA/Applications/policy.json" },
        { type: "blob", path: "Authentication Context/nested/policy.json" },
        { type: "blob", path: "AuthenticationContext/policy.json" },
        { type: "blob", path: "authentication-context/policy.json" },
        { type: "blob", path: "CA/namedlocations/policy.json" },
        { type: "blob", path: "Named Locations/policy.json" },
        { type: "blob", path: "Groups/group.json" },
        { type: "blob", path: "CA/groups/nested/group.JSON" },
        { type: "blob", path: "ConditionalAccess/policy.json" },
      ],
    })).toBe(1);
  });

  it("matches folder names rather than file names or partial folder names", () => {
    expect(countPolicyJsonFiles({
      tree: [
        { type: "blob", path: "Applications.json" },
        { type: "blob", path: "ApplicationsPolicy/policy.json" },
        { type: "blob", path: "Groups.json" },
        { type: "blob", path: "GroupsPolicy/policy.json" },
      ],
    })).toBe(4);
  });

  it("rejects incomplete trees rather than publishing an inaccurate count", () => {
    expect(() => countPolicyJsonFiles({ truncated: true, tree: [] })).toThrow(
      "truncated",
    );
  });

  it("collects unique category file hashes from the configured folders", () => {
    const hashes = getRepositoryCategoryHashes({
      tree: [
        { type: "blob", path: "ConditionalAccess/Policy.json", sha: "ca" },
        { type: "blob", path: "Settings Catalog/Device.JSON", sha: "device" },
        { type: "blob", path: "AdministrativeTemplates/copy.json", sha: "device" },
        { type: "blob", path: "CompliancePolicies/compliance.json", sha: "compliance" },
        { type: "blob", path: "ComplianceScripts/compliance.ps1", sha: "compliance-script" },
        { type: "blob", path: "PowerShell Scripts/setup.PS1", sha: "script" },
        { type: "blob", path: "DeviceHealthScripts/health.ps1", sha: "script" },
        { type: "blob", path: "DeviceHealthScripts/health.json", sha: "not-a-script" },
        { type: "blob", path: "AssignmentFilters/filter.json", sha: "filter" },
        { type: "blob", path: "Applications/app.json", sha: "application" },
        { type: "blob", path: "Other/policy.json", sha: "other" },
      ],
    });

    expect(hashes).toEqual({
      conditionalAccess: ["ca"],
      devicePolicies: ["device"],
      compliance: ["compliance", "compliance-script"],
      scripts: ["script"],
      filters: ["filter"],
      applications: ["application"],
    });
  });

  it("excludes authentication contexts and named locations from Conditional Access counts", () => {
    const hashes = getRepositoryCategoryHashes({
      tree: [
        { type: "blob", path: "ConditionalAccess/Policies/require-mfa.json", sha: "policy" },
        { type: "blob", path: "ConditionalAccess/Authentication Context/context.json", sha: "auth-context" },
        { type: "blob", path: "ConditionalAccess/AuthenticationContext/other.json", sha: "auth-context-2" },
        { type: "blob", path: "ConditionalAccess/named-locations/location.json", sha: "named-location" },
        { type: "blob", path: "ConditionalAccess/NamedLocations/other.json", sha: "named-location-2" },
      ],
    });

    expect(hashes.conditionalAccess).toEqual(["policy"]);
  });

  it("counts only policy JSON in package exports, not sibling named locations or auth contexts", () => {
    const hashes = getRepositoryCategoryHashes({
      tree: [
        { type: "blob", path: "ALSO_CA_BP/ConditionalAccess/BP-policy.json", sha: "policy" },
        { type: "blob", path: "ALSO_CA_E5/ConditionalAccess/BP-policy.json", sha: "policy" },
        { type: "blob", path: "ALSO_CA_E7/ConditionalAccess/BP-policy.json", sha: "policy" },
        { type: "blob", path: "ALSO_CA_BP/NamedLocations/location-a.json", sha: "location-a" },
        { type: "blob", path: "ALSO_CA_BP/NamedLocations/location-b.json", sha: "location-b" },
        { type: "blob", path: "ALSO_CA_BP/NamedLocations/location-c.json", sha: "location-c" },
        { type: "blob", path: "ALSO_CA_E5/AuthenticationContext/context.json", sha: "auth-context" },
        { type: "blob", path: "ALSO_CA_E7/AuthenticationContext/context.json", sha: "auth-context" },
      ],
    });

    expect(hashes.conditionalAccess).toEqual(["policy"]);
  });

  it("deduplicates category hashes across repositories and adds fixed Purview counts", () => {
    const categoryHashes = {
      conditionalAccess: ["ca", "shared"],
      devicePolicies: ["device"],
      compliance: ["compliance"],
      scripts: ["script"],
      filters: ["filter"],
      applications: ["application"],
    };
    const result = getUniqueCategoryCounts([
      { name: "Windows", categoryHashes },
      {
        name: "macOS",
        categoryHashes: {
          conditionalAccess: ["shared"],
          devicePolicies: ["device", "other-device"],
          compliance: ["compliance"],
          scripts: ["another-script"],
          filters: [],
          applications: ["application"],
        },
      },
    ]);

    expect(result).toEqual({
      conditionalAccess: 2,
      devicePolicies: 2,
      compliance: 1,
      scripts: 7,
      filters: 1,
      applications: 1,
      purviewPolicies: 24,
    });
    expect(() =>
      getUniqueCategoryCounts([{ name: "stale cached repository" }]),
    ).toThrow("Missing conditionalAccess hashes");
  });
});
