import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LicensingDisclaimer, licensingDisclaimerText } from "./LicensingDisclaimer";

describe("universal recommendation licensing disclaimer", () => {
  it("always includes the exact disclaimer and both supplied comparison links", () => {
    const html = renderToStaticMarkup(<LicensingDisclaimer />);
    const expectedText =
      "Licensing prerequisites and feature availability listed on this page may be incorrect, incomplete, or outdated. We strongly recommend verifying all licensing information against the latest official Microsoft licensing documentation before making any purchasing or deployment decisions.";
    const expectedUrl =
      "https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/bade/documents/products-and-services/en-us/education/Modern-Work-Plan-Comparison-Enterprise.pdf";
    expect(licensingDisclaimerText).toBe(expectedText);
    expect(html).toContain(`<strong>Disclaimer:</strong> ${expectedText}`);
    expect(html.match(/<strong>Disclaimer:<\/strong>/g)).toHaveLength(1);
    expect(html).toContain("Enterprise licenses:");
    expect(html).toContain("Microsoft Enterprise Plan Comparison");
    expect(html).toContain("SMB licenses:");
    expect(html).toContain("Microsoft SMB Plan Comparison");
    expect(html).toContain(`href="${expectedUrl}" target="_blank" rel="noopener noreferrer">Microsoft Enterprise Plan Comparison</a>`);
    expect(html).toContain(`href="${expectedUrl.replace("Enterprise.pdf", "SMB.pdf")}" target="_blank" rel="noopener noreferrer">Microsoft SMB Plan Comparison</a>`);
    expect(html.split(`href="${expectedUrl}"`)).toHaveLength(2);
    expect(html.match(/target="_blank" rel="noopener noreferrer"/g)).toHaveLength(2);
  });
});
