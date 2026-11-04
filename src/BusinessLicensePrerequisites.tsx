import { translate } from "./i18n";
import { useLocale } from "./LocaleContext";
import { LicensingDisclaimer } from "./LicensingDisclaimer";
import type { License } from "./catalog";

export function BusinessLicensePrerequisites({
  licenses,
}: {
  licenses: readonly License[];
}) {
  const locale = useLocale();

  return (
    <>
      <p>
        {translate(locale, licenses.map((license) => license.name).join(" and "))}{" "}
        {translate(locale, licenses.length === 1
          ? "does not include Microsoft Entra ID P1, Intune Plan 1, or Microsoft Defender for Business, which are the minimum prerequisites for using our templates."
          : "do not include Microsoft Entra ID P1, Intune Plan 1, or Microsoft Defender for Business, which are the minimum prerequisites for using our templates.")}
      </p>
      <LicensingDisclaimer />
    </>
  );
}
