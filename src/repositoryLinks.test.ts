import { describe, expect, it } from "vitest";
import appSource from "./App.tsx?raw";
import explorerSource from "./AttackProtectionExplorer.tsx?raw";

describe("repository link referrals", () => {
  it.each([
    ["repository buttons", appSource, "href={repository.url}", 2],
    ["endpoint licensing guides", appSource, "href={endpointLicensingGuideUrl}", 2],
    ["Purview licensing guide", appSource,
      'href="https://github.com/CoC-MS/ALSO-Microsoft-Security-Purview#purview-licensing-guide"', 1],
    ["mapped policies", explorerSource, "href={policy.url}", 1],
  ] as const)("shares only the origin for %s", (_name, source, href, count) => {
    const links = (source.match(/<a\b[^>]*>/g) ?? []).filter((link) => link.includes(href));
    expect(links).toHaveLength(count);
    for (const link of links) {
      expect(link).toContain('target="_blank"');
      expect(link).toContain('rel="noopener"');
      expect(link).toContain('referrerPolicy="strict-origin-when-cross-origin"');
      expect(link).not.toContain("noreferrer");
    }
  });

  it("keeps referral suppression on unrelated App links", () => {
    const links = (appSource.match(/<a\b[^>]*>/g) ?? [])
      .filter((link) => link.includes('target="_blank"') && !link.includes("referrerPolicy="));
    expect(links).toHaveLength(7);
    for (const link of links) {
      expect(link).toContain('rel="noopener noreferrer"');
    }
  });
});
