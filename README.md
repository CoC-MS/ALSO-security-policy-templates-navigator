# ALSO Microsoft Security Policy Templates Navigator  

An interactive guide that combines a customer's Microsoft 365 licenses to identify every ALSO security policy template repository that meets their prerequisites.

**Disclaimer:** Licensing prerequisites and feature availability listed on this page may be incorrect, incomplete, or outdated. We strongly recommend verifying all licensing information against the latest official Microsoft licensing documentation before making any purchasing or deployment decisions.

Enterprise licenses: [Microsoft Enterprise Plan Comparison](https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/bade/documents/products-and-services/en-us/education/Modern-Work-Plan-Comparison-Enterprise.pdf)

SMB licenses: [Microsoft SMB Plan Comparison](https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/bade/documents/products-and-services/en-us/education/Modern-Work-Plan-Comparison-Enterprise.pdf)

**Live site:** https://coc-ms.github.io/ALSO-security-policy-templates-navigator/

## Data Security limited-experience notes

Final Data Security cards explain the selected limited categories and link to the [Purview licensing table](https://github.com/CoC-MS/ALSO-Microsoft-Security-Purview#purview-licensing-guide), reviewed on 27 October 2026. Business Premium/E3/F3 base tiers lack the full DLP and auto-labelling experience; qualifying Purview Suite add-ons are named. FLW guidance retains the table's eDLP exclusion and surfaces its additional Defender Suite prerequisite for the full frontline eDLP experience. Where the table does not define individual retention or SIT restrictions, the note explicitly asks for a setting-level licensing check rather than inventing unsupported limitations. Existing category availability and Full/Limited labels are unchanged; full categories do not receive limitation notes.

## Endpoint limited-experience notes

Final recommendation cards show category-specific limitations before the licensing disclaimer, with links to the repository licensing guide. On Windows, macOS, iOS/iPadOS, and Android, only Antivirus (AV) can show Limited experience and its limitation message; all other endpoint categories show Full experience. Existing AV eligibility restrictions remain in place. Windows Server, Linux Server, and Linux Desktop retain their previous rules and notes. The AV limitation mappings were reviewed against the repository tables on 27 October 2026:

| Repository guide | License scope and limitation |
| --- | --- |
| [Windows](https://github.com/CoC-MS/ALSO-Microsoft-Security-Windows#windows-licensing-guide) | Business Premium/E3 support the BP package, not the full E5-level experience. Defender for Cloud Apps integration needs its own entitlement. Exclude Intune Suite-dependent policies without that licensing. F3 supports only the listed Defender subset; F1 supports Intune settings only. |
| [macOS](https://github.com/CoC-MS/ALSO-Microsoft-Security-MacOS#macos-licensing-guide) | Business Premium/E3 lack the full Defender for Cloud Apps experience. Business Premium uses Custom Indicators and Web Content Filtering rather than Cloud App Catalog. F1/F3 without Defender Suite support Intune settings only. |
| [iOS/iPadOS](https://github.com/CoC-MS/ALSO-Microsoft-Security-iOSandiPadOS#iosipados-licensing-guide) and [Android](https://github.com/CoC-MS/ALSO-Microsoft-Security-Android#android-licensing-guide) | Business Premium/E3 lack the full Defender for Cloud Apps experience. F1/F3 without Defender Suite support Intune settings only. |
| [Linux](https://github.com/CoC-MS/ALSO-Microsoft-Security-Linux#linux-server-and-desktop-licensing-guide) | Desktop licensing lists E5-level entitlements, including qualifying Defender Suite/FLW add-ons. Server licensing remains separate. |
| [Windows Server](https://github.com/CoC-MS/ALSO-Microsoft-Security-WindowsServer#windows-server-licensing-guide) | Server recommendations retain separate per-server/on-premises or Defender for Cloud prerequisites; a user Defender Suite entitlement does not replace server licensing. |

Purview-only add-ons do not remove AV limitations. Qualifying Defender Suite add-ons use the matching Business Premium, E3, or frontline (FLW) guidance. Notes are scoped to selected limited categories, with separate server prerequisites retained for endpoint server selections. Full experience labels are Navigator category guidance, not a guarantee of entitlement to every repository setting. Repository tables are guidance, not a substitute for current Microsoft licensing terms; review these mappings when the source guides change.
