import { LicensingDisclaimer } from "./LicensingDisclaimer";
import type { License } from "./catalog";

export function BusinessLicensePrerequisites({
  licenses,
}: {
  licenses: readonly License[];
}) {
  return (
    <>
      <p>
        {licenses.map((license) => license.name).join(" and ")}{" "}
        {licenses.length === 1 ? "does" : "do"} not
        include Microsoft Entra ID P1, Intune Plan 1, or Microsoft Defender for
        Business, which are the minimum prerequisites for using our templates.
      </p>
      <LicensingDisclaimer />
    </>
  );
}
