const excludedFolders = new Set([
  "applications",
  "authenticationcontext",
  "groups",
  "namedlocations",
]);
const devicePolicyFolders = new Set([
  "settingscatalog",
  "administrativetemplates",
  "admxfiles",
  "autopilot",
  "deviceconfiguration",
  "driveupdateprofiles",
  "qualityupdatepolicies",
  "updatepolicies",
]);
const scriptFolders = new Set([
  "powershellscripts",
  "devicehealthscripts",
  "remediationscripts",
]);
const scriptExtensions = new Set([".ps1", ".psm1", ".psd1", ".sh", ".bash", ".py", ".cmd", ".bat"]);
const purviewScriptCount = 5;

function normalizedFolderName(folder) {
  return folder.toLowerCase().replace(/[\s_-]/g, "");
}

function getFileHashes(tree, predicate) {
  if (tree.truncated) {
    throw new Error("Cannot count templates from a truncated GitHub tree.");
  }

  const hashes = [];
  for (const entry of tree.tree) {
    if (entry.type !== "blob" || !predicate(entry.path)) continue;
    if (!entry.sha) throw new Error(`Missing Git content hash: ${entry.path}`);
    hashes.push(entry.sha);
  }
  return [...new Set(hashes)].sort();
}

function pathFolders(path) {
  return path.split("/").slice(0, -1).map(normalizedFolderName);
}

function isJson(path) {
  return path.toLowerCase().endsWith(".json");
}

function isScript(path) {
  const lowerPath = path.toLowerCase();
  return [...scriptExtensions].some((extension) => lowerPath.endsWith(extension));
}

export function countRepositoryTemplates(repositoryName, tree) {
  if (repositoryName === "ALSO-Microsoft-Security-Purview") {
    return 24;
  }
  return countPolicyJsonFiles(tree);
}

export function countPolicyJsonFiles(tree) {
  return getPolicyJsonFiles(tree).length;
}

function getPolicyJsonFiles(tree) {
  if (tree.truncated) {
    throw new Error("Cannot count templates from a truncated GitHub tree.");
  }

  return tree.tree.filter((entry) => {
    if (entry.type !== "blob" || !entry.path.toLowerCase().endsWith(".json")) {
      return false;
    }

    const folders = entry.path.split("/").slice(0, -1);
    return !folders.some((folder) =>
      excludedFolders.has(folder.toLowerCase().replace(/[\s_-]/g, "")),
    );
  });
}

export function getPolicyJsonHashes(tree) {
  return getFileHashes(tree, (path) => {
    if (!isJson(path)) return false;
    return !pathFolders(path).some((folder) => excludedFolders.has(folder));
  });
}

export function getRepositoryCategoryHashes(tree) {
  return {
    conditionalAccess: getFileHashes(tree, (path) =>
      isJson(path) && pathFolders(path).includes("conditionalaccess"),
    ),
    devicePolicies: getFileHashes(tree, (path) =>
      isJson(path) && pathFolders(path).some((folder) => devicePolicyFolders.has(folder)),
    ),
    compliance: getFileHashes(tree, (path) => {
      const folders = pathFolders(path);
      return (folders.includes("compliancepolicies") && isJson(path)) ||
        (folders.includes("compliancescripts") && (isJson(path) || isScript(path)));
    }),
    scripts: getFileHashes(tree, (path) =>
      isScript(path) && pathFolders(path).some((folder) => scriptFolders.has(folder)),
    ),
    filters: getFileHashes(tree, (path) =>
      isJson(path) && pathFolders(path).some((folder) =>
        folder === "filters" || folder === "assignmentfilters" || folder.endsWith("filters"),
      ),
    ),
    applications: getFileHashes(tree, (path) =>
      isJson(path) && pathFolders(path).includes("applications"),
    ),
  };
}

export function getUniqueCategoryCounts(repositories) {
  const categoryNames = [
    "conditionalAccess",
    "devicePolicies",
    "compliance",
    "scripts",
    "filters",
    "applications",
  ];
  const counts = {};
  for (const category of categoryNames) {
    const hashes = new Set();
    for (const repository of repositories) {
      if (!repository.categoryHashes || !Array.isArray(repository.categoryHashes[category])) {
        throw new Error(`Missing ${category} hashes for ${repository.name}. Sync with repository access first.`);
      }
      for (const hash of repository.categoryHashes[category]) hashes.add(hash);
    }
    counts[category] = hashes.size;
  }
  counts.scripts += purviewScriptCount;
  counts.purviewPolicies = 24;
  return counts;
}

export function deduplicateRepositoryCounts(repositories) {
  const seenHashes = new Set();
  return repositories.map((repository) => {
    if (repository.name === "ALSO-Microsoft-Security-Purview") {
      return { ...repository, templateCount: 24 };
    }
    if (!Array.isArray(repository.templateHashes)) {
      throw new Error(`Missing template hashes for ${repository.name}. Sync with repository access first.`);
    }
    let templateCount = 0;
    for (const hash of repository.templateHashes) {
      if (!seenHashes.has(hash)) {
        seenHashes.add(hash);
        templateCount++;
      }
    }
    return { ...repository, templateCount };
  });
}
