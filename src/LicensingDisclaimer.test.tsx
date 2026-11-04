import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getPlanComparisonLinks, LicensingDisclaimer, licensingDisclaimerText } from "./LicensingDisclaimer";
import { LocaleProvider } from "./LocaleContext";

describe("universal recommendation licensing disclaimer", () => {
  it.each([
    ["de", "de-de"],
    ["fr", "fr-fr"],
    ["es", "es-es"],
  ] as const)("uses verified %s comparison pages and preserves English PDF references", (locale, market) => {
    const links = getPlanComparisonLinks(locale);
    expect(links.enterprise).toBe(`https://www.microsoft.com/${market}/microsoft-365/enterprise/microsoft-365-plans-and-pricing`);
    expect(links.smb).toBe(`https://www.microsoft.com/${market}/microsoft-365/business/microsoft-365-plans-and-pricing`);
    expect(links.enterprisePdf).toContain("/en-us/");
    expect(links.smbPdf).toContain("/en-us/");
  });
  it.each(["it"] as const)("uses an explicitly English PDF fallback for %s", (locale) => {
    const links = getPlanComparisonLinks(locale);
    expect(links.enterprise).toBe(links.enterprisePdf);
    expect(links.smb).toBe(links.smbPdf);
    expect(links.enterprise).toContain("/en-us/");
    expect(links.smb).toContain("/en-us/");
    const html = renderToStaticMarkup(<LocaleProvider initialLocale={locale}><LicensingDisclaimer /></LocaleProvider>);
    const englishPdfLabel = "Confronto dettagliato in PDF (in inglese)";
    expect(html.split(englishPdfLabel)).toHaveLength(3);
  });
  it("uses the supplied Russian pricing pages with the Kazakhstan market on every shared disclaimer", () => {
    const links = getPlanComparisonLinks("ru");
    expect(links.enterprise).toBe("https://www.microsoft.com/ru-ru/microsoft-365/enterprise/microsoft-365-plans-and-pricing?market=kz");
    expect(links.smb).toBe("https://www.microsoft.com/ru-ru/microsoft-365/business/microsoft-365-plans-and-pricing?market=kz");
    const html = renderToStaticMarkup(
      <LocaleProvider initialLocale="ru"><LicensingDisclaimer /></LocaleProvider>,
    );
    expect(html).toContain(`href="${links.enterprise}" target="_blank" rel="noopener noreferrer">Microsoft 365 корпоративный: сравните планы и цены</a>`);
    expect(html).toContain(`href="${links.smb}" target="_blank" rel="noopener noreferrer">Цены Microsoft 365 для бизнеса: планы и функции</a>`);
    expect(html.split("Подробное сравнение в PDF (на английском языке)")).toHaveLength(3);
    expect(html).toContain(`href="${links.enterprisePdf}"`);
    expect(html).toContain(`href="${links.smbPdf}"`);
  });
  it("uses verified Polish comparison pages and labels the fallback PDFs as English", () => {
    const links = getPlanComparisonLinks("pl");
    expect(links.enterprise).toBe("https://www.microsoft.com/pl-pl/microsoft-365/compare-microsoft-365-enterprise-plans");
    expect(links.smb).toBe("https://www.microsoft.com/pl-pl/microsoft-365/business/compare-all-microsoft-365-business-products");
    expect(links.enterprisePdf).toContain("/en-us/");
    expect(links.smbPdf).toContain("/en-us/");
    const html = renderToStaticMarkup(
      <LocaleProvider initialLocale="pl"><LicensingDisclaimer /></LocaleProvider>,
    );
    expect(html).toContain("Porównanie planów Microsoft Enterprise");
    expect(html).toContain("Porównanie planów Microsoft dla małych i średnich firm");
    expect(html.split("Szczegółowe porównanie w formacie PDF (w języku angielskim)")).toHaveLength(3);
    expect(html).toContain(`href="${links.enterprisePdf}"`);
    expect(html).toContain(`href="${links.smbPdf}"`);
  });
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
