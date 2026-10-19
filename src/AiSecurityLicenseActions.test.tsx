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

  it("renders three unavailable purchase and services actions", () => {
    const html = renderToStaticMarkup(<AiSecurityLicenseActions />);

    expect(html).toContain("Need implementation or consulting?");
    expect(html.match(/<button/g)).toHaveLength(3);
    expect(html.match(/disabled=""/g)).toHaveLength(3);
    expect(html).toContain("Purchase Agent 365 license");
    expect(html).toContain("Purchase Microsoft 365 E7 license");
    expect(html).toContain("Request Professional Services Help from ALSO CoE");
    expect(html.match(/Link coming soon/g)).toHaveLength(2);
    expect(html).toContain("Coming soon");
  });
});
