import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  classifySourceFile,
  compareEvidence,
  createCoverageIndex,
  decodeSourceText,
  findDuplicateSource,
  getUntruncatedTreeEntries,
  repositorySources,
  resolveEvidenceValue,
  syncAttackCoverage,
  validateMappings,
  validateCoverageIndex,
} from "./sync-attack-coverage.mjs";

const temporaryDirectories: string[] = [];

async function createWorkspace() {
  const cwd = await mkdtemp(join(tmpdir(), "attack-policy-coverage-"));
  temporaryDirectories.push(cwd);
  await mkdir(join(cwd, "scripts"), { recursive: true });
  await mkdir(join(cwd, "public"), { recursive: true });
  await writeFile(join(cwd, "scripts", "attack-coverage-mappings.json"), "[]\n");
  return cwd;
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((path) =>
    rm(path, { recursive: true, force: true }),
  ));
});

describe("attack coverage source inventory helpers", () => {
  it("rejects false verification and source mismatches in generated evidence", async () => {
    const original = JSON.parse(await readFile(
      join(process.cwd(), "public", "attack-policy-coverage.v1.json"), "utf8",
    ));
    expect(() => validateCoverageIndex(original)).not.toThrow();
    const changed = structuredClone(original);
    changed.mappings[0].evidence[0].observedValue = "changed";
    expect(() => validateCoverageIndex(changed)).toThrow("inconsistent verified evidence");
    const invalid = structuredClone(original);
    const mapping = invalid.mappings[0];
    invalid.sources.find((source: { id: string }) => source.id === mapping.repositoryId)
      .files.find((file: { path: string }) => file.path === mapping.evidence[0].path)
      .parseStatus = "invalid";
    expect(() => validateCoverageIndex(invalid)).toThrow("inconsistent verified evidence");
    const wrongSource = structuredClone(original);
    wrongSource.mappings[0].evidence[0].sourceUrl = "https://github.com/unrelated/source";
    expect(() => validateCoverageIndex(wrongSource)).toThrow("does not match its source snapshot");
  });

  it("decodes UTF-16LE BOM exports and classifies policy, docs, and scripts", () => {
    const text = '{"settings":[]}';
    const content = Buffer.from(text, "utf16le");
    const bytes = Buffer.concat([Buffer.from([0xff, 0xfe]), content]);
    expect(decodeSourceText(bytes)).toBe(text);
    expect(classifySourceFile("SettingsCatalog/policy.json")).toBe("policy-json");
    expect(classifySourceFile("docs/public/overview.md")).toBe("documentation");
    expect(classifySourceFile("DeviceHealthScripts/check.ps1")).toBe("script");
    expect(classifySourceFile("MigrationTable.json")).toBe("supporting");
    expect(repositorySources).toHaveLength(9);
  });

  it("rejects truncated and malformed repository trees explicitly", () => {
    expect(() => getUntruncatedTreeEntries({ truncated: true, tree: [] }, "Windows"))
      .toThrow("truncated source tree");
    expect(() => getUntruncatedTreeEntries({ truncated: false, tree: "bad" }, "Windows"))
      .toThrow("malformed source tree");
  });

  it("resolves stable setting IDs and JSON Pointer evidence without assuming values", () => {
    const json = {
      settings: [{
        settingInstance: {
          settingDefinitionId: "defender.networkProtection",
          choiceSettingValue: { value: "defender.networkProtection_block" },
        },
      }],
    };
    expect(resolveEvidenceValue(json, {
      kind: "setting-id",
      id: "defender.networkProtection",
      valuePath: "choiceSettingValue.value",
    })).toEqual({ found: true, value: "defender.networkProtection_block" });
    expect(resolveEvidenceValue(json, {
      kind: "json-pointer",
      pointer: "/settings/0/settingInstance/settingDefinitionId",
    })).toEqual({ found: true, value: "defender.networkProtection" });
    expect(resolveEvidenceValue(json, {
      kind: "setting-id",
      id: "missing",
      valuePath: "choiceSettingValue.value",
    })).toEqual({ found: false });
  });

  it("finds keyed app settings and decodes embedded base64 JSON before selecting values", () => {
    const payload = Buffer.from(JSON.stringify({
      managedProperty: [{ key: "antiphishing", valueInteger: 1 }],
    })).toString("base64");
    const source = {
      payloadJson: payload,
      settings: [{
        appConfigKey: "WebProtection",
        appConfigKeyValue: "true",
      }],
    };
    expect(resolveEvidenceValue(source, {
      kind: "array-object-property",
      arrayPointer: "/settings",
      matchProperty: "appConfigKey",
      matchValue: "WebProtection",
      valueProperty: "appConfigKeyValue",
    })).toEqual({ found: true, value: "true" });
    expect(resolveEvidenceValue(source, {
      kind: "base64-json-array-property",
      encodedValuePointer: "/payloadJson",
      arrayPointer: "/managedProperty",
      matchProperty: "key",
      matchValue: "antiphishing",
      valueProperty: "valueInteger",
    })).toEqual({ found: true, value: 1 });
    expect(resolveEvidenceValue({ payloadJson: "not-base64!" }, {
      kind: "base64-json-array-property",
      encodedValuePointer: "/payloadJson",
      arrayPointer: "/managedProperty",
      matchProperty: "key",
      matchValue: "antiphishing",
      valueProperty: "valueInteger",
    })).toMatchObject({ found: false, invalid: true });
  });

  it("distinguishes verified, changed, missing, and malformed evidence", () => {
    const sourceFile = {
      path: "policy.json",
      blobSha: "a".repeat(40),
      sha256: "b".repeat(64),
      kind: "policy-json",
      parseStatus: "valid",
      selector: { kind: "json-pointer", pointer: "/enabled" },
      jsonValue: { enabled: true },
    };
    expect(compareEvidence(true, sourceFile).status).toBe("verified");
    expect(compareEvidence(false, sourceFile)).toEqual({
      status: "changed",
      observedValue: true,
    });
    expect(compareEvidence(true).status).toBe("missing");
    expect(compareEvidence(true, { ...sourceFile, parseStatus: "invalid" }).status).toBe("invalid");
  });

  it("records duplicate files by raw-byte hash instead of double-counting them", () => {
    const seen = new Map<string, { repositoryId: string; path: string }>();
    expect(findDuplicateSource("same-hash", "windows", "a.json", seen)).toBeUndefined();
    expect(findDuplicateSource("same-hash", "android", "b.json", seen)).toEqual({
      repositoryId: "windows",
      path: "a.json",
    });
  });

  it("rejects mapping definitions with unsupported scenarios, settings, or references", () => {
    expect(() => validateMappings([{
      id: "bad",
      scenarioId: "other",
      stepId: "unknown",
      controlId: "c1",
      name: "bad",
      effect: "prevention",
      rationale: "evidence",
      limitation: "limit",
      repositoryId: "windows",
      evidence: [],
    }])).toThrow("Unknown scenario step");
  });

  it("retains changed and deleted mapping evidence while excluding it from coverage", () => {
    const mapping = {
      id: "phishing-link-warning",
      scenarioId: "aitm-phishing",
      stepId: "phishing-link",
      controlId: "defender-web-protection",
      name: "Web threat protection",
      effect: "prevention",
      rationale: "The setting enables the documented web protection capability.",
      limitation: "It does not prevent session-token replay or every valid sign-in page.",
      repositoryId: "windows",
      evidence: [{
        path: "SettingsCatalog/policy.json",
        selector: { kind: "json-pointer", pointer: "/enabled" },
        expectedValue: true,
        referenceUrl: "https://learn.microsoft.com/en-us/",
      }],
    };
    const source = {
      id: "windows",
      name: "Windows",
      platform: "Windows 11",
      repositoryUrl: "https://github.com/CoC-MS/ALSO-Microsoft-Security-Windows",
      commitSha: "a".repeat(40),
      treeSha: "b".repeat(40),
      fetchedAt: "2026-10-22T12:00:00.000Z",
      files: [{
        path: "SettingsCatalog/policy.json",
        blobSha: "c".repeat(40),
        sha256: "d".repeat(64),
        kind: "policy-json",
        parseStatus: "valid",
        jsonValue: { enabled: false },
      }],
    };
    const index = createCoverageIndex({
      sources: [source],
      mappings: [mapping],
      generatedAt: "2026-10-22T12:00:00.000Z",
    });
    expect(index.mappings[0].evidence[0]).toMatchObject({
      status: "changed",
      expectedValue: true,
      observedValue: false,
      fileSha256: "d".repeat(64),
    });

    const missingIndex = createCoverageIndex({
      sources: [{ ...source, files: [] }],
      mappings: [mapping],
      generatedAt: "2026-10-22T12:00:00.000Z",
    });
    expect(missingIndex.mappings[0].evidence[0].status).toBe("missing");
  });

  it("does not replace the last index when a source tree is truncated or a fetch fails", async () => {
    const cwd = await createWorkspace();
    const outputPath = join(cwd, "public", "attack-policy-coverage.v1.json");
    await writeFile(outputPath, "previous-index\n");
    const sourceSubset = repositorySources;
    const api = (endpoint: string) => {
      if (endpoint.endsWith("/commits/main")) {
        return { sha: "a".repeat(40), commit: { tree: { sha: "b".repeat(40) } } };
      }
      if (endpoint.includes("/git/trees/")) return { truncated: true, tree: [] };
      const name = endpoint.split("/").pop()!;
      return {
        name,
        html_url: `https://github.com/CoC-MS/${name}`,
        default_branch: "main",
      };
    };
    await expect(syncAttackCoverage({ cwd, sources: sourceSubset, request: api }))
      .rejects.toThrow("truncated source tree");
    expect(await readFile(outputPath, "utf8")).toBe("previous-index\n");

    const fetchApi = (endpoint: string) => {
      if (endpoint.endsWith("/commits/main")) {
        return { sha: "a".repeat(40), commit: { tree: { sha: "b".repeat(40) } } };
      }
      if (endpoint.includes("/git/trees/")) {
        return { truncated: false, tree: [{
          type: "blob",
          path: "SettingsCatalog/policy.json",
          sha: "c".repeat(40),
        }] };
      }
      const name = endpoint.split("/").pop()!;
      return {
        name,
        html_url: `https://github.com/CoC-MS/${name}`,
        default_branch: "main",
      };
    };
    await expect(syncAttackCoverage({
      cwd,
      sources: sourceSubset,
      request: fetchApi,
      fetchSource: async () => {
        throw new Error("network unavailable");
      },
    })).rejects.toThrow("network unavailable");
    expect(await readFile(outputPath, "utf8")).toBe("previous-index\n");
  });

  it("creates a complete index only after all nine source inventories succeed", async () => {
    const cwd = await createWorkspace();
    const api = (endpoint: string) => {
      if (endpoint.endsWith("/commits/main")) {
        return { sha: "a".repeat(40), commit: { tree: { sha: "b".repeat(40) } } };
      }
      if (endpoint.includes("/git/trees/")) {
        return { truncated: false, tree: [{
          type: "blob",
          path: "SettingsCatalog/policy.json",
          sha: "c".repeat(40),
        }] };
      }
      const name = endpoint.split("/").pop()!;
      return {
        name,
        html_url: `https://github.com/CoC-MS/${name}`,
        default_branch: "main",
      };
    };
    const result = await syncAttackCoverage({
      cwd,
      request: api,
      fetchSource: async () => Buffer.from('{"enabled":true}', "utf8"),
      now: () => new Date("2026-10-22T12:00:00.000Z"),
    });
    const index = JSON.parse(await readFile(result.outputPath, "utf8"));
    expect(result).toMatchObject({ repositories: 9, files: 9, mappings: 0 });
    expect(index.schemaVersion).toBe(1);
    expect(index.sources).toHaveLength(9);
    expect(index.sources[1].files[0].duplicateOf).toEqual({
      repositoryId: "windows",
      path: "SettingsCatalog/policy.json",
    });
  });
});
