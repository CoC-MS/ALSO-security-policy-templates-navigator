import type { License, Platform } from "./catalog";

export function shouldShowAiSecurityLicenseActions(
  licenseIds: readonly License["id"][],
  platformId: Platform["id"],
): boolean {
  return platformId === "ai-security" &&
    licenseIds.includes("e5") &&
    !licenseIds.includes("e7");
}

export function AiSecurityLicenseActions() {
  return (
    <aside className="ai-security-actions" aria-labelledby="ai-security-actions-title">
      <h3 id="ai-security-actions-title">Need implementation or consulting?</h3>
      <div className="ai-security-action-list">
        <div className="ai-security-action">
          <button className="button secondary" type="button" disabled>
            Purchase Agent 365 license
          </button>
          <span>Link coming soon</span>
        </div>
        <div className="ai-security-action">
          <button className="button secondary" type="button" disabled>
            Purchase Microsoft 365 E7 license
          </button>
          <span>Link coming soon</span>
        </div>
        <div className="ai-security-action">
          <button className="button secondary" type="button" disabled>
            Request Professional Services Help from ALSO CoE
          </button>
          <span>Coming soon</span>
        </div>
      </div>
    </aside>
  );
}
