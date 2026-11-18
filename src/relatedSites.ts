import type { Locale } from "./i18n";

export const secureByDefaultUrl = "https://coc-ms.github.io/ALSO-Microsoft-Security-SecureByDefault/";

export const relatedSites = {
  attackPrevention: {
    url: "https://coc-ms.github.io/CoC-MS-ALSO-Microsoft-Security-AttackPrevention/",
    previewPort: 5182,
    repositoryUrl: "https://github.com/CoC-MS/CoC-MS-ALSO-Microsoft-Security-AttackPrevention",
  },
  readiness: {
    url: "https://coc-ms.github.io/ALSO-Microsoft-Security-Fundamentals-and-Copilot-Readiness/",
    previewPort: 5183,
    repositoryUrl: "https://github.com/CoC-MS/ALSO-Microsoft-Security-Fundamentals-and-Copilot-Readiness",
  },
} as const;

export const relatedSiteCatalog = [
  {
    id: "attackPrevention",
    name: "Attack Prevention",
    repositoryUrl: relatedSites.attackPrevention.repositoryUrl,
    description: "Explore attack-prevention scenarios and mapped security policies.",
  },
  {
    id: "readiness",
    name: "Security Fundamentals & Copilot Readiness",
    repositoryUrl: relatedSites.readiness.repositoryUrl,
    description: "Explore Microsoft Security fundamentals and Copilot readiness guidance.",
  },
] as const;

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
