export function countRepositoryTemplates(repositoryName: string, tree: {
  truncated?: boolean;
  tree: Array<{ type: string; path: string }>;
}): number;

export function countPolicyJsonFiles(tree: {
  truncated?: boolean;
  tree: Array<{ type: string; path: string }>;
}): number;
export function getPolicyJsonHashes(tree: {
  truncated?: boolean;
  tree: Array<{ type: string; path: string; sha?: string }>;
}): string[];

export function getRepositoryCategoryHashes(
  tree: {
    truncated?: boolean;
    tree: Array<{ type: string; path: string; sha?: string }>;
  },
): {
  conditionalAccess: string[];
  devicePolicies: string[];
  compliance: string[];
  scripts: string[];
  filters: string[];
  applications: string[];
};

export function getUniqueCategoryCounts(
  repositories: Array<{
    name: string;
    categoryHashes?: {
      conditionalAccess?: string[];
      devicePolicies?: string[];
      compliance?: string[];
      scripts?: string[];
      filters?: string[];
      applications?: string[];
    };
  }>,
): {
  conditionalAccess: number;
  devicePolicies: number;
  compliance: number;
  scripts: number;
  filters: number;
  applications: number;
  purviewPolicies: number;
};

export function deduplicateRepositoryCounts(
  repositories: Array<{
    name: string;
    templateHashes?: string[];
    templateCount?: number;
    categoryHashes?: ReturnType<typeof getRepositoryCategoryHashes>;
  }>,
): Array<{
  name: string;
  templateHashes?: string[];
  templateCount: number;
  categoryHashes?: ReturnType<typeof getRepositoryCategoryHashes>;
}>;
