import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, rename, unlink, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";

const owner = "CoC-MS";
const maxFilesPerRepository = 500;
const maxBytesPerFile = 4 * 1024 * 1024;
const maxBytesPerRepository = 32 * 1024 * 1024;
const concurrency = 6;
const relevantExtensions = new Set([
  ".json",
  ".md",
  ".mdx",
  ".ps1",
  ".psm1",
  ".psd1",
  ".sh",
  ".bash",
  ".py",
  ".cmd",
  ".bat",
  ".yml",
  ".yaml",
  ".xml",
]);
const policyFolders = new Set([
  "appconfiguration",
  "appconfigurationmanageddevice",
  "applications",
  "compliance",
  "compliancepolicies",
  "conditionalaccess",
  "deviceconfiguration",
  "devicehealthscripts",
  "endpointsecurity",
  "settingscatalog",
]);
const supportFolders = new Set([
  "assignmentfilters",
  "build-manifest.json",
  "groups",
  "migrationtable.json",
]);

export const repositorySources = [
  { id: "windows", name: "ALSO-Microsoft-Security-Windows", platform: "Windows 11" },
  { id: "windows-server", name: "ALSO-Microsoft-Security-WindowsServer", platform: "Windows Server" },
  { id: "ai-windows-11", name: "ALSO-Microsoft-Security-AI-Security-Windows11", platform: "Windows 11 · AI Security" },
  { id: "conditional-access", name: "ALSO-Microsoft-Security-Conditional-Access", platform: "Microsoft Entra" },
  { id: "linux", name: "ALSO-Microsoft-Security-Linux", platform: "Linux" },
  { id: "macos", name: "ALSO-Microsoft-Security-MacOS", platform: "macOS" },
  { id: "ios-ipados", name: "ALSO-Microsoft-Security-iOSandiPadOS", platform: "iOS and iPadOS" },
  { id: "android", name: "ALSO-Microsoft-Security-Android", platform: "Android" },
  { id: "purview", name: "ALSO-Microsoft-Security-Purview", platform: "Microsoft Purview" },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isJsonValue(value) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  ) return true;
  if (Array.isArray(value)) return value.every(isJsonValue);
  return isRecord(value) && Object.values(value).every(isJsonValue);
}

function assertHttpsUrl(value, label) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid HTTPS URL.`);
  }
  assert(url.protocol === "https:", `${label} must be a valid HTTPS URL.`);
}

function isIsoDate(value) {
  return typeof value === "string" &&
    Number.isFinite(Date.parse(value)) &&
    value.includes("T");
}

export function validateMappings(mappings, sources = repositorySources) {
  assert(Array.isArray(mappings), "Mapping definitions must be a JSON array.");
  const ids = new Set();
  const sourceIds = new Set(sources.map((source) => source.id));
  const scenarioSteps = new Set([
    "aitm-phishing/phishing-link",
    "aitm-phishing/credential-or-session-capture",
    "aitm-phishing/token-reuse",
    "device-code-phishing/authorization-prompt",
    "device-code-phishing/token-issuance",
    "device-code-phishing/resource-access",
    "infostealer/execution",
    "infostealer/collection",
    "infostealer/exfiltration",
    "clickfix/social-engineering",
    "clickfix/command-execution",
    "clickfix/follow-on-activity",
    "llmjacking/credential-exposure",
    "llmjacking/unauthorized-use",
    "llmjacking/resource-consumption",
    "cryptojacking/unauthorized-deployment",
    "cryptojacking/resource-abuse",
    "cryptojacking/persistence",
  ]);
  for (const mapping of mappings) {
    assert(isRecord(mapping), "Each mapping definition must be an object.");
    assert(typeof mapping.id === "string" && mapping.id.length > 0, "A mapping requires an id.");
    assert(!ids.has(mapping.id), `Duplicate mapping id: ${mapping.id}`);
    ids.add(mapping.id);
    assert(scenarioSteps.has(`${mapping.scenarioId}/${mapping.stepId}`), `Unknown scenario step for mapping ${mapping.id}.`);
    assert(typeof mapping.controlId === "string" && mapping.controlId.length > 0, `Mapping ${mapping.id} requires a controlId.`);
    assert(typeof mapping.name === "string" && mapping.name.length > 0, `Mapping ${mapping.id} requires a name.`);
    assert(
      ["prevention", "detection", "supporting-hardening"].includes(mapping.effect),
      `Mapping ${mapping.id} has an unsupported effect.`,
    );
    assert(typeof mapping.rationale === "string" && mapping.rationale.trim(), `Mapping ${mapping.id} requires an evidence-based rationale.`);
    assert(typeof mapping.limitation === "string" && mapping.limitation.trim(), `Mapping ${mapping.id} requires an explicit limitation.`);
    assert(sourceIds.has(mapping.repositoryId), `Mapping ${mapping.id} references an unknown repository.`);
    assert(Array.isArray(mapping.evidence) && mapping.evidence.length > 0, `Mapping ${mapping.id} requires evidence.`);
    for (const evidence of mapping.evidence) {
      assert(isRecord(evidence), `Mapping ${mapping.id} contains malformed evidence.`);
      assert(typeof evidence.path === "string" && evidence.path.length > 0, `Mapping ${mapping.id} evidence requires a path.`);
      assert(!evidence.path.includes("\\") && !evidence.path.split("/").includes(".."), `Mapping ${mapping.id} evidence path must be repository-relative.`);
      assert(isJsonValue(evidence.expectedValue), `Mapping ${mapping.id} expected value must be JSON-compatible.`);
      assert(isRecord(evidence.selector), `Mapping ${mapping.id} evidence requires a selector.`);
      if (evidence.selector.kind === "setting-id") {
        assert(typeof evidence.selector.id === "string" && evidence.selector.id.length > 0, `Mapping ${mapping.id} setting selector requires an id.`);
        assert(typeof evidence.selector.valuePath === "string" && evidence.selector.valuePath.length > 0, `Mapping ${mapping.id} setting selector requires a value path.`);
        assert(
          evidence.selector.occurrence === undefined ||
            (Number.isSafeInteger(evidence.selector.occurrence) && evidence.selector.occurrence >= 0),
          `Mapping ${mapping.id} setting occurrence must be a non-negative integer.`,
        );
      } else if (evidence.selector.kind === "json-pointer") {
        assert(
          typeof evidence.selector.pointer === "string" &&
            (evidence.selector.pointer === "" || evidence.selector.pointer.startsWith("/")),
          `Mapping ${mapping.id} JSON Pointer must be empty or start with '/'.`,
        );
      } else if (
        evidence.selector.kind === "array-object-property" ||
        evidence.selector.kind === "base64-json-array-property"
      ) {
        assert(
          typeof evidence.selector.arrayPointer === "string" &&
            evidence.selector.arrayPointer.startsWith("/") &&
            typeof evidence.selector.matchProperty === "string" &&
            isJsonValue(evidence.selector.matchValue) &&
            typeof evidence.selector.valueProperty === "string" &&
            evidence.selector.valueProperty.length > 0 &&
            (evidence.selector.kind !== "base64-json-array-property" ||
              (typeof evidence.selector.encodedValuePointer === "string" &&
                evidence.selector.encodedValuePointer.startsWith("/"))),
          `Mapping ${mapping.id} array selector requires valid properties and JSON Pointers.`,
        );
        assert(
          evidence.selector.occurrence === undefined ||
            (Number.isSafeInteger(evidence.selector.occurrence) &&
              evidence.selector.occurrence >= 0),
          `Mapping ${mapping.id} array occurrence must be a non-negative integer.`,
        );
      } else {
        throw new Error(`Mapping ${mapping.id} has an unsupported evidence selector.`);
      }
      assertHttpsUrl(evidence.referenceUrl, `Mapping ${mapping.id} reference`);
    }
  }
  return mappings;
}

export function decodeSourceText(buffer) {
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    return new TextDecoder("utf-16le", { fatal: true }).decode(buffer.subarray(2));
  }
  if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
    return new TextDecoder("utf-16be", { fatal: true }).decode(buffer.subarray(2));
  }
  const content = buffer.length >= 3 &&
      buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf
    ? buffer.subarray(3)
    : buffer;
  return new TextDecoder("utf-8", { fatal: true }).decode(content);
}

export function classifySourceFile(path) {
  const lower = path.toLowerCase();
  const extension = lower.slice(lower.lastIndexOf("."));
  const segments = lower.split("/");
  const filename = basename(lower);
  if (
    segments.some((segment) => segment === "docs" || segment === "documentation") ||
    ["readme.md", "security.md", "license.md", "changelog.md"].includes(filename) ||
    [".md", ".mdx", ".txt"].includes(extension)
  ) return "documentation";
  if ([".ps1", ".psm1", ".sh", ".bash", ".py", ".cmd", ".bat"].includes(extension)) {
    return "script";
  }
  if (extension === ".psd1") return "supporting";
  if (extension !== ".json") return "supporting";
  if (
    supportFolders.has(filename) ||
    segments.some((segment) => supportFolders.has(segment))
  ) return "supporting";
  return segments.some((segment) => policyFolders.has(segment))
    ? "policy-json"
    : "unknown";
}

function githubApi(endpoint) {
  try {
    return JSON.parse(execFileSync("gh", ["api", endpoint], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 32 * 1024 * 1024,
      timeout: 30_000,
    }));
  } catch {
    throw new Error(`GitHub API request failed for ${endpoint}. Check repository access, rate limits, and the GitHub CLI login.`);
  }
}

function sourcePathUrl(repositoryUrl, commitSha, path) {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${repositoryUrl}/blob/${commitSha}/${encodedPath}`;
}

function decodeJson(buffer) {
  try {
    return { valid: true, value: JSON.parse(decodeSourceText(buffer)) };
  } catch {
    return { valid: false };
  }
}

function getJsonPointer(value, pointer) {
  if (pointer === "") return { found: true, value };
  const parts = pointer.slice(1).split("/").map((part) =>
    part.replace(/~1/g, "/").replace(/~0/g, "~"),
  );
  let current = value;
  for (const part of parts) {
    if (
      current === null ||
      (typeof current !== "object") ||
      !(part in current)
    ) return { found: false };
    current = current[part];
  }
  return { found: true, value: current };
}

function getDottedValue(value, path) {
  let current = value;
  for (const part of path.split(".")) {
    if (
      current === null ||
      typeof current !== "object" ||
      !(part in current)
    ) return { found: false };
    current = current[part];
  }
  return { found: true, value: current };
}

function getSettingValue(value, selector) {
  const matches = [];
  const stack = [value];
  while (stack.length > 0) {
    const current = stack.pop();
    if (Array.isArray(current)) {
      for (let index = current.length - 1; index >= 0; index--) stack.push(current[index]);
    } else if (isRecord(current)) {
      if (current.settingDefinitionId === selector.id) {
        matches.push(getDottedValue(current, selector.valuePath));
      }
      for (const child of Object.values(current)) stack.push(child);
    }
  }

  const selected = selector.occurrence === undefined
    ? matches
    : matches.slice(selector.occurrence, selector.occurrence + 1);
  if (selected.length === 0) return { found: false };
  if (selected.length !== 1 || !selected[0].found) return { found: false, invalid: true };
  return { found: true, value: selected[0].value };
}

function getArrayObjectProperty(value, selector) {
  const array = getJsonPointer(value, selector.arrayPointer);
  if (!array.found || !Array.isArray(array.value)) {
    return { found: false, invalid: array.found };
  }
  const matches = array.value.filter((item) =>
    isRecord(item) &&
    Object.hasOwn(item, selector.matchProperty) &&
    isDeepStrictEqual(item[selector.matchProperty], selector.matchValue),
  );
  if (matches.length === 0) return { found: false };
  if (selector.occurrence === undefined && matches.length !== 1) {
    return { found: false, invalid: true };
  }
  const item = selector.occurrence === undefined
    ? matches[0]
    : matches[selector.occurrence];
  if (!item) return { found: false };
  return getDottedValue(item, selector.valueProperty);
}

function isBase64(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) return false;
  if (value.endsWith("==")) return (value.length - 2) % 4 === 2;
  if (value.endsWith("=")) return (value.length - 1) % 4 === 3;
  return value.length % 4 !== 1;
}

export function resolveEvidenceValue(value, selector) {
  if (selector.kind === "json-pointer") return getJsonPointer(value, selector.pointer);
  if (selector.kind === "setting-id") return getSettingValue(value, selector);
  if (selector.kind === "array-object-property") {
    return getArrayObjectProperty(value, selector);
  }
  if (selector.kind === "base64-json-array-property") {
    const encoded = getJsonPointer(value, selector.encodedValuePointer);
    if (!encoded.found || typeof encoded.value !== "string") {
      return { found: false };
    }
    if (!isBase64(encoded.value)) return { found: false, invalid: true };
    try {
      const decoded = JSON.parse(decodeSourceText(Buffer.from(encoded.value, "base64")));
      return getArrayObjectProperty(decoded, selector);
    } catch {
      return { found: false, invalid: true };
    }
  }
  throw new Error("Unsupported evidence selector.");
}

export function compareEvidence(expectedValue, sourceFile) {
  if (!sourceFile) return { status: "missing", observedValue: null };
  if (sourceFile.parseStatus !== "valid" || sourceFile.jsonValue === undefined) {
    return { status: "invalid", observedValue: null };
  }
  const result = resolveEvidenceValue(sourceFile.jsonValue, sourceFile.selector);
  if (result.invalid) return { status: "invalid", observedValue: null };
  if (!result.found) return { status: "missing", observedValue: null };
  return {
    status: isDeepStrictEqual(result.value, expectedValue) ? "verified" : "changed",
    observedValue: result.value,
  };
}

export function getUntruncatedTreeEntries(tree, repositoryName) {
  if (!tree || tree.truncated) {
    throw new Error(`GitHub returned a truncated source tree for ${repositoryName}; inventory was not written.`);
  }
  if (!Array.isArray(tree.tree)) {
    throw new Error(`GitHub returned a malformed source tree for ${repositoryName}.`);
  }
  if (!tree.tree.every((entry) =>
    isRecord(entry) &&
    typeof entry.path === "string" &&
    entry.path.length > 0 &&
    typeof entry.type === "string" &&
    /^[a-f0-9]{40,64}$/i.test(entry.sha),
  )) {
    throw new Error(`GitHub returned malformed source entries for ${repositoryName}.`);
  }
  return tree.tree;
}

export function findDuplicateSource(sha256, repositoryId, path, seenHashes) {
  const firstSource = seenHashes.get(sha256);
  if (firstSource) return firstSource;
  seenHashes.set(sha256, { repositoryId, path });
  return undefined;
}

async function fetchRawFile(repositoryName, commitSha, path, byteBudget) {
  const rawPath = path.split("/").map(encodeURIComponent).join("/");
  const url = `https://raw.githubusercontent.com/${owner}/${repositoryName}/${commitSha}/${rawPath}`;
  let response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(20_000),
      headers: process.env.GH_TOKEN
        ? { authorization: `Bearer ${process.env.GH_TOKEN}` }
        : undefined,
    });
  } catch {
    throw new Error(`Source file fetch failed for ${repositoryName}/${path}.`);
  }
  if (!response.ok) {
    throw new Error(`Source file fetch failed for ${repositoryName}/${path} (HTTP ${response.status}).`);
  }
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error(`Source file response has no readable body: ${repositoryName}/${path}.`);
  }
  const chunks = [];
  let byteLength = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    byteLength += value.length;
    if (byteLength > maxBytesPerFile) {
      await reader.cancel();
      throw new Error(`Source file exceeds the ${maxBytesPerFile}-byte limit: ${repositoryName}/${path}.`);
    }
    chunks.push(Buffer.from(value));
  }
  const buffer = Buffer.concat(chunks, byteLength);
  if (byteBudget.value + buffer.length > maxBytesPerRepository) {
    throw new Error(`Inventory exceeds the ${maxBytesPerRepository}-byte limit for ${repositoryName}.`);
  }
  byteBudget.value += buffer.length;
  return buffer;
}

async function mapWithConcurrency(values, limit, mapItem) {
  const results = new Array(values.length);
  let nextIndex = 0;
  async function worker() {
    while (true) {
      const index = nextIndex++;
      if (index >= values.length) return;
      results[index] = await mapItem(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, worker));
  return results;
}

async function inventoryRepository(
  spec,
  fetchedAt,
  duplicateHashes,
  { request = githubApi, fetchSource = fetchRawFile } = {},
) {
  const endpoint = `repos/${owner}/${spec.name}`;
  const metadata = request(endpoint);
  const repositoryUrl = metadata.html_url;
  assertHttpsUrl(repositoryUrl, `Repository URL for ${spec.name}`);
  const branch = encodeURIComponent(metadata.default_branch);
  const commit = request(`${endpoint}/commits/${branch}`);
  const commitSha = commit.sha;
  const treeSha = commit.commit?.tree?.sha;
  assert(/^[a-f0-9]{40,64}$/i.test(commitSha), `Invalid current commit SHA for ${spec.name}.`);
  assert(/^[a-f0-9]{40,64}$/i.test(treeSha), `Invalid current tree SHA for ${spec.name}.`);
  const tree = request(`${endpoint}/git/trees/${treeSha}?recursive=1`);
  const entries = getUntruncatedTreeEntries(tree, spec.name).filter((entry) =>
    entry.type === "blob" &&
    relevantExtensions.has(entry.path.slice(entry.path.lastIndexOf(".")).toLowerCase()),
  );
  if (entries.length > maxFilesPerRepository) {
    throw new Error(`${spec.name} contains ${entries.length} relevant files, above the ${maxFilesPerRepository}-file safety limit.`);
  }

  const byteBudget = { value: 0 };
  const files = await mapWithConcurrency(entries, concurrency, async (entry) => {
    const kind = classifySourceFile(entry.path);
    const extension = entry.path.slice(entry.path.lastIndexOf(".")).toLowerCase();
    const buffer = await fetchSource(spec.name, commitSha, entry.path, byteBudget);
    const sha256 = createHash("sha256").update(buffer).digest("hex");
    let parseStatus = "not-applicable";
    let jsonValue;
    if (extension === ".json") {
      const parsed = decodeJson(buffer);
      if (!parsed.valid) {
        parseStatus = "invalid";
      } else {
        parseStatus = "valid";
        jsonValue = parsed.value;
      }
    }
    const file = {
      path: entry.path,
      blobSha: entry.sha,
      sha256,
      kind,
      parseStatus,
    };
    if (jsonValue !== undefined) file.jsonValue = jsonValue;
    const duplicate = findDuplicateSource(
      sha256,
      spec.id,
      entry.path,
      duplicateHashes,
    );
    if (duplicate) {
      file.duplicateOf = { repositoryId: duplicate.repositoryId, path: duplicate.path };
    }
    return file;
  });

  return {
    id: spec.id,
    name: metadata.name,
    platform: spec.platform,
    repositoryUrl,
    commitSha,
    treeSha,
    fetchedAt,
    files,
  };
}

function buildMappings(definitions, sources) {
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  return definitions.map((definition) => {
    const source = sourceById.get(definition.repositoryId);
    return {
      ...definition,
      evidence: definition.evidence.map((evidenceDefinition) => {
        const sourceFile = source.files.find((file) => file.path === evidenceDefinition.path);
        const verification = sourceFile
          ? compareEvidence(evidenceDefinition.expectedValue, {
            ...sourceFile,
            selector: evidenceDefinition.selector,
            jsonValue: sourceFile.jsonValue,
          })
          : { status: "missing", observedValue: null };
        const { jsonValue, ...fileRecord } = sourceFile ?? {};
        return {
          ...evidenceDefinition,
          ...verification,
          sourceUrl: sourcePathUrl(source.repositoryUrl, source.commitSha, evidenceDefinition.path),
          fileSha256: fileRecord?.sha256 ?? null,
        };
      }),
    };
  });
}

export function createCoverageIndex({ sources, mappings, generatedAt }) {
  return {
    schemaVersion: 1,
    generatedAt,
    sources: sources.map((source) => ({
      ...source,
      files: source.files.map(({ jsonValue, ...file }) => file),
    })),
    mappings: buildMappings(mappings, sources),
  };
}

export function validateCoverageIndex(index, expectedSources = repositorySources) {
  assert(isRecord(index) && index.schemaVersion === 1, "Coverage index has an unsupported schema version.");
  assert(isIsoDate(index.generatedAt), "Coverage index has an invalid generation timestamp.");
  assert(Array.isArray(index.sources), "Coverage index sources must be an array.");
  assert(index.sources.length === expectedSources.length, "Coverage index must contain all nine configured source repositories.");
  const expectedIds = new Set(expectedSources.map((source) => source.id));
  const actualIds = new Set();
  const sourceFiles = new Map();
  for (const source of index.sources) {
    assert(isRecord(source), "Coverage index contains malformed source metadata.");
    assert(expectedIds.has(source.id), `Unexpected coverage source: ${source.id}`);
    assert(!actualIds.has(source.id), `Duplicate coverage source: ${source.id}`);
    actualIds.add(source.id);
    assert(typeof source.name === "string" && source.name.length > 0, `Source ${source.id} has no name.`);
    assert(typeof source.platform === "string" && source.platform.length > 0, `Source ${source.id} has no platform.`);
    assertHttpsUrl(source.repositoryUrl, `Repository URL for ${source.id}`);
    assert(/^[a-f0-9]{40,64}$/i.test(source.commitSha), `Source ${source.id} has an invalid commit SHA.`);
    assert(/^[a-f0-9]{40,64}$/i.test(source.treeSha), `Source ${source.id} has an invalid tree SHA.`);
    assert(isIsoDate(source.fetchedAt), `Source ${source.id} has an invalid fetch timestamp.`);
    assert(Array.isArray(source.files), `Source ${source.id} files must be an array.`);
    const filePaths = new Set();
    for (const file of source.files) {
      assert(isRecord(file), `Source ${source.id} contains malformed file metadata.`);
      assert(typeof file.path === "string" && file.path.length > 0, `Source ${source.id} contains a file without a path.`);
      assert(!file.path.includes("\\") && !file.path.split("/").includes(".."), `Source ${source.id} contains a non-relative source path.`);
      assert(!filePaths.has(file.path), `Source ${source.id} contains duplicate path ${file.path}.`);
      filePaths.add(file.path);
      assert(/^[a-f0-9]{40,64}$/i.test(file.blobSha), `Source file ${source.id}/${file.path} has an invalid Git blob SHA.`);
      assert(/^[a-f0-9]{64}$/i.test(file.sha256), `Source file ${source.id}/${file.path} has an invalid SHA-256.`);
      assert(["policy-json", "documentation", "script", "supporting", "unknown"].includes(file.kind), `Source file ${source.id}/${file.path} has an invalid classification.`);
      assert(["valid", "invalid", "not-applicable"].includes(file.parseStatus), `Source file ${source.id}/${file.path} has an invalid parse status.`);
    }
    sourceFiles.set(source.id, filePaths);
  }
  assert(
    expectedSources.every((source) => actualIds.has(source.id)),
    "Coverage index is missing one or more configured source repositories.",
  );
  for (const source of index.sources) {
    for (const file of source.files) {
      if (file.duplicateOf) {
        assert(
          sourceFiles.get(file.duplicateOf.repositoryId)?.has(file.duplicateOf.path),
          `Duplicate source reference is missing for ${source.id}/${file.path}.`,
        );
      }
    }
  }
  assert(Array.isArray(index.mappings), "Coverage index mappings must be an array.");
  validateMappings(index.mappings, expectedSources);
  const mappingIds = new Set();
  for (const mapping of index.mappings) {
    assert(isRecord(mapping), "Coverage index contains malformed mapping evidence.");
    assert(!mappingIds.has(mapping.id), `Duplicate coverage mapping: ${mapping.id}`);
    mappingIds.add(mapping.id);
    assert(actualIds.has(mapping.repositoryId), `Mapping ${mapping.id} references an unknown repository.`);
    assert(Array.isArray(mapping.evidence) && mapping.evidence.length > 0, `Mapping ${mapping.id} has no evidence.`);
    for (const evidence of mapping.evidence) {
      assert(isRecord(evidence), `Mapping ${mapping.id} contains malformed evidence.`);
      assert(["verified", "changed", "missing", "invalid"].includes(evidence.status), `Mapping ${mapping.id} has an invalid evidence status.`);
      assert(isJsonValue(evidence.expectedValue) && isJsonValue(evidence.observedValue), `Mapping ${mapping.id} contains a non-JSON setting value.`);
      assertHttpsUrl(evidence.sourceUrl, `Source link for mapping ${mapping.id}`);
      assertHttpsUrl(evidence.referenceUrl, `Reference link for mapping ${mapping.id}`);
      assert(evidence.fileSha256 === null || /^[a-f0-9]{64}$/i.test(evidence.fileSha256), `Mapping ${mapping.id} has an invalid source content hash.`);
      const source = index.sources.find((item) => item.id === mapping.repositoryId);
      const file = source.files.find((item) => item.path === evidence.path);
      assert(
        evidence.sourceUrl === sourcePathUrl(source.repositoryUrl, source.commitSha, evidence.path) &&
        evidence.fileSha256 === (file?.sha256 ?? null),
        `Mapping ${mapping.id} evidence does not match its source snapshot.`,
      );
      if (evidence.status === "verified") {
        assert(
          file?.parseStatus === "valid" &&
          isDeepStrictEqual(evidence.expectedValue, evidence.observedValue),
          `Mapping ${mapping.id} has inconsistent verified evidence.`,
        );
      }
      if (evidence.status === "changed") {
        assert(
          file?.parseStatus === "valid" &&
          !isDeepStrictEqual(evidence.expectedValue, evidence.observedValue),
          `Mapping ${mapping.id} has inconsistent changed evidence.`,
        );
      }
    }
  }
  return index;
}

export async function syncAttackCoverage({
  cwd = process.cwd(),
  sources = repositorySources,
  now = () => new Date(),
  request = githubApi,
  fetchSource = fetchRawFile,
} = {}) {
  assert(sources.length === repositorySources.length, "The inventory must include all nine configured source repositories.");
  const definitions = validateMappings(JSON.parse(
    await readFile(join(cwd, "scripts", "attack-coverage-mappings.json"), "utf8"),
  ), sources);
  const generatedAt = now().toISOString();
  const duplicateHashes = new Map();
  const inventory = [];
  for (const source of sources) {
    inventory.push(await inventoryRepository(source, generatedAt, duplicateHashes, {
      request,
      fetchSource,
    }));
  }
  const index = createCoverageIndex({ sources: inventory, mappings: definitions, generatedAt });
  validateCoverageIndex(index, sources);
  const outputPath = join(cwd, "public", "attack-policy-coverage.v1.json");
  const temporaryPath = `${outputPath}.${process.pid}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(index)}\n`, { flag: "w" });
  try {
    await rename(temporaryPath, outputPath);
  } catch (error) {
    await unlink(temporaryPath).catch(() => {});
    throw error;
  }
  return {
    outputPath,
    repositories: inventory.length,
    files: inventory.reduce((count, source) => count + source.files.length, 0),
    mappings: index.mappings.length,
    verifiedMappings: index.mappings.filter((mapping) =>
      mapping.evidence.every((evidence) => evidence.status === "verified"),
    ).length,
    generatedAt,
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    const result = await syncAttackCoverage();
    console.log(
      `Synchronized ${result.files} source files from ${result.repositories} repositories: ${result.verifiedMappings}/${result.mappings} mappings verified; ${result.mappings - result.verifiedMappings} require review.`,
    );
  } catch (error) {
    console.error(`Attack policy inventory synchronization failed: ${error.message}`);
    process.exitCode = 1;
  }
}
