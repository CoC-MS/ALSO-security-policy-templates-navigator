import { describe, expect, it } from "vitest";
import { getRelatedSiteUrl, relatedSites } from "./relatedSites";

describe("language-aware related sites", () => {
  it.each(["attackPrevention", "readiness"] as const)(
    "keeps English at the original production URL for %s", (site) => {
      expect(getRelatedSiteUrl(site, "en", false)).toBe(relatedSites[site].url);
    },
  );

  it.each(["de", "fr", "es", "ru", "it", "pl"] as const)(
    "uses the matching %s production route", (locale) => {
      for (const site of ["attackPrevention", "readiness"] as const) {
        expect(getRelatedSiteUrl(site, locale, false))
          .toBe(`${relatedSites[site].url}${locale}/`);
      }
    },
  );

  it.each(["en", "de", "fr", "es", "ru", "it", "pl"] as const)(
    "opens the matching local preview for %s", (locale) => {
      const suffix = locale === "en" ? "" : `${locale}/`;
      expect(getRelatedSiteUrl("attackPrevention", locale, true))
        .toBe(`http://127.0.0.1:5182/${suffix}`);
      expect(getRelatedSiteUrl("readiness", locale, true))
        .toBe(`http://127.0.0.1:5183/${suffix}`);
    },
  );
});
