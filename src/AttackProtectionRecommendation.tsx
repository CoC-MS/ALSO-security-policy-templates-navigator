import type { License } from "./catalog";
import { getConditionalAccessCategoryLicenseNote } from "./solutionCatalog";
import { LicensingDisclaimer } from "./LicensingDisclaimer";

export const attackMapperUrl =
  "https://coc-ms.github.io/CoC-MS-ALSO-Microsoft-Security-AttackPrevention/";

export function AttackProtectionRecommendation({
  licenseIds,
}: {
  licenseIds: readonly License["id"][];
}) {
  const licenseNote = getConditionalAccessCategoryLicenseNote(
    ["administrator-policies"],
    licenseIds,
  );

  return (
    <article className="recommendation-card">
      <div className="recommendation-card-main">
        <span className="choice-icon" aria-hidden="true">ATT</span>
        <div className="platform-title">
          <h2>MITRE ATT&amp;CK to ALSO Microsoft Security Policy Template Mapper</h2>
          <span className={`experience-badge ${licenseNote ? "limited" : "full"}`}>
            {licenseNote ? "Limited experience" : "Full experience"}
          </span>
        </div>
        <p>Explore attack scenarios and their mapped ALSO Microsoft Security policy templates.</p>
        <p className="recommended-policy-note">
          Mapped policies are a starting point and do not guarantee full protection.
          Verify the prerequisites for each policy before deployment.
        </p>
        {licenseNote && (
          <aside className="license-requirement-note">
            <strong>Attack protection with limited experience</strong>
            <p>{licenseNote.message}</p>
          </aside>
        )}
        <LicensingDisclaimer />
        <div className="repository-links">
          <a className="button primary repository-link" href={attackMapperUrl}
            target="_blank" rel="noopener noreferrer">
            Open MITRE ATT&amp;CK policy mapper &rarr;
          </a>
        </div>
      </div>
    </article>
  );
}
