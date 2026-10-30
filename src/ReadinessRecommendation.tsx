import { getFrontlineLicenseNames, isLicenseEligible, licenses, type License } from "./catalog";
import { LicensingDisclaimer } from "./LicensingDisclaimer";

export type ReadinessGoalId = "security-fundamentals" | "copilot-readiness";

export const readinessUrl =
  "https://coc-ms.github.io/ALSO-Microsoft-Security-Fundamentals-and-Copilot-Readiness/";

export function getReadinessGuidance(goalId: ReadinessGoalId, licenseIds: readonly License["id"][]) {
  const eligible = licenseIds.filter(isLicenseEligible);
  if (eligible.length === 0) return undefined;
  const hasDefender = eligible.some((id) => id === "e5" || id === "e7" || id.includes("defender"));
  const hasPurview = eligible.some((id) => id === "e5" || id === "e7" || id.includes("purview"));
  const full = goalId === "security-fundamentals" && hasDefender && hasPurview;
  const name = goalId === "copilot-readiness" ? "Copilot Readiness" : "Security fundamentals";
  const selectedNames = licenses.filter((license) => eligible.includes(license.id))
    .map((license) => license.name).join(", ");
  const suiteNames = (suite: "Defender" | "Purview") => [
    ...(eligible.some((id) => id.startsWith("business-premium"))
      ? [`Microsoft ${suite} Suite for Business Premium`] : []),
    ...(eligible.some((id) => id.startsWith("e3"))
      ? [`Microsoft ${suite} Suite for Microsoft 365 E3`] : []),
    ...(eligible.some((id) => id.startsWith("f1") || id.startsWith("f3"))
      ? [`Microsoft ${suite} Suite FLW for ${getFrontlineLicenseNames(eligible)}`] : []),
  ].join(" or ");
  let message = "";
  if (!full) {
    if (goalId === "security-fundamentals") {
      const missing = [
        ...(!hasDefender ? [suiteNames("Defender")] : []),
        ...(!hasPurview ? [suiteNames("Purview")] : []),
      ];
      message = `With ${selectedNames}, add ${missing.join(" and ")} for the full Security fundamentals experience. Defender Suite unlocks features such as Defender for Identity, Defender for Cloud Apps, PIM, access reviews, risky sign-in policies, and risky user policies. Purview Suite unlocks auto labelling, SITs (Sensitive Information Types), and the full DLP and retention policy experience.`;
    } else if (hasDefender && hasPurview) {
      const coreLicenseNames = licenses.filter((license) =>
        (license.id === "e5" || license.id === "e7") && eligible.includes(license.id),
      ).map((license) => license.name).join(" and ");
      message = coreLicenseNames
        ? `With ${selectedNames}, only core SharePoint Advanced Management features are included in ${coreLicenseNames}. Add a SharePoint Advanced Management license for the full Copilot Readiness experience.`
        : `With ${selectedNames}, add SharePoint Advanced Management for the full Copilot Readiness experience.`;
    } else {
      const missing = [
        ...(!hasDefender ? [suiteNames("Defender")] : []),
        ...(!hasPurview ? [suiteNames("Purview")] : []),
        "Microsoft 365 Copilot",
      ];
      message = `With ${selectedNames}, add ${missing.join(" and ")} for the full Copilot Readiness experience.`;
      if (!hasPurview) {
        message += " Purview Suite unlocks SITs (Sensitive Information Types), auto labelling, and the full DLP and retention policy experience.";
      }
      if (!hasDefender) {
        message += " Defender Suite unlocks features such as Defender for Identity and Defender for Cloud Apps.";
      }
    }
  }
  return { name, experience: full ? "full" as const : "limited" as const, message };
}

export function ReadinessRecommendation({
  goalId, licenseIds,
}: {
  goalId: ReadinessGoalId;
  licenseIds: readonly License["id"][];
}) {
  const guidance = getReadinessGuidance(goalId, licenseIds);
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
