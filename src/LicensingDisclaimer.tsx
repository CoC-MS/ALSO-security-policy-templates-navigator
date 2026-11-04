import { translate, type Locale } from "./i18n";
import { useLocale } from "./LocaleContext";
export const licensingDisclaimerText =
  "Licensing prerequisites and feature availability listed on this page may be incorrect, incomplete, or outdated. We strongly recommend verifying all licensing information against the latest official Microsoft licensing documentation before making any purchasing or deployment decisions.";

const enterprisePlanComparisonUrl =
  "https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/bade/documents/products-and-services/en-us/education/Modern-Work-Plan-Comparison-Enterprise.pdf";
const smbPlanComparisonUrl =
  "https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/bade/documents/products-and-services/en-us/education/Modern-Work-Plan-Comparison-SMB.pdf";

export function getPlanComparisonLinks(locale: Locale) {
  if (locale === "ru") {
    return {
      enterprise: "https://www.microsoft.com/ru-ru/microsoft-365/enterprise/microsoft-365-plans-and-pricing?market=kz",
      smb: "https://www.microsoft.com/ru-ru/microsoft-365/business/microsoft-365-plans-and-pricing?market=kz",
      enterprisePdf: enterprisePlanComparisonUrl,
      smbPdf: smbPlanComparisonUrl,
    };
  }
  if (locale === "it") {
    return {
      enterprise: enterprisePlanComparisonUrl,
      smb: smbPlanComparisonUrl,
      enterprisePdf: enterprisePlanComparisonUrl,
      smbPdf: smbPlanComparisonUrl,
    };
  }
  if (locale === "pl") {
    return {
      enterprise: "https://www.microsoft.com/pl-pl/microsoft-365/compare-microsoft-365-enterprise-plans",
      smb: "https://www.microsoft.com/pl-pl/microsoft-365/business/compare-all-microsoft-365-business-products",
      enterprisePdf: enterprisePlanComparisonUrl,
      smbPdf: smbPlanComparisonUrl,
    };
  }
  const market = { en: "en-us", de: "de-de", fr: "fr-fr", es: "es-es" }[locale];
  return {
    enterprise: locale === "en" ? enterprisePlanComparisonUrl
      : `https://www.microsoft.com/${market}/microsoft-365/enterprise/microsoft-365-plans-and-pricing`,
    smb: locale === "en" ? smbPlanComparisonUrl
      : `https://www.microsoft.com/${market}/microsoft-365/business/microsoft-365-plans-and-pricing`,
    enterprisePdf: enterprisePlanComparisonUrl,
    smbPdf: smbPlanComparisonUrl,
  };
}

export function LicensingDisclaimer() {
  const locale = useLocale();
  const links = getPlanComparisonLinks(locale);

  return (
    <aside className="license-requirement-note licensing-disclaimer">
      <p><strong>{translate(locale, "Disclaimer:")}</strong>{translate(locale, " ")}{translate(locale, licensingDisclaimerText)}</p>
      <p className="licensing-comparison-links">
        {translate(locale, "Enterprise licenses:")}{translate(locale, " ")}
        <a href={links.enterprise} target="_blank" rel="noopener noreferrer">
          {translate(locale, locale === "it" ? "Detailed comparison PDF (English)" : "Microsoft Enterprise Plan Comparison")}</a>
        {locale !== "en" && locale !== "it" && (
          <>{" · "}<a href={links.enterprisePdf} target="_blank" rel="noopener noreferrer">
            {translate(locale, "Detailed comparison PDF (English)")}
          </a></>
        )}
        <br />
        {translate(locale, "SMB licenses:")}{translate(locale, " ")}
        <a href={links.smb} target="_blank" rel="noopener noreferrer">
          {translate(locale, locale === "it" ? "Detailed comparison PDF (English)" : "Microsoft SMB Plan Comparison")}</a>
        {locale !== "en" && locale !== "it" && (
          <>{" · "}<a href={links.smbPdf} target="_blank" rel="noopener noreferrer">
            {translate(locale, "Detailed comparison PDF (English)")}
          </a></>
        )}
      </p>
    </aside>
  );
}
