import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BusinessLicensePrerequisites } from "./BusinessLicensePrerequisites";
import { licensingDisclaimerText } from "./LicensingDisclaimer";
import { smbLicenses } from "./catalog";
import * as localeContext from "./LocaleContext";

const unsupportedLicenses = smbLicenses.filter((license) => !license.eligible);

describe("Business license prerequisites", () => {
  afterEach(() => vi.restoreAllMocks());

  it.each([
    ["de", "enthält", "enthalten", " und "],
    ["fr", "n’inclut pas", "n’incluent pas", " et "],
    ["es", "no incluye", "no incluyen", " y "],
    ["ru", "не включает", "не включают", " и "],
    ["it", "non include", "non includono", " e "],
    ["pl", "nie obejmuje", "nie obejmują", " i "],
  ] as const)("fully translates Basic, Standard and their combined prerequisites in %s",
    (locale, singular, plural, conjunction) => {
      vi.spyOn(localeContext, "useLocale").mockReturnValue(locale);
      for (const selected of [...unsupportedLicenses.map(license => [license]), unsupportedLicenses]) {
        const html = renderToStaticMarkup(<BusinessLicensePrerequisites licenses={selected} />);
        expect(html).toContain(`${selected.map(license => license.name).join(conjunction)} ${selected.length === 1 ? singular : plural}`);
        expect(html).toContain("Microsoft Entra ID P1");
        expect(html).toContain("Intune Plan 1");
        expect(html).toContain("Microsoft Defender for Business");
        expect(html).not.toMatch(/does not include|do not include|minimum prerequisites for using our templates| and Microsoft 365/);
        for (const other of unsupportedLicenses.filter(license => !selected.includes(license))) {
          expect(html).not.toContain(other.name);
        }
      }
    },
  );

  it("explains the missing minimum prerequisites for both unsupported plans", () => {
    const html = renderToStaticMarkup(
      <BusinessLicensePrerequisites licenses={unsupportedLicenses} />,
    );

    expect(html).toContain("Microsoft 365 Business Standard");
    expect(html).toContain("Microsoft 365 Business Basic");
    expect(html).toContain("Microsoft Entra ID P1");
    expect(html).toContain("Intune Plan 1");
    expect(html).toContain("Microsoft Defender for Business");
    expect(html).toContain("minimum prerequisites for using our templates");
  });

  it.each(unsupportedLicenses)("mentions only the selected plan for $name", (license) => {
    const html = renderToStaticMarkup(
      <BusinessLicensePrerequisites licenses={[license]} />,
    );

    expect(html).toContain(`${license.name} does not`);
    for (const other of unsupportedLicenses.filter((item) => item.id !== license.id)) {
      expect(html).not.toContain(other.name);
    }
  });

  it("includes the shared disclaimer and both exact comparison links", () => {
    const html = renderToStaticMarkup(
      <BusinessLicensePrerequisites licenses={unsupportedLicenses} />,
    );

    expect(html).toContain(licensingDisclaimerText);
    expect(html).toContain("Microsoft Enterprise Plan Comparison");
    expect(html).toContain("Microsoft SMB Plan Comparison");
    expect(
      html.match(
        /href="https:\/\/cdn-dynmedia-1\.microsoft\.com\/is\/content\/microsoftcorp\/microsoft\/bade\/documents\/products-and-services\/en-us\/education\/Modern-Work-Plan-Comparison-Enterprise\.pdf"/g,
      ),
    ).toHaveLength(1);
    expect(html).toContain(
      'href="https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/bade/documents/products-and-services/en-us/education/Modern-Work-Plan-Comparison-SMB.pdf"',
    );
  });
});
