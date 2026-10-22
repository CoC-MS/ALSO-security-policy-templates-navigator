type EvidenceSelector =
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

type RepositorySource = { id: string; name: string; platform: string };

type SourceFile = {
  path: string;
  blobSha: string;
  sha256: string | null;
  kind: string;
  parseStatus: string;
  selector?: EvidenceSelector;
  jsonValue?: unknown;
};

type SourceInventory = {
  id: string;
  name: string;
  platform: string;
  repositoryUrl: string;
  commitSha: string;
  treeSha: string;
  fetchedAt: string;
  files: SourceFile[];
};

type MappingDefinition = {
  id: string;
  scenarioId: string;
  stepId: string;
  controlId: string;
  name: string;
  effect: string;
  rationale: string;
  limitation: string;
  repositoryId: string;
  evidence: Array<{
    path: string;
    selector: EvidenceSelector;
    expectedValue: unknown;
    referenceUrl: string;
  }>;
};

export const repositorySources: RepositorySource[];
export function decodeSourceText(buffer: Uint8Array): string;
export function classifySourceFile(path: string): string;
export function resolveEvidenceValue(value: unknown, selector: EvidenceSelector): { found: boolean; value?: unknown };
export function compareEvidence(
  expectedValue: unknown,
  sourceFile?: SourceFile,
): { status: "verified" | "changed" | "missing" | "invalid"; observedValue: unknown };
export function getUntruncatedTreeEntries(
  tree: unknown,
  repositoryName: string,
): Array<{ type: string; path: string; sha: string }>;
export function findDuplicateSource(
  sha256: string,
  repositoryId: string,
  path: string,
  seenHashes: Map<string, { repositoryId: string; path: string }>,
): { repositoryId: string; path: string } | undefined;
export function validateMappings(
  mappings: unknown,
  sources?: RepositorySource[],
): MappingDefinition[];
export function validateCoverageIndex(
  index: unknown,
  expectedSources?: RepositorySource[],
): unknown;
export function createCoverageIndex(input: {
  sources: SourceInventory[];
  mappings: MappingDefinition[];
  generatedAt: string;
}): {
  schemaVersion: 1;
  generatedAt: string;
  sources: SourceInventory[];
  mappings: Array<MappingDefinition & { evidence: Array<Record<string, unknown>> }>;
};
export function syncAttackCoverage(options?: {
  cwd?: string;
  sources?: RepositorySource[];
  now?: () => Date;
  request?: (endpoint: string) => unknown;
  fetchSource?: (
    repositoryName: string,
    commitSha: string,
    path: string,
    byteBudget: { value: number },
  ) => Promise<Uint8Array>;
}): Promise<{
  outputPath: string;
  repositories: number;
  files: number;
  mappings: number;
  generatedAt: string;
}>;
