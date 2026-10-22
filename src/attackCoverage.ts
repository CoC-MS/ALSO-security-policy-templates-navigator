const attackTechniques = {
  "T1041": {
    id: "T1041",
    name: "Exfiltration Over C2 Channel",
    url: "https://attack.mitre.org/techniques/T1041/",
  },
  "T1547.001": {
    id: "T1547.001",
    name: "Boot or Logon Autostart Execution: Registry Run Keys / Startup Folder",
    url: "https://attack.mitre.org/techniques/T1547/001/",
  },
  "T1566.002": {
    id: "T1566.002",
    name: "Phishing: Spearphishing Link",
    url: "https://attack.mitre.org/techniques/T1566/002/",
  },
  "T1059": {
    id: "T1059",
    name: "Command and Scripting Interpreter",
    url: "https://attack.mitre.org/techniques/T1059/",
  },
  "T1078.004": {
    id: "T1078.004",
    name: "Valid Accounts: Cloud Accounts",
    url: "https://attack.mitre.org/techniques/T1078/004/",
  },
  "T1105": {
    id: "T1105",
    name: "Ingress Tool Transfer",
    url: "https://attack.mitre.org/techniques/T1105/",
  },
  "T1204.002": {
    id: "T1204.002",
    name: "User Execution: Malicious File",
    url: "https://attack.mitre.org/techniques/T1204/002/",
  },
  "T1204.004": {
    id: "T1204.004",
    name: "User Execution: Malicious Copy and Paste",
    url: "https://attack.mitre.org/techniques/T1204/004/",
  },
  "T1496.001": {
    id: "T1496.001",
    name: "Resource Hijacking: Compute Hijacking",
    url: "https://attack.mitre.org/techniques/T1496/001/",
  },
  "T1496.004": {
    id: "T1496.004",
    name: "Resource Hijacking: Cloud Service Hijacking",
    url: "https://attack.mitre.org/techniques/T1496/004/",
  },
  "T1528": {
    id: "T1528",
    name: "Steal Application Access Token",
    url: "https://attack.mitre.org/techniques/T1528/",
  },
  "T1539": {
    id: "T1539",
    name: "Steal Web Session Cookie",
    url: "https://attack.mitre.org/techniques/T1539/",
  },
  "T1550.001": {
    id: "T1550.001",
    name: "Use Alternate Authentication Material: Application Access Token",
    url: "https://attack.mitre.org/techniques/T1550/001/",
  },
  "T1550.004": {
    id: "T1550.004",
    name: "Use Alternate Authentication Material: Web Session Cookie",
    url: "https://attack.mitre.org/techniques/T1550/004/",
  },
  "T1555.003": {
    id: "T1555.003",
    name: "Credentials from Web Browsers",
    url: "https://attack.mitre.org/techniques/T1555/003/",
  },
} as const;

export const attackScenarios = [
  {
    id: "aitm-phishing",
    name: "AiTM phishing",
    summary: "A phishing proxy relays authentication and attempts to reuse a victim's session.",
    boundary: "Policy templates can reduce exposure to known phishing links and strengthen device access conditions; they do not prove phishing-resistant authentication, token binding, or prevention of session replay.",
    steps: [
      {
        id: "phishing-link",
        name: "Reach a phishing link",
        techniques: [{
          ...attackTechniques["T1566.002"],
          relevance: "Relevant when the adversary-in-the-middle flow begins with a spearphishing link; this does not describe the proxy or establish that a policy blocks it.",
        }],
      },
      {
        id: "credential-or-session-capture",
        name: "Capture credentials or a session",
        techniques: [
          {
            ...attackTechniques.T1539,
            relevance: "Describes theft of web session cookies, including via malicious proxy; it is behavioral context, not evidence of prevention.",
          },
          {
            ...attackTechniques.T1528,
            relevance: "Related when application access tokens are stolen; it is not a specific label for AiTM phishing.",
          },
        ],
      },
      {
        id: "token-reuse",
        name: "Reuse the intercepted session",
        techniques: [{
          ...attackTechniques["T1550.004"],
          relevance: "Describes using a stolen web session cookie as authentication material; this is not a claim that listed templates prevent replay.",
        }],
      },
    ],
  },
  {
    id: "device-code-phishing",
    name: "Device-code phishing",
    summary: "A victim is tricked into authorizing an attacker-controlled client with a device code.",
    boundary: "The explorer covers library settings relevant to restricting device-code sign-ins. It does not establish whether a tenant blocks, monitors, or safely uses the flow.",
    steps: [
      {
        id: "authorization-prompt",
        name: "Present an attacker-controlled authorization request",
        techniques: [{
          ...attackTechniques["T1566.002"],
          relevance: "MITRE includes links targeting device-based authorization and device-code phishing under this technique; this describes lure delivery, not a policy mitigation.",
        }],
      },
      {
        id: "token-issuance",
        name: "Obtain a token after user authorization",
        techniques: [{
          ...attackTechniques.T1528,
          relevance: "Related token-acquisition behavior; the ATT&CK technique does not specifically identify the device-code flow.",
        }],
      },
      {
        id: "resource-access",
        name: "Use the token to access resources",
        techniques: [{
          ...attackTechniques["T1550.001"],
          relevance: "Relevant if the obtained application token is used as alternate authentication material; not a device-code-specific technique.",
        }],
      },
    ],
  },
  {
    id: "infostealer",
    name: "Infostealer",
    summary: "Malware collects credentials, browser data, or other sensitive information from a device.",
    boundary: "Policy templates may harden device and identity controls, but this library view cannot establish detection, malware removal, or protection of every stored secret.",
    steps: [
      {
        id: "execution",
        name: "Execute on a device",
        techniques: [{
          ...attackTechniques["T1204.002"],
          relevance: "One possible user-execution route for an infostealer delivered as a malicious file; other delivery methods exist.",
        }],
      },
      {
        id: "collection",
        name: "Collect credentials or sensitive data",
        techniques: [{
          ...attackTechniques["T1555.003"],
          relevance: "Covers credential theft from web browsers; infostealers may also collect other data and use other techniques.",
        }],
      },
      {
        id: "exfiltration",
        name: "Send collected data to an operator",
        techniques: [{
          ...attackTechniques.T1041,
          relevance: "Applies when stolen data is sent over an existing command-and-control channel; this is not universal to infostealers.",
        }],
      },
    ],
  },
  {
    id: "clickfix",
    name: "ClickFix",
    summary: "A user is socially engineered into running a command or payload on their device.",
    boundary: "A configuration that reduces script or payload execution risk does not prove that a particular prompt, payload, or execution path is blocked.",
    steps: [
      {
        id: "social-engineering",
        name: "Convince a user to follow an instruction",
        techniques: [{
          ...attackTechniques["T1204.004"],
          relevance: "Direct behavioral match for malicious copy-and-paste lures such as ClickFix; the technique is not itself a prevention mapping.",
        }],
      },
      {
        id: "command-execution",
        name: "Run a command or payload",
        techniques: [{
          ...attackTechniques.T1059,
          relevance: "Relevant when the copied instruction runs through a command or scripting interpreter; the specific interpreter varies.",
        }],
      },
      {
        id: "follow-on-activity",
        name: "Perform follow-on activity on the device",
        techniques: [{
          ...attackTechniques.T1105,
          relevance: "Relevant only when follow-on activity transfers tools or files into the compromised environment.",
        }],
      },
    ],
  },
  {
    id: "llmjacking",
    name: "LLMjacking",
    summary: "An attacker abuses exposed credentials or access to consume hosted LLM services.",
    boundary: "Endpoint and identity hardening can reduce exposure, but these templates cannot establish provider-side usage limits, credential revocation, or prevention of all unauthorized model use.",
    steps: [
      {
        id: "credential-exposure",
        name: "Obtain or expose service credentials",
        techniques: [{
          ...attackTechniques.T1528,
          relevance: "Related when application access tokens are stolen; provider API-key exposure can differ and is not fully represented by this technique.",
        }],
      },
      {
        id: "unauthorized-use",
        name: "Use credentials to access an LLM service",
        techniques: [{
          ...attackTechniques["T1496.004"],
          relevance: "MITRE describes LLMjacking under Cloud Service Hijacking; this taxonomy reference does not imply that the policy library mitigates it.",
        }],
      },
      {
        id: "resource-consumption",
        name: "Consume service quota or incur charges",
        techniques: [{
          ...attackTechniques["T1496.004"],
          relevance: "The technique includes misuse of cloud-hosted AI services with cost, quota, or availability impact; this is context, not coverage evidence.",
        }],
      },
    ],
  },
  {
    id: "cryptojacking",
    name: "Cryptojacking",
    summary: "Unauthorized software uses a device or cloud resource to mine cryptocurrency.",
    boundary: "Policy-library evidence may harden endpoints; it does not measure runtime activity, prove mining is blocked, or cover every cloud workload.",
    steps: [
      {
        id: "unauthorized-deployment",
        name: "Introduce unauthorized mining software",
        techniques: [{
          ...attackTechniques["T1496.001"],
          relevance: "Compute Hijacking includes cryptomining, but this scenario step does not imply a particular deployment method or library protection.",
        }],
      },
      {
        id: "resource-abuse",
        name: "Use compute resources for mining",
        techniques: [{
          ...attackTechniques["T1496.001"],
          relevance: "Directly describes abuse of compute resources for cryptocurrency mining; the reference is a threat taxonomy, not a mitigation claim.",
        }],
      },
      {
        id: "persistence",
        name: "Maintain unauthorized execution",
        techniques: [{
          ...attackTechniques["T1547.001"],
          relevance: "Relevant only when Windows Registry Run Keys or Startup Folder are used for persistence; cryptojacking does not require this method.",
        }],
      },
    ],
  },
] as const;

export type AttackScenarioId = (typeof attackScenarios)[number]["id"];
export type AttackStepId = (typeof attackScenarios)[number]["steps"][number]["id"];
export interface AttackTechniqueReference {
  id: string;
  name: string;
  url: string;
  relevance: string;
}
export type CoverageEffect = "prevention" | "detection" | "supporting-hardening";
export type EvidenceStatus = "verified" | "changed" | "missing" | "invalid";

export interface InventoryFile {
  path: string;
  blobSha: string;
  sha256: string;
  kind: "policy-json" | "documentation" | "script" | "supporting" | "unknown";
  parseStatus: "valid" | "invalid" | "not-applicable";
  duplicateOf?: { repositoryId: string; path: string };
}

export type InventoryCoverageStatus = "mapped" | "not-mapped" | "unsupported";

export interface CoverageSource {
  id: string;
  name: string;
  platform: string;
  repositoryUrl: string;
  commitSha: string;
  treeSha: string;
  fetchedAt: string;
  files: InventoryFile[];
}

export interface CoverageEvidence {
  path: string;
  selector:
    | { kind: "setting-id"; id: string; valuePath: string; occurrence?: number }
    | { kind: "json-pointer"; pointer: string }
    | {
      kind: "array-object-property";
      arrayPointer: string;
      matchProperty: string;
      matchValue: unknown;
      valueProperty: string;
      occurrence?: number;
    }
    | {
      kind: "base64-json-array-property";
      encodedValuePointer: string;
      arrayPointer: string;
      matchProperty: string;
      matchValue: unknown;
      valueProperty: string;
      occurrence?: number;
    };
  expectedValue: unknown;
  observedValue: unknown;
  status: EvidenceStatus;
  sourceUrl: string;
  fileSha256: string | null;
  referenceUrl: string;
}

export interface CoverageMapping {
  id: string;
  scenarioId: AttackScenarioId;
  stepId: AttackStepId;
  controlId: string;
  name: string;
  effect: CoverageEffect;
  rationale: string;
  limitation: string;
  repositoryId: string;
  evidence: CoverageEvidence[];
}

export interface AttackCoverageIndex {
  schemaVersion: 1;
  generatedAt: string;
  sources: CoverageSource[];
  mappings: CoverageMapping[];
}

const SHA_PATTERN = /^[a-f0-9]{40,64}$/i;
const EFFECTS = new Set<CoverageEffect>([
  "prevention",
  "detection",
  "supporting-hardening",
]);
const EVIDENCE_STATUSES = new Set<EvidenceStatus>([
  "verified",
  "changed",
  "missing",
  "invalid",
]);
export const configuredCoverageRepositories = {
  windows: "https://github.com/CoC-MS/ALSO-Microsoft-Security-Windows",
  "windows-server": "https://github.com/CoC-MS/ALSO-Microsoft-Security-WindowsServer",
  "ai-windows-11": "https://github.com/CoC-MS/ALSO-Microsoft-Security-AI-Security-Windows11",
  "conditional-access": "https://github.com/CoC-MS/ALSO-Microsoft-Security-Conditional-Access",
  linux: "https://github.com/CoC-MS/ALSO-Microsoft-Security-Linux",
  macos: "https://github.com/CoC-MS/ALSO-Microsoft-Security-MacOS",
  "ios-ipados": "https://github.com/CoC-MS/ALSO-Microsoft-Security-iOSandiPadOS",
  android: "https://github.com/CoC-MS/ALSO-Microsoft-Security-Android",
  purview: "https://github.com/CoC-MS/ALSO-Microsoft-Security-Purview",
} as const;
export const configuredCoverageSourceIds = Object.keys(
  configuredCoverageRepositories,
) as Array<keyof typeof configuredCoverageRepositories>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" &&
    Number.isFinite(Date.parse(value)) &&
    value.includes("T");
}

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isJsonValue(value: unknown): boolean {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  ) return true;
  if (Array.isArray(value)) return value.every(isJsonValue);
  return isRecord(value) && Object.values(value).every(isJsonValue);
}

function isRepositoryRelativePath(value: unknown): value is string {
  return typeof value === "string" &&
    value.length > 0 &&
    !value.startsWith("/") &&
    !value.includes("\\") &&
    !value.split("/").includes("..") &&
    !value.split("/").includes(".");
}

function areJsonValuesEqual(left: unknown, right: unknown): boolean {
  if (left === right) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((item, index) => areJsonValuesEqual(item, right[index]));
  }
  if (isRecord(left) || isRecord(right)) {
    if (!isRecord(left) || !isRecord(right)) return false;
    const leftKeys = Object.keys(left).sort();
    const rightKeys = Object.keys(right).sort();
    return leftKeys.length === rightKeys.length &&
      leftKeys.every((key, index) =>
        key === rightKeys[index] &&
        areJsonValuesEqual(left[key], right[key]),
      );
  }
  return false;
}

function isScenarioId(value: unknown): value is AttackScenarioId {
  return attackScenarios.some((scenario) => scenario.id === value);
}

function isStepId(scenarioId: AttackScenarioId, value: unknown): value is AttackStepId {
  return attackScenarios
    .find((scenario) => scenario.id === scenarioId)!
    .steps.some((step) => step.id === value);
}

function isInventoryFile(value: unknown): value is InventoryFile {
  if (!isRecord(value)) return false;
  const validKind = [
    "policy-json",
    "documentation",
    "script",
    "supporting",
    "unknown",
  ].includes(String(value.kind));
  const validParseStatus = ["valid", "invalid", "not-applicable"].includes(
    String(value.parseStatus),
  );
  const validDuplicate = value.duplicateOf === undefined ||
    (isRecord(value.duplicateOf) &&
      typeof value.duplicateOf.repositoryId === "string" &&
      typeof value.duplicateOf.path === "string");
  return isRepositoryRelativePath(value.path) &&
    typeof value.blobSha === "string" &&
    SHA_PATTERN.test(value.blobSha) &&
    typeof value.sha256 === "string" &&
    /^[a-f0-9]{64}$/i.test(value.sha256) &&
    validKind &&
    validParseStatus &&
    validDuplicate;
}

function isCoverageSource(value: unknown): value is CoverageSource {
  return isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.platform === "string" &&
    isHttpsUrl(value.repositoryUrl) &&
    configuredCoverageSourceIds.includes(
      value.id as keyof typeof configuredCoverageRepositories,
    ) &&
    value.repositoryUrl ===
      configuredCoverageRepositories[
        value.id as keyof typeof configuredCoverageRepositories
      ] &&
    typeof value.commitSha === "string" &&
    SHA_PATTERN.test(value.commitSha) &&
    typeof value.treeSha === "string" &&
    SHA_PATTERN.test(value.treeSha) &&
    isIsoDate(value.fetchedAt) &&
    Array.isArray(value.files) &&
    value.files.every(isInventoryFile);
}

export function isAttackCoverageIndex(value: unknown): value is AttackCoverageIndex {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1 ||
    !isIsoDate(value.generatedAt) ||
    !Array.isArray(value.sources) ||
    value.sources.length !== configuredCoverageSourceIds.length ||
    !Array.isArray(value.mappings)
  ) return false;

  const sourceIds = new Set<string>();
  const sourceFiles = new Map<string, Set<string>>();
  for (const source of value.sources) {
    if (
      !isCoverageSource(source) ||
      source.id.length === 0 ||
      !configuredCoverageSourceIds.includes(
        source.id as (typeof configuredCoverageSourceIds)[number],
      ) ||
      sourceIds.has(source.id)
    ) return false;
    const filePaths = new Set<string>();
    for (const file of source.files) {
      if (filePaths.has(file.path)) return false;
      filePaths.add(file.path);
    }
    sourceIds.add(source.id);
    sourceFiles.set(source.id, filePaths);
  }
  if (
    configuredCoverageSourceIds.some((sourceId) => !sourceIds.has(sourceId))
  ) return false;
  for (const source of value.sources) {
    for (const file of source.files) {
      if (
        file.duplicateOf &&
        (!sourceFiles.get(file.duplicateOf.repositoryId)?.has(file.duplicateOf.path))
      ) return false;
    }
  }

  const mappingIds = new Set<string>();
  for (const mapping of value.mappings) {
    if (
      !isRecord(mapping) ||
      typeof mapping.id !== "string" ||
      mapping.id.length === 0 ||
      mappingIds.has(mapping.id) ||
      !isScenarioId(mapping.scenarioId) ||
      !isStepId(mapping.scenarioId, mapping.stepId) ||
      typeof mapping.controlId !== "string" ||
      mapping.controlId.length === 0 ||
      typeof mapping.name !== "string" ||
      !EFFECTS.has(mapping.effect as CoverageEffect) ||
      typeof mapping.rationale !== "string" ||
      mapping.rationale.length === 0 ||
      typeof mapping.limitation !== "string" ||
      mapping.limitation.length === 0 ||
      typeof mapping.repositoryId !== "string" ||
      !sourceIds.has(mapping.repositoryId) ||
      !Array.isArray(mapping.evidence) ||
      mapping.evidence.length === 0
    ) return false;
    mappingIds.add(mapping.id);
    const source = value.sources.find(
      (item): item is CoverageSource =>
        isCoverageSource(item) && item.id === mapping.repositoryId,
    );
    if (!source) return false;
    for (const evidence of mapping.evidence) {
      if (
        !isRecord(evidence) ||
        !isRepositoryRelativePath(evidence.path) ||
        !isRecord(evidence.selector) ||
        !(
          (evidence.selector.kind === "setting-id" &&
            typeof evidence.selector.id === "string" &&
            evidence.selector.id.length > 0 &&
            typeof evidence.selector.valuePath === "string" &&
            evidence.selector.valuePath.length > 0 &&
            (evidence.selector.occurrence === undefined ||
              (Number.isSafeInteger(evidence.selector.occurrence) &&
                Number(evidence.selector.occurrence) >= 0))) ||
          (evidence.selector.kind === "json-pointer" &&
            typeof evidence.selector.pointer === "string" &&
            (evidence.selector.pointer === "" ||
              evidence.selector.pointer.startsWith("/"))) ||
          (evidence.selector.kind === "array-object-property" &&
            typeof evidence.selector.arrayPointer === "string" &&
            evidence.selector.arrayPointer.startsWith("/") &&
            typeof evidence.selector.matchProperty === "string" &&
            isJsonValue(evidence.selector.matchValue) &&
            typeof evidence.selector.valueProperty === "string" &&
            evidence.selector.valueProperty.length > 0 &&
            (evidence.selector.occurrence === undefined ||
              (Number.isSafeInteger(evidence.selector.occurrence) &&
                Number(evidence.selector.occurrence) >= 0))) ||
          (evidence.selector.kind === "base64-json-array-property" &&
            typeof evidence.selector.encodedValuePointer === "string" &&
            evidence.selector.encodedValuePointer.startsWith("/") &&
            typeof evidence.selector.arrayPointer === "string" &&
            evidence.selector.arrayPointer.startsWith("/") &&
            typeof evidence.selector.matchProperty === "string" &&
            isJsonValue(evidence.selector.matchValue) &&
            typeof evidence.selector.valueProperty === "string" &&
            evidence.selector.valueProperty.length > 0 &&
            (evidence.selector.occurrence === undefined ||
              (Number.isSafeInteger(evidence.selector.occurrence) &&
                Number(evidence.selector.occurrence) >= 0)))
        ) ||
        !isJsonValue(evidence.expectedValue) ||
        !isJsonValue(evidence.observedValue) ||
        !EVIDENCE_STATUSES.has(evidence.status as EvidenceStatus) ||
        !isHttpsUrl(evidence.sourceUrl) ||
        (evidence.fileSha256 !== null &&
          (typeof evidence.fileSha256 !== "string" ||
            !/^[a-f0-9]{64}$/i.test(evidence.fileSha256))) ||
        !isHttpsUrl(evidence.referenceUrl)
      ) return false;
      const file = source.files.find((item) => item.path === evidence.path);
      const expectedSourceUrl = `${source.repositoryUrl}/blob/${source.commitSha}/${evidence.path.split("/").map(encodeURIComponent).join("/")}`;
      if (
        evidence.sourceUrl !== expectedSourceUrl ||
        evidence.fileSha256 !== (file?.sha256 ?? null) ||
        (evidence.status === "verified" &&
          (!file ||
            file.parseStatus !== "valid" ||
            !areJsonValuesEqual(evidence.expectedValue, evidence.observedValue))) ||
        (evidence.status === "changed" &&
          (!file ||
            file.parseStatus !== "valid" ||
            areJsonValuesEqual(evidence.expectedValue, evidence.observedValue))) ||
        (evidence.status === "invalid" && !file)
      ) return false;
    }
  }
  return true;
}

export function parseAttackCoverageIndex(value: unknown): AttackCoverageIndex {
  if (!isAttackCoverageIndex(value)) {
    throw new Error("Attack policy coverage index has an invalid schema.");
  }
  return value;
}

export function getInventoryFileCoverageStatus(
  mappings: readonly CoverageMapping[],
  repositoryId: string,
  file: InventoryFile,
): InventoryCoverageStatus {
  if (mappings.some((mapping) =>
    mapping.repositoryId === repositoryId &&
    mapping.evidence.some((evidence) => evidence.path === file.path),
  )) return "mapped";
  if (file.kind === "policy-json" && file.parseStatus === "valid") {
    return "not-mapped";
  }
  return "unsupported";
}

export function getVerifiedMappings(
  index: AttackCoverageIndex,
  scenarioId: AttackScenarioId,
  repositoryId = "all",
): CoverageMapping[] {
  return index.mappings.filter((mapping) =>
    mapping.scenarioId === scenarioId &&
    (repositoryId === "all" || mapping.repositoryId === repositoryId) &&
    mapping.evidence.every((evidence) => evidence.status === "verified"),
  );
}

export interface ScenarioCoverageSummary {
  status: "mapped" | "partially-mapped" | "not-mapped";
  verifiedMappings: CoverageMapping[];
  mappingsNeedingReview: CoverageMapping[];
  distinctControlCount: number;
  steps: Array<{
    id: AttackStepId;
    name: string;
    techniques: readonly AttackTechniqueReference[];
    status: "mapped" | "not-mapped";
    mappings: CoverageMapping[];
    distinctControlCount: number;
  }>;
}

export function getScenarioCoverage(
  index: AttackCoverageIndex,
  scenarioId: AttackScenarioId,
  filters: { platform?: string; repositoryId?: string } = {},
): ScenarioCoverageSummary {
  const scenario = attackScenarios.find((item) => item.id === scenarioId)!;
  const platformsByRepository = new Map(
    index.sources.map((source) => [source.id, source.platform]),
  );
  const matchesFilters = (mapping: CoverageMapping) =>
    (!filters.repositoryId || filters.repositoryId === "all" ||
      mapping.repositoryId === filters.repositoryId) &&
    (!filters.platform || filters.platform === "all" ||
      platformsByRepository.get(mapping.repositoryId) === filters.platform);
  const scenarioMappings = index.mappings.filter((mapping) =>
    mapping.scenarioId === scenarioId && matchesFilters(mapping),
  );
  const verifiedMappings = scenarioMappings.filter((mapping) =>
    mapping.evidence.every((evidence) => evidence.status === "verified"),
  );
  const mappingsNeedingReview = scenarioMappings.filter((mapping) =>
    mapping.evidence.some((evidence) => evidence.status !== "verified"),
  );

  const steps = scenario.steps.map((step) => {
    const mappings = verifiedMappings.filter((mapping) => mapping.stepId === step.id);
    return {
      id: step.id,
      name: step.name,
      techniques: step.techniques,
      status: mappings.length > 0 ? "mapped" as const : "not-mapped" as const,
      mappings,
      distinctControlCount: new Set(mappings.map((mapping) => mapping.controlId)).size,
    };
  });
  const mappedSteps = steps.filter((step) => step.status === "mapped").length;

  return {
    status: mappedSteps === 0
      ? "not-mapped"
      : mappedSteps === steps.length ? "mapped" : "partially-mapped",
    verifiedMappings,
    mappingsNeedingReview,
    distinctControlCount: new Set(verifiedMappings.map((mapping) => mapping.controlId)).size,
    steps,
  };
}
