import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { formatSyncTime, PolicyCounters } from "./PolicyCounters";
import type { RepositoryMetadataIndex } from "./repositoryMetadata";

const metadata: RepositoryMetadataIndex = {
  generatedAt: "2026-10-12T11:20:40.450Z",
  categoryCounts: {
    conditionalAccess: 43,
    devicePolicies: 130,
    compliance: 34,
    scripts: 30,
    filters: 17,
    applications: 9,
    purviewPolicies: 24,
  },
  repositories: [{
    name: "Windows",
    url: "https://github.com/CoC-MS/ALSO-Microsoft-Security-Windows",
    description: null,
    topics: [],
    templateCount: 293,
  }],
};

describe("policy counter dashboard", () => {
  it("renders all seven categories and the total with an explicit CEST sync time", () => {
    const html = renderToStaticMarkup(<PolicyCounters metadata={metadata} status="ready" />);
    expect(html.match(/class="policy-count-card/g)).toHaveLength(8);
    for (const label of [
      "Conditional Access policies", "Endpoint policies", "Endpoint compliance policies",
      "Scripts", "Filter settings", "Applications", "Purview policies",
    ]) expect(html).toContain(label);
    for (const count of [287, 43, 130, 34, 30, 17, 9, 24]) {
      expect(html).toContain(`class="visually-hidden">${count}</span>`);
    }
    expect(html).toContain("12 Oct 2026, 13:20:40 CEST");
    expect(html).toContain('dateTime="2026-10-12T11:20:40.450Z"');
    expect(html).toContain("Expert-built security policy templates and scripts to scale Microsoft security configurations at zero cost. Repository data updated every day.");
    expect(html).toContain("Security policy templates. Zero trust at zero cost.");
    expect(html).not.toContain('class="visually-hidden">293</span>');
    expect(html).toContain("<span>Total</span>");
    expect(html).not.toContain("Total policy templates");
    expect(html).not.toContain("Total unique policy templates");
    expect(html).not.toContain("Unique policy JSON files + Purview");
    for (const detail of [
      "Unique access policies", "Configuration, settings", "Policies &amp; compliance scripts",
      "Unique scripts", "Unique assignment filters", "Unique applications", "24 pre-configured policies",
    ]) expect(html).not.toContain(detail);
    expect(html).not.toContain('class="policy-count-detail"');
    expect(html).not.toContain("+ 5 from Purview");
    expect(html).not.toContain("Identical file contents");
    expect(html).not.toContain("Unique access policy JSON files");
    expect(html).not.toContain("Unique assignment filter JSON files");
    expect(html).not.toContain("Unique application JSON files");
  });

  it("keeps the dashboard visible while loading without showing fabricated zero counts", () => {
    const html = renderToStaticMarkup(<PolicyCounters metadata={{ generatedAt: "", repositories: [] }} status="loading" />);
    expect(html).toContain('aria-busy="true"');
    expect(html.match(/class="policy-count-card/g)).toHaveLength(8);
    expect(html).toContain("Loading sync information");
    expect(html).not.toContain('class="visually-hidden">0');
  });

  it("shows an explicit load error and unavailable counts", () => {
    const html = renderToStaticMarkup(<PolicyCounters metadata={{ generatedAt: "", repositories: [] }} status="error" />);
    expect(html).toContain('role="alert"');
    expect(html).toContain("Repository counts could not be loaded");
    expect(html).toContain("Sync information unavailable");
  });

  it("shows an unavailable message for incomplete category data or invalid sync dates", () => {
    const html = renderToStaticMarkup(<PolicyCounters metadata={{ ...metadata, categoryCounts: undefined, generatedAt: "invalid" }} status="ready" />);
    expect(html).toContain("Category totals are temporarily unavailable");
    expect(html).not.toContain('class="visually-hidden">293</span>');
    expect(html).toContain("Sync information unavailable");
    expect(html).not.toContain("Invalid Date");
  });

  it("uses Central European daylight saving rules regardless of the visitor's time zone", () => {
    expect(formatSyncTime("2026-10-12T11:20:40Z")).toBe("12 Oct 2026, 13:20:40 CEST");
    expect(formatSyncTime("2026-12-12T11:20:40Z")).toBe("12 Dec 2026, 12:20:40 CET");
  });
});
