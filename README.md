# ALSO Microsoft Security Policy Templates Navigator  

An interactive guide that combines a customer's Microsoft 365 licenses to identify every ALSO security policy template repository that meets their prerequisites.

**Disclaimer:** Licensing prerequisites and feature availability listed on this page may be incorrect, incomplete, or outdated. We strongly recommend verifying all licensing information against the latest official Microsoft licensing documentation before making any purchasing or deployment decisions.

Enterprise licenses: [Microsoft Enterprise Plan Comparison](https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/bade/documents/products-and-services/en-us/education/Modern-Work-Plan-Comparison-Enterprise.pdf)

SMB licenses: [Microsoft SMB Plan Comparison](https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/bade/documents/products-and-services/en-us/education/Modern-Work-Plan-Comparison-SMB.pdf)

**Live site:** https://coc-ms.github.io/ALSO-security-policy-templates-navigator/

## Final recommendation experience

The Identity and Access choice page also shows license-aware Full/Limited badges. macOS Administrator protection is Full for every eligible license, including Business Premium. Desktop and Mobile apps are Full for every eligible license. Cloud apps and OAuth apps use Defender for Cloud Apps entitlement (also included with qualifying Defender Suite licenses); base F1/F3/E3/Business Premium and Purview-only variants retain manual Custom Network Indicators/Web Content Filtering guidance. OAuth apps use the same repository scope as Cloud apps, with an additional Workload ID Premium requirement only on the Conditional Access repository (included with E7). Combined selections use their existing union-entitlement convention.

Each final repository card shows a green Full experience badge when all selected categories for that repository are full, or a yellow Limited experience badge when any selected category is limited. Limitation-note headings use "<selected categories> with limited experience". Separate licensing prerequisites for full-experience server recommendations retain their prerequisite headings.

## Identity and Access limited-experience notes

Identity and Access limited-experience notes identify Microsoft Entra ID P2 as the upgrade for risky user policies and risky sign-in policies when P2 is missing. PIM authentication context is mentioned only for Administrator policies or Administrator protection selections. Agent 365 unlock guidance is shown only when the Agent policies category is selected; existing P2 and Microsoft 365 E7 entitlements suppress unnecessary upgrade notes. Windows administrator protection retains its separate Intune Suite requirements and explains the EPM (Endpoint Privilege Management) unlock. Its Windows 11 recommendation follows the shared experience-badge rule.

## Data Security limited-experience notes

Final Data Security cards explain only selected limited categories and link to the [Purview licensing guide](https://github.com/CoC-MS/ALSO-Microsoft-Security-Purview#purview-licensing-guide). The following feature mapping reflects the user-directed licensing correction on 27 October 2026 and supersedes the older blanket frontline eDLP exclusion:

| Category | Business Premium / Microsoft 365 E3 | Microsoft 365 F1 / F3 |
| --- | --- | --- |
| DLP | Email and file DLP included; Teams chat DLP requires the matching Purview Suite add-on. | No DLP included; Purview Suite FLW required. |
| Retention | Manual retention labels, basic organization-wide or location-wide retention policies, and Teams message retention included. Rules-based automatic retention, machine-learning-based retention, and Records Management require Purview Suite. | Manual retention labels and Teams message retention included; all other retention capabilities require Purview Suite FLW. |
| Endpoint DLP / Auto labelling | Not included in the base license; matching Purview Suite required. | Not included in the base license; Purview Suite FLW required. |

Defender-only add-ons do not unlock these Purview capabilities. Matching Purview Suite licenses give Full experience for the four categories above; F1 selections remain available with prerequisite notes so users can see the required upgrade. Sensitivity labels show Limited experience for every license. Business Premium and F1 include only manual, default, and mandatory sensitivity labeling in Microsoft 365 apps; Microsoft 365 E3 and F3 also include sensitivity labeling for containers in Microsoft 365. For Suite and E5/E7 selections, verify individual settings against the selected entitlement rather than assuming a base-license restriction. SIT rules are unchanged. Notes never include unrelated categories. Where no exact SIT restriction is supplied, the note requests a setting-level licensing check. Enterprise and SMB comparison links point to their respective PDFs.

For Business Premium, E3, F1, and F3 without the matching Purview Suite, the Sensitivity labels note names that add-on to unlock automatic sensitivity labeling in Microsoft 365 apps, manual sensitivity labeling for Teams online meetings, automatic sensitivity labels in Exchange/SharePoint/OneDrive, default sensitivity labels for SharePoint document libraries, and labels based on advanced classifiers (Trainable Classifiers, EDM, Named Entities, and contextual classifiers). Existing Purview Suite and E5/E7 selections do not receive a redundant upgrade recommendation.

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
