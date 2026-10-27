export const licensingDisclaimerText =
  "Licensing prerequisites and feature availability listed on this page may be incorrect, incomplete, or outdated. We strongly recommend verifying all licensing information against the latest official Microsoft licensing documentation before making any purchasing or deployment decisions.";

const enterprisePlanComparisonUrl =
  "https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/bade/documents/products-and-services/en-us/education/Modern-Work-Plan-Comparison-Enterprise.pdf";
const smbPlanComparisonUrl =
  "https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/bade/documents/products-and-services/en-us/education/Modern-Work-Plan-Comparison-SMB.pdf";

export function LicensingDisclaimer() {
  return (
    <aside className="license-requirement-note licensing-disclaimer">
      <p><strong>Disclaimer:</strong>{" "}{licensingDisclaimerText}</p>
      <p className="licensing-comparison-links">
        Enterprise licenses:{" "}
        <a href={enterprisePlanComparisonUrl} target="_blank" rel="noopener noreferrer">
          Microsoft Enterprise Plan Comparison
        </a>
        <br />
        SMB licenses:{" "}
        <a href={smbPlanComparisonUrl} target="_blank" rel="noopener noreferrer">
          Microsoft SMB Plan Comparison
        </a>
      </p>
    </aside>
  );
}
