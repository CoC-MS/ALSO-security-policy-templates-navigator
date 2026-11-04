import type { License, Platform } from "./catalog";
import { translate, type Locale } from "./i18n";

export function shouldShowAiSecurityLicenseActions(
  licenseIds: readonly License["id"][],
  platformId: Platform["id"],
): boolean {
  return platformId === "ai-security" &&
    licenseIds.includes("e5") &&
    !licenseIds.includes("e7");
}

export function AiSecurityLicenseActions({ locale = "en" }: { locale?: Locale }) {
  return (
    <aside className="ai-security-actions" aria-label={translate(locale, "License and professional services options")}>
      <section className="ai-security-action-section" aria-labelledby="ai-security-license-title">
        <h3 id="ai-security-license-title">{translate(locale, "Explore licenses")}</h3>
        <div className="ai-security-action-list">
          <a
            className="button primary"
            href="https://marketplace.also.no/#/Marketplace/Explore/p:1;l:20;st:Root;ord:Ranking,ASC;n:QWdlbnQgMzY1"
            target="_blank"
            rel="noopener noreferrer"
          >
            {translate(locale, "Explore Agent 365 licenses in ACMP")}
          </a>
          <a
            className="button primary"
            href="https://marketplace.also.no/#/Marketplace/Explore/p:1;l:20;st:Root;ord:Ranking,ASC;n:bWljcm9zb2Z0IDM2NSBFNw=="
            target="_blank"
            rel="noopener noreferrer"
          >
            {translate(locale, "Explore Microsoft 365 E7 licenses in ACMP")}
          </a>
        </div>
      </section>
      <section className="ai-security-action-section" aria-labelledby="ai-security-services-title">
        <h3 id="ai-security-services-title">{translate(locale, "Need implementation help or consulting?")}</h3>
        <div className="ai-security-action-list">
          <button className="button secondary" type="button" disabled>
            {translate(locale, "Request Professional Services Help from ALSO CoE")}
          </button>
          <span>{translate(locale, "Coming soon")}</span>
        </div>
      </section>
    </aside>
  );
}
