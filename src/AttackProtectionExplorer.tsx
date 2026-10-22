import { useEffect, useMemo, useState } from "react";
import {
  attackScenarios,
  getScenarioCoverage,
  parseAttackCoverageIndex,
  type AttackCoverageIndex,
  type AttackScenarioId,
  type CoverageEffect,
  type CoverageMapping,
} from "./attackCoverage";

type ExplorerStatus = "loading" | "ready" | "error";

const effectLabels: Record<CoverageEffect, string> = {
  prevention: "Prevention",
  detection: "Detection",
  "supporting-hardening": "Supporting hardening",
};

function formatValue(value: unknown): string {
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function formatSelector(selector: CoverageMapping["evidence"][number]["selector"]): string {
  if (selector.kind === "setting-id") {
    return `Setting ${selector.id} · ${selector.valuePath}`;
  }
  if (
    selector.kind === "array-object-property" ||
    selector.kind === "base64-json-array-property"
  ) {
    const prefix = selector.kind === "base64-json-array-property"
      ? `Decoded JSON in ${selector.encodedValuePointer} · `
      : "";
    return `${prefix}${selector.arrayPointer} where ${selector.matchProperty}=${formatValue(selector.matchValue)} → ${selector.valueProperty}`;
  }
  return `JSON Pointer ${selector.pointer || "/"}`;
}

function getSource(index: AttackCoverageIndex, repositoryId: string) {
  return index.sources.find((source) => source.id === repositoryId);
}

function sourceFileUrl(
  repositoryUrl: string,
  commitSha: string,
  path: string,
): string {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${repositoryUrl}/blob/${commitSha}/${encodedPath}`;
}

function MappingCard({
  mapping,
  index,
}: {
  mapping: CoverageMapping;
  index: AttackCoverageIndex;
}) {
  const source = getSource(index, mapping.repositoryId);
  if (!source) return null;

  return (
    <article className="coverage-control">
      <div className="coverage-control-heading">
        <h4>{mapping.name}</h4>
        <span className={`coverage-effect effect-${mapping.effect}`}>
          {effectLabels[mapping.effect]}
        </span>
      </div>
      <p>{mapping.rationale}</p>
      <p className="coverage-limit"><strong>Limit:</strong> {mapping.limitation}</p>
      <div className="coverage-evidence">
        <strong>{source.platform} evidence</strong>
        {mapping.evidence.map((evidence) => (
          <div
            className="coverage-evidence-item"
            key={`${evidence.path}:${formatSelector(evidence.selector)}`}
          >
            <a href={evidence.sourceUrl} target="_blank" rel="noopener noreferrer">
              {evidence.path}
            </a>
            <code>{formatSelector(evidence.selector)}</code>
            <span>Configured value: <code>{formatValue(evidence.expectedValue)}</code></span>
            <a href={evidence.referenceUrl} target="_blank" rel="noopener noreferrer">
              Authoritative reference
            </a>
          </div>
        ))}
        <a
          href={`${source.repositoryUrl}/tree/${source.commitSha}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Source snapshot {source.commitSha.slice(0, 12)}
        </a>
      </div>
    </article>
  );
}

export function AttackProtectionExplorer() {
  const [index, setIndex] = useState<AttackCoverageIndex | null>(null);
  const [status, setStatus] = useState<ExplorerStatus>("loading");
  const [error, setError] = useState("");
  const [scenarioId, setScenarioId] = useState<AttackScenarioId>("aitm-phishing");
  const [platform, setPlatform] = useState("all");
  const [repositoryId, setRepositoryId] = useState("all");

  useEffect(() => {
    let cancelled = false;
    async function loadIndex() {
      try {
        const response = await fetch(
          `${import.meta.env.BASE_URL}attack-policy-coverage.v1.json`,
          { cache: "no-store" },
        );
        if (!response.ok) {
          throw new Error(`Policy coverage index request failed (${response.status}).`);
        }
        const parsed = parseAttackCoverageIndex(await response.json());
        if (!cancelled) {
          setIndex(parsed);
          setStatus("ready");
        }
      } catch (cause) {
        const message = cause instanceof Error
          ? cause.message
          : "An unknown error occurred while loading policy evidence.";
        console.error("Unable to load attack policy coverage.", cause);
        if (!cancelled) {
          setError(message);
          setStatus("error");
        }
      }
    }
    void loadIndex();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedScenario = attackScenarios.find((scenario) => scenario.id === scenarioId)!;
  const filteredSources = useMemo(
    () => index?.sources.filter((source) =>
      platform === "all" || source.platform === platform,
    ) ?? [],
    [index, platform],
  );
  const coverage = index
    ? getScenarioCoverage(index, scenarioId, { platform, repositoryId })
    : null;
  const repositoryOptions = filteredSources;
  const platforms = [...new Set(index?.sources.map((source) => source.platform) ?? [])];
  const latestSnapshot = index?.generatedAt
    ? new Date(index.generatedAt).toLocaleString()
    : "";

  function changePlatform(value: string) {
    setPlatform(value);
    setRepositoryId("all");
  }

  if (status === "loading") {
    return <section className="coverage-explorer" aria-labelledby="coverage-heading">
      <h2 id="coverage-heading">Threat-informed policy coverage</h2>
      <p role="status">Loading reviewed policy-library evidence…</p>
    </section>;
  }

  if (status === "error" || !index) {
    return <section className="coverage-explorer" aria-labelledby="coverage-heading">
      <h2 id="coverage-heading">Threat-informed policy coverage</h2>
      <p className="coverage-error" role="alert">
        The current policy coverage index is unavailable or invalid. No cached or stale coverage is shown. {error}
      </p>
    </section>;
  }

  return (
    <section className="coverage-explorer" aria-labelledby="coverage-heading">
      <div className="coverage-heading">
        <div>
          <div className="eyebrow">Policy library coverage</div>
          <h2 id="coverage-heading">Threat-informed policy coverage</h2>
          <p>Explore reviewed library settings by attack scenario and attack step. These are policy-library references, not a customer environment assessment.</p>
        </div>
        <p className="coverage-freshness">Index refreshed <time dateTime={index.generatedAt}>{latestSnapshot}</time></p>
      </div>
      <p className="coverage-scope">
        Coverage does not verify tenant configuration, assignment, deployment, or runtime effectiveness. It is not a security score or a probability of protection. A setting's presence in a template does not guarantee protection.
      </p>
      <div className="coverage-filters">
        <label>
          Scenario
          <select
            value={scenarioId}
            onChange={(event) => setScenarioId(event.target.value as AttackScenarioId)}
          >
            {attackScenarios.map((scenario) => (
              <option value={scenario.id} key={scenario.id}>{scenario.name}</option>
            ))}
          </select>
        </label>
        <label>
          Platform
          <select value={platform} onChange={(event) => changePlatform(event.target.value)}>
            <option value="all">All platforms</option>
            {platforms.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          Repository
          <select
            value={repositoryId}
            onChange={(event) => setRepositoryId(event.target.value)}
          >
            <option value="all">All repositories</option>
            {filteredSources.map((source) => (
              <option value={source.id} key={source.id}>{source.name}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="coverage-summary" aria-live="polite">
        <p>
          <strong>
            {coverage?.status === "mapped"
              ? "Mapped"
              : coverage?.status === "partially-mapped"
                ? "Partially mapped"
                : "Not mapped"}
          </strong>
          {" — "}{coverage?.distinctControlCount ?? 0} distinct reviewed controls for this scenario and filter.
        </p>
        <p>{coverage?.verifiedMappings.length ?? 0} evidence-verified scenario-step mappings; no composite score is calculated.</p>
      </div>
      <p className="coverage-boundary">{selectedScenario.boundary}</p>
      <div className="coverage-steps">
        {coverage?.steps.map((step) => {
          return (
            <section className="coverage-step" key={step.id} aria-labelledby={`coverage-step-${step.id}`}>
              <div className="coverage-step-heading">
                <h3 id={`coverage-step-${step.id}`}>{step.name}</h3>
                <span className={`coverage-map-status ${step.status}`}>
                  {step.status === "mapped" ? "Mapped" : "Not mapped"}
                  {" · "}{step.distinctControlCount} control{step.distinctControlCount === 1 ? "" : "s"}
                </span>
              </div>
              {step.mappings.length > 0 ? (
                <div className="coverage-controls">
                  {step.mappings.map((mapping) => (
                    <MappingCard key={mapping.id} mapping={mapping} index={index} />
                  ))}
                </div>
              ) : (
                <p className="coverage-gap">
                  Not mapped in the reviewed policy-library evidence for the selected filters. Scenario support is not demonstrated here; this is a library mapping gap, not a claim that no protection exists.
                </p>
              )}
            </section>
          );
        })}
      </div>
      {(coverage?.mappingsNeedingReview.length ?? 0) > 0 && (
        <section className="coverage-drift" aria-labelledby="coverage-drift-heading">
          <h3 id="coverage-drift-heading">Mappings needing review</h3>
          <p>These settings changed, were removed, or could not be parsed since the mapping was reviewed. They are excluded from mapped-control counts.</p>
          {coverage?.mappingsNeedingReview.map((mapping) => (
            <article key={mapping.id}>
              <strong>{mapping.name}</strong>
              <ul>
                {mapping.evidence.filter((evidence) => evidence.status !== "verified").map((evidence) => (
                  <li key={`${evidence.path}:${evidence.selector}`}>
                    <a href={evidence.sourceUrl} target="_blank" rel="noopener noreferrer">{evidence.path}</a>
                    {" — "}{evidence.status}; expected <code>{formatValue(evidence.expectedValue)}</code>
                    {evidence.status === "changed" && <>; found <code>{formatValue(evidence.observedValue)}</code></>}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      )}
      <details className="coverage-sources">
        <summary>Inventory freshness and source repositories ({index.sources.length})</summary>
        <p>Snapshot: {new Date(index.generatedAt).toLocaleString()}. Identical files are retained in the inventory and marked as duplicates; they are not counted as additional controls.</p>
        <ul>
          {repositoryOptions.map((source) => {
            const policyCount = source.files.filter((file) => file.kind === "policy-json").length;
            const documentationCount = source.files.filter((file) => file.kind === "documentation").length;
            const supportingCount = source.files.filter((file) =>
              file.kind === "supporting" || file.kind === "script",
            ).length;
            const duplicateCount = source.files.filter((file) => file.duplicateOf).length;
            return (
              <li key={source.id}>
                <details>
                  <summary>
                    <a href={`${source.repositoryUrl}/tree/${source.commitSha}`} target="_blank" rel="noopener noreferrer">{source.name}</a>
                    {" — "}{policyCount} policy JSON, {documentationCount} docs, {supportingCount} supporting files, {duplicateCount} duplicates; commit {source.commitSha.slice(0, 12)}
                  </summary>
                  <ul>
                    {source.files.map((file) => {
                      const duplicateSource = file.duplicateOf
                        ? getSource(index, file.duplicateOf.repositoryId)
                        : undefined;
                      return (
                        <li key={file.path}>
                          <a href={sourceFileUrl(source.repositoryUrl, source.commitSha, file.path)} target="_blank" rel="noopener noreferrer">
                            {file.path}
                          </a>
                          {" — "}{file.kind}; {file.parseStatus}
                          {file.sha256 && <>; SHA-256 <code>{file.sha256}</code></>}
                          ; Git blob <code>{file.blobSha}</code>
                          {file.duplicateOf && (
                            <>; duplicate of{" "}
                              {duplicateSource ? (
                                <a href={sourceFileUrl(duplicateSource.repositoryUrl, duplicateSource.commitSha, file.duplicateOf.path)} target="_blank" rel="noopener noreferrer">
                                  {duplicateSource.name}/{file.duplicateOf.path}
                                </a>
                              ) : file.duplicateOf.path}
                            </>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </details>
              </li>
            );
          })}
        </ul>
      </details>
    </section>
  );
}
