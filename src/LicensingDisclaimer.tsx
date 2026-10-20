import type { getLimitedExperienceNoteForLicenses } from "./catalog";

export const licensingDisclaimerText =
  "Licensing prerequisites and feature availability listed on this page may be incorrect, incomplete, or outdated. We strongly recommend verifying all licensing information against the latest official Microsoft licensing documentation before making any purchasing or deployment decisions.";

const planComparisonUrl =
  "https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/bade/documents/products-and-services/en-us/education/Modern-Work-Plan-Comparison-Enterprise.pdf";

type LicensingDisclaimerProps = {
  limitedExperienceNote?: ReturnType<typeof getLimitedExperienceNoteForLicenses>;
  dataSecurityNote?: string;
  endpointNotes: readonly string[];
  cloudAppsNote?: { title: string; message: string };
  needsWorkloadIdLicense: boolean;
  serverNotes: readonly string[];
  hasPolicyLicensingPrerequisites?: boolean;
};

export function LicensingDisclaimer({
  limitedExperienceNote,
  dataSecurityNote,
  endpointNotes,
  cloudAppsNote,
  needsWorkloadIdLicense,
  serverNotes,
  hasPolicyLicensingPrerequisites = false,
}: LicensingDisclaimerProps) {
  const hasLicensingNotes =
    Boolean(limitedExperienceNote) ||
    Boolean(dataSecurityNote) ||
    endpointNotes.length > 0 ||
    Boolean(cloudAppsNote) ||
    needsWorkloadIdLicense ||
    serverNotes.length > 0 ||
    hasPolicyLicensingPrerequisites;
  const includePlanComparisons =
    !hasLicensingNotes ||
    limitedExperienceNote?.includePlanComparisons ||
    Boolean(dataSecurityNote) ||
    endpointNotes.length > 0 ||
    Boolean(cloudAppsNote) ||
    hasPolicyLicensingPrerequisites;

  return (
    <aside className="license-requirement-note licensing-disclaimer">
      <p><strong>Disclaimer:</strong>{" "}{licensingDisclaimerText}</p>
      {includePlanComparisons && (
        <p className="licensing-comparison-links">
          Enterprise licenses:{" "}
          <a href={planComparisonUrl} target="_blank" rel="noopener noreferrer">
            Microsoft Enterprise Plan Comparison
          </a>
          <br />
          SMB licenses:{" "}
          <a href={planComparisonUrl} target="_blank" rel="noopener noreferrer">
            Microsoft SMB Plan Comparison
          </a>
        </p>
      )}
    </aside>
  );
}
