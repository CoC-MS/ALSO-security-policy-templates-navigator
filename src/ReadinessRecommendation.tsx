import {
  formatSelectedLicenseMix,
  getFrontlineLicenseNames,
  isLicenseEligible,
  licenses,
  type License,
  type LicenseQuantities,
} from "./catalog";
import { LicensingDisclaimer } from "./LicensingDisclaimer";

export type ReadinessGoalId = "security-fundamentals" | "copilot-readiness";

export const readinessUrl =
  "https://coc-ms.github.io/ALSO-Microsoft-Security-Fundamentals-and-Copilot-Readiness/";

export function getReadinessGuidance(
  goalId: ReadinessGoalId,
  licenseIds: readonly License["id"][],
  licenseQuantities: LicenseQuantities = {},
) {
  const eligible = [...new Set(licenseIds.filter(isLicenseEligible))];
  if (eligible.length === 0) return undefined;
  const isFullPlan = (id: License["id"]) =>
    id === "e5" || id === "e7" || id.includes("defender-purview");
  const hasDefender = (id: License["id"]) =>
    id === "e5" || id === "e7" || id.includes("defender");
  const hasPurview = (id: License["id"]) =>
    id === "e5" || id === "e7" || id.includes("purview");
  const full = goalId === "security-fundamentals" && eligible.every(isFullPlan);
  const name = goalId === "copilot-readiness" ? "Copilot Readiness" : "Security fundamentals";
  const selectedNames = licenses.filter((license) => eligible.includes(license.id))
    .map((license) => license.name).join(", ");
  const suiteName = (suite: "Defender" | "Purview", id: License["id"]) => {
    if (id.startsWith("business-premium")) return `Microsoft ${suite} Suite for Business Premium`;
    if (id.startsWith("e3")) return `Microsoft ${suite} Suite for Microsoft 365 E3`;
    if (id.startsWith("f1") || id.startsWith("f3")) {
      return `Microsoft ${suite} Suite FLW for ${getFrontlineLicenseNames([id])}`;
    }
    return `Microsoft ${suite} Suite`;
  };
  const planName = (id: License["id"]) => licenses.find((license) => license.id === id)?.name ?? id;
  const planCount = (id: License["id"]) => licenseQuantities[id] ?? 1;
  const selectedMix = formatSelectedLicenseMix(eligible, licenseQuantities);
  const planLabel = (id: License["id"]) => eligible.length > 1
    ? `${planCount(id)} ${planName(id)} ${planCount(id) === 1 ? "license" : "licenses"}`
    : planName(id);
  let message = "";
  if (goalId === "security-fundamentals" && !full) {
    const planGuidance = eligible.map((id) => {
      const label = planLabel(id);
      if (isFullPlan(id)) return `${label}: full Security fundamentals experience is covered for this plan.`;
      const missing = [
        ...(!hasDefender(id) ? [suiteName("Defender", id)] : []),
        ...(!hasPurview(id) ? [suiteName("Purview", id)] : []),
      ];
      return `${label}: add ${missing.join(" and ")} for full Security fundamentals coverage.`;
    });
    const mixedPrefix = eligible.length > 1
      ? `Selected plan mix: ${selectedMix}. Coverage applies only to users assigned each matching plan; the counts do not indicate whether the same users hold multiple plans. `
      : `With ${selectedNames}, `;
    message = eligible.length > 1
      ? `${mixedPrefix}${planGuidance.join(" ")}`
      : `${mixedPrefix}${planGuidance[0].replace(`${planLabel(eligible[0])}: `, "")}`;
    if (eligible.some((id) => !isFullPlan(id))) {
      message += " Defender Suite unlocks PIM, access reviews, risky sign-in and risky user policies, Identity Protection, Defender for Identity, Defender for Endpoint Plan 2, and Defender for Cloud Apps. Purview Suite unlocks SITs (Sensitive Information Types), advanced classifiers, auto labelling, full DLP and retention, and Insider Risk Management.";
    }
  } else if (goalId === "copilot-readiness") {
    const planGuidance = eligible.map((id) => {
      const label = planLabel(id);
      if (id === "e5" || id === "e7") {
        return `${label}: only core SharePoint Advanced Management features are included; add a SharePoint Advanced Management license for full experience.`;
      }
      const missing = [
        ...(!hasDefender(id) ? [suiteName("Defender", id)] : []),
        ...(!hasPurview(id) ? [suiteName("Purview", id)] : []),
        "a SharePoint Advanced Management license",
      ];
      let detail = `${label}: add ${missing.join(" and ")} for full Copilot Readiness experience.`;
      if (!hasPurview(id)) {
        detail += " Purview Suite unlocks SITs (Sensitive Information Types), advanced classifiers, auto labelling, full DLP and retention, and Insider Risk Management.";
      }
      if (!hasDefender(id)) {
        detail += " Defender Suite unlocks PIM, Access Reviews, risky sign-in and risky user policies, Identity Protection, Defender for Identity, Defender for Endpoint Plan 2, and Defender for Cloud Apps.";
      }
      return detail;
    });
    const mixedPrefix = eligible.length > 1
      ? `Selected plan mix: ${selectedMix}. Coverage applies only to users assigned each matching plan; the counts do not indicate whether the same users hold multiple plans. `
      : `With ${selectedNames}, `;
    const selectedBasePlans = licenses.filter((license) =>
      ["business-premium", "f1", "f3", "e3", "e5", "e7"].includes(license.id) &&
      eligible.some((id) => id === license.id || id.startsWith(`${license.id}-`)),
    ).map((license) => license.name).join(" and ");
    const guidance = eligible.length > 1
      ? planGuidance.join(" ")
      : planGuidance[0].replace(`${planLabel(eligible[0])}: `, "");
    message = `${mixedPrefix}${guidance} SharePoint Advanced Management is required for the full reporting experience for SharePoint sites and OneDrive. It can be purchased as an add-on with ${selectedBasePlans}.`;
  }
  return { name, experience: full ? "full" as const : "limited" as const, message };
}

export function ReadinessRecommendation({
  goalId, licenseIds,
  licenseQuantities = {},
}: {
  goalId: ReadinessGoalId;
  licenseIds: readonly License["id"][];
  licenseQuantities?: LicenseQuantities;
}) {
  const guidance = getReadinessGuidance(goalId, licenseIds, licenseQuantities);
  if (!guidance) return null;
  return (
    <article className="recommendation-card">
      <div className="recommendation-card-main">
        <span className="choice-icon" aria-hidden="true">{goalId === "copilot-readiness" ? "COP" : "SEC"}</span>
        <div className="platform-title">
          <h2>{guidance.name}</h2>
          <span className={`experience-badge ${guidance.experience}`}>
            {guidance.experience === "full" ? "Full experience" : "Limited experience"}
          </span>
        </div>
        <p>Explore ALSO Microsoft Security Fundamentals and Copilot Readiness guidance.</p>
        {guidance.message && (
          <aside className="license-requirement-note">
            <strong>{guidance.name} with limited experience</strong>
            <p>{guidance.message}</p>
          </aside>
        )}
        <LicensingDisclaimer />
        <div className="repository-links">
          <a className="button primary repository-link" href={readinessUrl}
            target="_blank" rel="noopener noreferrer">
            Open {guidance.name} &rarr;
          </a>
        </div>
      </div>
    </article>
  );
}
