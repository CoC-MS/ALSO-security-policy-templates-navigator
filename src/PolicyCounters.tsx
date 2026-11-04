import { useEffect, useState } from "react";
import {
  getTotalTemplateCount,
  isValidCategoryCounts,
  type RepositoryCategoryCounts,
  type RepositoryMetadataIndex,
} from "./repositoryMetadata";
import { translate, type Locale } from "./i18n";

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

export function formatSyncTime(timestamp: string, locale: Locale = "en"): string {
  const dateLocale = locale === "en" ? "en-GB" : `${locale}-${locale.toUpperCase()}`;
  return new Intl.DateTimeFormat(dateLocale, {
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

function AnimatedCount({ value, locale }: { value: number; locale: Locale }) {
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
      <span className="visually-hidden">{value.toLocaleString(locale === "en" ? "en-GB" : `${locale}-${locale.toUpperCase()}`)}</span>
      <span aria-hidden="true">{displayValue.toLocaleString(locale === "en" ? "en-GB" : `${locale}-${locale.toUpperCase()}`)}</span>
    </>
  );
}

export function PolicyCounters({
  metadata,
  status,
  locale = "en",
}: {
  metadata: RepositoryMetadataIndex;
  status: "loading" | "ready" | "error";
  locale?: Locale;
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
          <div className="catalog-live-badge"><span aria-hidden="true" />{translate(locale, "Daily repository sync")}</div>
          <h2 id="policy-counts-heading">{translate(locale, "Zero trust at zero cost.")}</h2>
          <p>{translate(locale, "Free Microsoft Security policy templates that help turn days of research, configuration, and testing into minutes of deployment.")}</p>
          <p>{translate(locale, "Grab a coffee, pick templates, import them into your lab, test them, tweak them, and make them your own. Build the security baseline that works for your customers.")}</p>
        </div>
        <div className="policy-counts-updated">
          <span>{translate(locale, "Last sync")}</span>
          {status === "ready" && validSyncTime ? (
            <time dateTime={metadata.generatedAt}>{formatSyncTime(metadata.generatedAt, locale)}</time>
          ) : (
            <span>{translate(locale, status === "loading" ? "Loading sync information..." : "Sync information unavailable")}</span>
          )}
        </div>
      </div>
      {status === "error" && (
        <p className="policy-counts-unavailable" role="alert">
          {translate(locale, "Repository counts could not be loaded. Please reload the page to try again.")}
        </p>
      )}
      {status === "ready" && !validCounts && (
        <p className="policy-counts-unavailable" role="status">{translate(locale, "Category totals are temporarily unavailable.")}</p>
      )}
      <dl className="policy-count-grid">
        <div className="policy-count-card policy-count-featured">
          <dt>
            <span className="policy-count-icon" aria-hidden="true">ALL</span>
            <span>{translate(locale, "Total")}</span>
          </dt>
          <dd>
            {status === "ready" && total !== undefined ? <AnimatedCount value={total} locale={locale} /> : <span aria-label={translate(locale, "Count unavailable")}>--</span>}
          </dd>
        </div>
        {metrics.map(({ key, label, icon }) => (
          <div className="policy-count-card" key={key}>
            <dt>
              <span className="policy-count-icon" aria-hidden="true">{icon}</span>
              <span>{translate(locale, label)}</span>
            </dt>
            <dd>
              {validCounts ? <AnimatedCount value={counts[key]} locale={locale} /> : <span aria-label={translate(locale, status === "loading" ? "Loading count" : "Count unavailable")}>--</span>}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
