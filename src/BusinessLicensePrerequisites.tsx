import { LicensingDisclaimer } from "./LicensingDisclaimer";

export function BusinessLicensePrerequisites() {
  return (
    <>
      <p>
        Microsoft 365 Business Standard and Microsoft 365 Business Basic do not
        include Microsoft Entra ID P1, Intune Plan 1, or Microsoft Defender for
        Business, which are the minimum prerequisites for using our templates.
      </p>
      <LicensingDisclaimer />
    </>
  );
}
