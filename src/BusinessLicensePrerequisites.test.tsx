import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BusinessLicensePrerequisites } from "./BusinessLicensePrerequisites";
import { licensingDisclaimerText } from "./LicensingDisclaimer";

describe("Business license prerequisites", () => {
  it("explains the missing minimum prerequisites for both unsupported plans", () => {
    const html = renderToStaticMarkup(<BusinessLicensePrerequisites />);

    expect(html).toContain("Microsoft 365 Business Standard");
    expect(html).toContain("Microsoft 365 Business Basic");
    expect(html).toContain("Microsoft Entra ID P1");
    expect(html).toContain("Intune Plan 1");
    expect(html).toContain("Microsoft Defender for Business");
    expect(html).toContain("minimum prerequisites for using our templates");
  });

  it("includes the shared disclaimer and both exact comparison links", () => {
    const html = renderToStaticMarkup(<BusinessLicensePrerequisites />);

    expect(html).toContain(licensingDisclaimerText);
    expect(html).toContain("Microsoft Enterprise Plan Comparison");
    expect(html).toContain("Microsoft SMB Plan Comparison");
    expect(
      html.match(
        /href="https:\/\/cdn-dynmedia-1\.microsoft\.com\/is\/content\/microsoftcorp\/microsoft\/bade\/documents\/products-and-services\/en-us\/education\/Modern-Work-Plan-Comparison-Enterprise\.pdf"/g,
      ),
    ).toHaveLength(2);
  });
});
