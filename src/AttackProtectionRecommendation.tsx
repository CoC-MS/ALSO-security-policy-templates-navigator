import { translate } from "./i18n";
import { useLocale } from "./LocaleContext";
import type { License, LicenseQuantities } from "./catalog";
import { getConditionalAccessCategoryLicenseNote } from "./solutionCatalog";
import { LicensingDisclaimer } from "./LicensingDisclaimer";
import { getRelatedSiteUrl, relatedSites } from "./relatedSites";

export const attackMapperUrl = relatedSites.attackPrevention.url;

export function AttackProtectionRecommendation({
  licenseIds,
  licenseQuantities = {},
}: {
  licenseIds: readonly License["id"][];
  licenseQuantities?: LicenseQuantities;
}) {
  const locale = useLocale();

  const licenseNote = getConditionalAccessCategoryLicenseNote(
    ["administrator-policies"],
    licenseIds,
    licenseQuantities,
  );

  return (
    <article className="recommendation-card">
      <div className="recommendation-card-main">
        <span className="choice-icon" aria-hidden="true">{translate(locale, "ATT")}</span>
        <div className="platform-title">
          <h2>{translate(locale, "MITRE ATT&CK to ALSO Microsoft Security Policy Template Mapper")}</h2>
          <span className={`experience-badge ${licenseNote ? "limited" : "full"}`}>
            {translate(locale, licenseNote ? "Limited experience" : "Full experience")}
          </span>
        </div>
        <p>{translate(locale, "Explore attack scenarios and their mapped ALSO Microsoft Security policy templates.")}</p>
        {licenseNote && (
          <aside className="license-requirement-note">
            <strong>{translate(locale, "Attack prevention with limited experience")}</strong>
            <p>{translate(locale, licenseNote.message)}</p>
          </aside>
        )}
        <LicensingDisclaimer />
        <div className="repository-links">
          <a className="button primary repository-link" href={getRelatedSiteUrl("attackPrevention", locale)}
            target="_blank" rel="noopener noreferrer">
            {translate(locale, "Open MITRE ATT&CK policy mapper →")}</a>
        </div>
      </div>
    </article>
  );
}
