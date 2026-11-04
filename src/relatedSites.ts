import type { Locale } from "./i18n";

export const relatedSites = {
  attackPrevention: {
    url: "https://coc-ms.github.io/CoC-MS-ALSO-Microsoft-Security-AttackPrevention/",
    previewPort: 5182,
  },
  readiness: {
    url: "https://coc-ms.github.io/ALSO-Microsoft-Security-Fundamentals-and-Copilot-Readiness/",
    previewPort: 5183,
  },
} as const;

export function getRelatedSiteUrl(
  site: keyof typeof relatedSites,
  locale: Locale,
  localPreview = import.meta.env.DEV && typeof window !== "undefined" &&
    ["127.0.0.1", "localhost"].includes(window.location.hostname),
) {
  const destination = relatedSites[site];
  const base = localPreview
    ? `http://127.0.0.1:${destination.previewPort}/`
    : destination.url;
  return locale === "en" ? base : `${base}${locale}/`;
}
