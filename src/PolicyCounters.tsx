import { useEffect, useState } from "react";
import {
  getTotalTemplateCount,
  isValidCategoryCounts,
  type RepositoryCategoryCounts,
  type RepositoryMetadataIndex,
} from "./repositoryMetadata";

const metrics: Array<{
  key: keyof RepositoryCategoryCounts;
  label: string;
  icon: string;
}> = [
  { key: "conditionalAccess", label: "Conditional Access policies", icon: "CA" },
  { key: "devicePolicies", label: "Endpoint policies", icon: "EP" },
  { key: "compliance", label: "Endpoint compliance policies", icon: "CP" },
  { key: "scripts", label: "Scripts", icon: "PS" },
  { key: "filters", label: "Filter settings", icon: "FS" },
  { key: "applications", label: "Applications", icon: "AP" },
  { key: "purviewPolicies", label: "Purview policies", icon: "PV" },
];

export function formatSyncTime(timestamp: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Brussels",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "short",
  }).format(new Date(timestamp));
}

function AnimatedCount({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayValue(value);
      return;
    }

    let frame: number;
    let start: number | undefined;
    setDisplayValue(0);
    function animate(timestamp: number) {
      start ??= timestamp;
      const progress = Math.min((timestamp - start) / 900, 1);
      setDisplayValue(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <>
      <span className="visually-hidden">{value.toLocaleString("en-GB")}</span>
      <span aria-hidden="true">{displayValue.toLocaleString("en-GB")}</span>
    </>
  );
}

export function PolicyCounters({
  metadata,
  status,
}: {
  metadata: RepositoryMetadataIndex;
  status: "loading" | "ready" | "error";
}) {
  const counts = metadata.categoryCounts;
  const total = getTotalTemplateCount(counts);
  const validCounts = status === "ready" && isValidCategoryCounts(counts);
  const validSyncTime = metadata.generatedAt &&
    Number.isFinite(new Date(metadata.generatedAt).getTime());

  return (
    <section className="policy-counts" aria-labelledby="policy-counts-heading" aria-busy={status === "loading"}>
      <div className="policy-counts-header">
        <div>
          <div className="catalog-live-badge"><span aria-hidden="true" />Daily repository sync</div>
          <h2 id="policy-counts-heading">Security policy templates. Zero trust at zero cost.</h2>
          <p>Expert-built security policy templates and scripts to scale Microsoft security configurations at zero cost. Repository data updated every day.</p>
        </div>
        <div className="policy-counts-updated">
          <span>Last sync</span>
          {status === "ready" && validSyncTime ? (
            <time dateTime={metadata.generatedAt}>{formatSyncTime(metadata.generatedAt)}</time>
          ) : (
            <span>{status === "loading" ? "Loading sync information..." : "Sync information unavailable"}</span>
          )}
        </div>
      </div>
      {status === "error" && (
        <p className="policy-counts-unavailable" role="alert">
          Repository counts could not be loaded. Please reload the page to try again.
        </p>
      )}
      {status === "ready" && !validCounts && (
        <p className="policy-counts-unavailable" role="status">Category totals are temporarily unavailable.</p>
      )}
      <dl className="policy-count-grid">
        <div className="policy-count-card policy-count-featured">
          <dt>
            <span className="policy-count-icon" aria-hidden="true">ALL</span>
            <span>Total</span>
          </dt>
          <dd>
            {status === "ready" && total !== undefined ? <AnimatedCount value={total} /> : <span aria-label="Count unavailable">--</span>}
          </dd>
        </div>
        {metrics.map(({ key, label, icon }) => (
          <div className="policy-count-card" key={key}>
            <dt>
              <span className="policy-count-icon" aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </dt>
            <dd>
              {validCounts ? <AnimatedCount value={counts[key]} /> : <span aria-label={status === "loading" ? "Loading count" : "Count unavailable"}>--</span>}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
