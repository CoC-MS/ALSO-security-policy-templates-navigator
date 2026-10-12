import {
  getPlatformRepositories,
  type Platform,
} from "./catalog";

export interface RepositoryMetadata {
  name: string;
  url: string;
  description: string | null;
  topics: string[];
  templateCount?: number;
  templateCountUpdatedAt?: string;
}

export interface RepositoryMetadataIndex {
  generatedAt: string;
  categoryCounts?: RepositoryCategoryCounts;
  repositories: RepositoryMetadata[];
}

export interface RepositoryCategoryCounts {
  conditionalAccess: number;
  devicePolicies: number;
  compliance: number;
  scripts: number;
  filters: number;
  applications: number;
  purviewPolicies: number;
}

export function isValidCategoryCounts(
  counts: unknown,
): counts is RepositoryCategoryCounts {
  if (!counts || typeof counts !== "object") return false;
  const requiredKeys: Array<keyof RepositoryCategoryCounts> = [
    "conditionalAccess",
    "devicePolicies",
    "compliance",
    "scripts",
    "filters",
    "applications",
    "purviewPolicies",
  ];
  return requiredKeys.every((key) => {
    const count = (counts as Record<string, unknown>)[key];
    return typeof count === "number" && Number.isSafeInteger(count) && count >= 0;
  });
}

export function getTotalTemplateCount(
  counts: unknown,
): number | undefined {
  if (!isValidCategoryCounts(counts)) return undefined;
  const total = counts.conditionalAccess + counts.devicePolicies +
    counts.compliance + counts.scripts + counts.filters +
    counts.applications + counts.purviewPolicies;
  return Number.isSafeInteger(total) ? total : undefined;
}

function normalize(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function getRepositoryMetadata(
  repositories: readonly RepositoryMetadata[],
  repositoryUrl: string,
): RepositoryMetadata | undefined {
  return repositories.find((repository) => repository.url === repositoryUrl);
}

export function filterPlatformsByTopics(
  candidates: readonly Platform[],
  repositories: readonly RepositoryMetadata[],
  query: string,
): Platform[] {
  const terms = normalize(query).split(" ").filter(Boolean);

  if (terms.length === 0) {
    return [...candidates];
  }

  return candidates.filter((platform) =>
    getPlatformRepositories(platform).some((repository) => {
      const metadata = getRepositoryMetadata(repositories, repository.url);
      const searchableTopics = normalize(metadata?.topics.join(" ") ?? "");

      return terms.every((term) => searchableTopics.includes(term));
    }),
  );
}
