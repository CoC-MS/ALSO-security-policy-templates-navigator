import { describe, expect, it } from "vitest";
import generatedIndex from "../public/attack-policy-coverage.v1.json";
import {
  attackScenarios,
  configuredCoverageRepositories,
  configuredCoverageSourceIds,
  getInventoryFileCoverageStatus,
  getScenarioCoverage,
  getScenarioPolicyLinks,
  isAttackCoverageIndex,
  parseAttackCoverageIndex,
  type AttackStepId,
  type AttackCoverageIndex,
  type CoverageMapping,
  type CoverageSource,
} from "./attackCoverage";

const source: CoverageSource = {
  id: "windows",
  name: "Windows",
  platform: "Windows 11",
  repositoryUrl: "https://github.com/CoC-MS/ALSO-Microsoft-Security-Windows",
  commitSha: "a".repeat(40),
  treeSha: "b".repeat(40),
  fetchedAt: "2026-10-22T12:00:00.000Z",
  files: [{
    path: "settings.json",
    blobSha: "c".repeat(40),
    sha256: "d".repeat(64),
    kind: "policy-json",
    parseStatus: "valid",
  }],
};

const emptySources: CoverageSource[] = configuredCoverageSourceIds
  .filter((id) => id !== source.id)
  .map((id) => ({
    ...source,
    id,
    name: id,
    platform: id === "android" ? "Android" : id,
    repositoryUrl: configuredCoverageRepositories[id],
    files: [],
  }));

function makeMapping(
  id: string,
  stepId: AttackStepId,
  controlId = id,
  status: "verified" | "changed" | "missing" | "invalid" = "verified",
): CoverageMapping {
  return {
    id,
    scenarioId: "aitm-phishing",
    stepId,
    controlId,
    name: id,
    effect: "prevention",
    rationale: "The configured value meets the documented condition.",
    limitation: "The template does not verify deployment.",
    repositoryId: "windows",
    evidence: [{
      path: "settings.json",
      selector: { kind: "json-pointer", pointer: "/enabled" },
      expectedValue: true,
      observedValue: status === "changed" ? false : true,
      status,
      sourceUrl: `${source.repositoryUrl}/blob/${source.commitSha}/settings.json`,
      fileSha256: "d".repeat(64),
      referenceUrl: "https://learn.microsoft.com/",
    }],
  };
}

function makeIndex(
  mappings: CoverageMapping[] = [makeMapping("control-one", "phishing-link")],
): AttackCoverageIndex {
  return {
    schemaVersion: 1,
    generatedAt: "2026-10-22T12:00:00.000Z",
    sources: [{
      ...source,
      files: source.files.map((file) => ({ ...file })),
    }, ...emptySources.map((item) => ({ ...item, files: [...item.files] }))],
    mappings,
  };
}

describe("attack coverage index", () => {
  it("lists each policy file once by its actual name and excludes unverified mappings", () => {
    const index = makeIndex([
      makeMapping("first", "phishing-link"),
      makeMapping("second", "token-reuse"),
      makeMapping("changed", "phishing-link", "changed", "changed"),
    ]);
    expect(getScenarioPolicyLinks(index, "aitm-phishing")).toEqual([{
      name: "settings",
      url: `${source.repositoryUrl}/blob/${source.commitSha}/settings.json`,
    }]);
    expect(getScenarioPolicyLinks(index, "llmjacking")).toEqual([]);
    expect(getScenarioPolicyLinks(makeIndex([
      makeMapping("changed", "phishing-link", "changed", "changed"),
    ]), "aitm-phishing")).toEqual([]);
  });

  it("accepts a well-formed versioned evidence index", () => {
    expect(isAttackCoverageIndex(makeIndex())).toBe(true);
    expect(parseAttackCoverageIndex(makeIndex()).schemaVersion).toBe(1);
  });

  it("accepts the generated nine-repository snapshot with all reviewed evidence verified", () => {
    const index = parseAttackCoverageIndex(generatedIndex);
    expect(index.sources).toHaveLength(9);
    expect(index.mappings).toHaveLength(19);
    expect(index.mappings.flatMap((mapping) => mapping.evidence).every(
      (evidence) => evidence.status === "verified",
    )).toBe(true);
  });

  it("rejects malformed versions, evidence, hashes, references, and duplicates", () => {
    const invalidIndexes = [
      { ...makeIndex(), schemaVersion: 2 },
      { ...makeIndex(), sources: [{ ...source, commitSha: "not-a-commit" }, ...emptySources] },
      { ...makeIndex(), sources: [] },
      { ...makeIndex(), sources: emptySources },
      {
        ...makeIndex(),
        sources: [{ ...source, repositoryUrl: "https://example.com/repository" }, ...emptySources],
      },
      { ...makeIndex(), mappings: [makeMapping("dup", "phishing-link"), makeMapping("dup", "phishing-link")] },
      {
        ...makeIndex(),
        mappings: [{ ...makeMapping("bad-step", "phishing-link"), stepId: "not-a-step" }],
      },
      {
        ...makeIndex(),
        mappings: [{
          ...makeMapping("bad-url", "phishing-link"),
          evidence: [{
            ...makeMapping("bad-url", "phishing-link").evidence[0],
            sourceUrl: "javascript:alert(1)",
          }],
        }],
      },
      {
        ...makeIndex(),
        sources: [{
          ...source,
          files: [{ ...source.files[0], parseStatus: "invalid" }],
        }, ...emptySources],
      },
      {
        ...makeIndex(),
        mappings: [{
          ...makeMapping("unverified-value", "phishing-link"),
          evidence: [{
            ...makeMapping("unverified-value", "phishing-link").evidence[0],
            observedValue: false,
          }],
        }],
      },
      {
        ...makeIndex(),
        mappings: [{
          ...makeMapping("unindexed-file", "phishing-link"),
          evidence: [{
            ...makeMapping("unindexed-file", "phishing-link").evidence[0],
            path: "not-in-inventory.json",
          }],
        }],
      },
      {
        ...makeIndex(),
        mappings: [{
          ...makeMapping("unsafe-path", "phishing-link"),
          evidence: [{
            ...makeMapping("unsafe-path", "phishing-link").evidence[0],
            path: "../outside.json",
          }],
        }],
      },
      {
        ...makeIndex(),
        mappings: [{
          ...makeMapping("wrong-file-hash", "phishing-link"),
          evidence: [{
            ...makeMapping("wrong-file-hash", "phishing-link").evidence[0],
            fileSha256: "e".repeat(64),
          }],
        }],
      },
    ];
    for (const index of invalidIndexes) {
      expect(isAttackCoverageIndex(index)).toBe(false);
    }
    expect(() => parseAttackCoverageIndex(invalidIndexes[0])).toThrow(
      "Attack policy coverage index has an invalid schema.",
    );
  });

  it("accepts stable setting, keyed-array, and base64 JSON selectors", () => {
    const settingIdMapping = makeMapping("setting-id", "phishing-link");
    settingIdMapping.evidence[0].selector = {
      kind: "setting-id",
      id: "device_vendor_msft_setting",
      valuePath: "choiceSettingValue.value",
    };
    const arrayMapping = makeMapping("array-value", "credential-or-session-capture");
    arrayMapping.evidence[0].selector = {
      kind: "array-object-property",
      arrayPointer: "/settings",
      matchProperty: "appConfigKey",
      matchValue: "WebProtection",
      valueProperty: "appConfigKeyValue",
    };
    const base64Mapping = makeMapping("base64-value", "token-reuse");
    base64Mapping.evidence[0].selector = {
      kind: "base64-json-array-property",
      encodedValuePointer: "/payloadJson",
      arrayPointer: "/managedProperty",
      matchProperty: "key",
      matchValue: "antiphishing",
      valueProperty: "valueInteger",
    };
    const index = makeIndex([settingIdMapping, arrayMapping, base64Mapping]);
    expect(isAttackCoverageIndex(index)).toBe(true);
  });

  it("preserves invalid selector evidence without accepting it as verified", () => {
    const mapping = makeMapping("ambiguous-setting", "phishing-link", "ambiguous", "invalid");
    expect(isAttackCoverageIndex(makeIndex([mapping]))).toBe(true);
    mapping.evidence[0].status = "verified";
    const index = makeIndex([mapping]);
    index.sources.find((item) => item.id === "windows")!.files[0].parseStatus = "invalid";
    expect(isAttackCoverageIndex(index)).toBe(false);
  });
});

describe("scenario coverage aggregation", () => {
  it("labels inventory files as mapped, not mapped, or unsupported", () => {
    const mappings = [makeMapping("mapped", "phishing-link")];
    expect(getInventoryFileCoverageStatus(
      mappings,
      "windows",
      source.files[0],
    )).toBe("mapped");
    expect(getInventoryFileCoverageStatus(
      [],
      "windows",
      source.files[0],
    )).toBe("not-mapped");
    expect(getInventoryFileCoverageStatus([], "windows", {
      ...source.files[0],
      kind: "documentation",
    })).toBe("unsupported");
    expect(getInventoryFileCoverageStatus([], "windows", {
      ...source.files[0],
      parseStatus: "invalid",
    })).toBe("unsupported");
  });

  it("counts distinct verified controls and leaves unmapped steps explicit", () => {
    const index = makeIndex([
      makeMapping("first-evidence", "phishing-link", "shared-control"),
      makeMapping("second-evidence", "phishing-link", "shared-control"),
      makeMapping("drifted-evidence", "credential-or-session-capture", "drifted-control", "changed"),
    ]);
    const summary = getScenarioCoverage(index, "aitm-phishing");

    expect(summary.distinctControlCount).toBe(1);
    expect(summary.verifiedMappings).toHaveLength(2);
    expect(summary.mappingsNeedingReview).toHaveLength(1);
    expect(summary.steps.map((step) => [
      step.id,
      step.distinctControlCount,
      step.mappings.length,
    ])).toEqual([
      ["phishing-link", 1, 2],
      ["credential-or-session-capture", 0, 0],
      ["token-reuse", 0, 0],
    ]);
  });

  it("filters mappings by repository platform without altering source evidence", () => {
    const index = makeIndex([
      makeMapping("windows-control", "phishing-link"),
      {
        ...makeMapping("android-control", "token-reuse"),
        repositoryId: "android",
      },
    ]);
    const filtered = getScenarioCoverage(index, "aitm-phishing", {
      platform: "Windows 11",
    });
    expect(filtered.verifiedMappings.map((mapping) => mapping.id)).toEqual([
      "windows-control",
    ]);
    expect(filtered.steps[2].mappings).toHaveLength(0);
  });

  it("defines only the six approved scenarios", () => {
    expect(attackScenarios.map((scenario) => scenario.id)).toEqual([
      "aitm-phishing",
      "device-code-phishing",
      "infostealer",
      "clickfix",
      "llmjacking",
      "cryptojacking",
    ]);
  });

  it("provides a verified MITRE ATT&CK context reference and boundary note for every step", () => {
    for (const scenario of attackScenarios) {
      for (const step of scenario.steps) {
        expect(step.techniques.length).toBeGreaterThan(0);
        for (const technique of step.techniques) {
          expect(technique.url).toBe(
            `https://attack.mitre.org/techniques/${technique.id.replace(".", "/")}/`,
          );
          expect(technique.relevance.length).toBeGreaterThan(20);
        }
      }
    }
  });
});
