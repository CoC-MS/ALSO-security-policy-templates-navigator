import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  AiSecurityLicenseActions,
  shouldShowAiSecurityLicenseActions,
} from "./AiSecurityLicenseActions";

describe("AI Security license actions", () => {
  it("shows only for E5 AI Security recommendations unless E7 is also selected", () => {
    expect(shouldShowAiSecurityLicenseActions(["e5"], "ai-security")).toBe(true);
    expect(
      shouldShowAiSecurityLicenseActions(["e5", "e3"], "ai-security"),
    ).toBe(true);
    expect(
      shouldShowAiSecurityLicenseActions(["e5", "e7"], "ai-security"),
    ).toBe(false);
    expect(
      shouldShowAiSecurityLicenseActions(["e7"], "ai-security"),
    ).toBe(false);
    expect(
      shouldShowAiSecurityLicenseActions(["e5"], "windows-11"),
    ).toBe(false);
  });

  it("groups license links separately from consulting and uses primary license buttons", () => {
    const html = renderToStaticMarkup(<AiSecurityLicenseActions />);

    expect(html).toContain("<h3 id=\"ai-security-license-title\">Explore licenses</h3>");
    expect(html).toContain("<h3 id=\"ai-security-services-title\">Need implementation help or consulting?</h3>");
    expect(html).toContain('href="https://marketplace.also.no/#/Marketplace/Explore/p:1;l:20;st:Root;ord:Ranking,ASC;n:QWdlbnQgMzY1"');
    expect(html).toContain('href="https://marketplace.also.no/#/Marketplace/Explore/p:1;l:20;st:Root;ord:Ranking,ASC;n:bWljcm9zb2Z0IDM2NSBFNw=="');
    expect(html).toContain("Explore Agent 365 licenses in ACMP");
    expect(html).toContain("Explore Microsoft 365 E7 licenses in ACMP");
    expect(html.match(/class="button primary"/g)).toHaveLength(2);
    expect(html).toContain("Request Professional Services Help from ALSO CoE");
    expect(html.match(/<a /g)).toHaveLength(2);
    expect(html.match(/<button/g)).toHaveLength(1);
    expect(html.match(/disabled=""/g)).toHaveLength(1);
    expect(html).toContain("Coming soon");
  });
});
