# ALSO Microsoft Security Policy Templates Navigator  

An interactive guide that combines a customer's Microsoft 365 licenses to identify every ALSO security policy template repository that meets their prerequisites.

**Disclaimer:** Licensing prerequisites and feature availability listed on this page may be incorrect, incomplete, or outdated. We strongly recommend verifying all licensing information against the latest official Microsoft licensing documentation before making any purchasing or deployment decisions.

Enterprise licenses: [Microsoft Enterprise Plan Comparison](https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/bade/documents/products-and-services/en-us/education/Modern-Work-Plan-Comparison-Enterprise.pdf)

SMB licenses: [Microsoft SMB Plan Comparison](https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/bade/documents/products-and-services/en-us/education/Modern-Work-Plan-Comparison-SMB.pdf)

**Live site:** https://coc-ms.github.io/ALSO-security-policy-templates-navigator/

## Final recommendation experience

Limited Agent Security and AI Security messages name the selected licenses and explain that Agent 365 unlocks Conditional Access policies scoped to Agents. Both messages state that Agent 365 is included in Microsoft 365 E7.

Attack prevention opens a final recommendation card linking to the [MITRE ATT&CK to ALSO Microsoft Security Policy Template Mapper](https://coc-ms.github.io/CoC-MS-ALSO-Microsoft-Security-AttackPrevention/). It uses the shared experience badges, disclaimer, and Enterprise/SMB licensing sheets. Without Entra ID P2, its Limited experience guidance explains risky user, risky sign-in, and PIM authentication context requirements and names the matching Defender Suite add-on (FLW for the selected F1/F3 plans). Existing P2 entitlements suppress the upgrade note. The mapper also appears alongside other recommendations when goals are combined.

The Identity and Access choice page also shows license-aware Full/Limited badges. macOS Administrator protection is Full for every eligible license, including Business Premium. Desktop and Mobile apps are Full for every eligible license. Cloud apps and OAuth apps use Defender for Cloud Apps entitlement (also included with qualifying Defender Suite licenses). Only base E3/Business Premium and their Purview-only variants receive the Defender for Business / Defender for Endpoint P1 manual Custom Network Indicators/Web Content Filtering explanation, including on limited client Endpoint protection notes. F1/F3 without Defender Suite instead receive a Defender Suite FLW upgrade requirement to unlock Cloud Apps control; they are not described as having that manual Defender capability. OAuth apps use the same repository scope as Cloud apps, with an additional Workload ID Premium requirement only on the Conditional Access repository (included with E7). Combined selections use their existing union-entitlement convention.

Each final repository card shows a green Full experience badge when all selected categories for that repository are full, or a yellow Limited experience badge when any selected category is limited. Limitation-note headings use "<selected categories> with limited experience". Separate licensing prerequisites for full-experience server recommendations retain their prerequisite headings.

## Identity and Access limited-experience notes

Identity and Access limited-experience notes identify Microsoft Entra ID P2 as the upgrade for risky user policies and risky sign-in policies when P2 is missing. PIM authentication context is mentioned only for Administrator policies or Administrator protection selections. Agent 365 unlock guidance is shown only when the Agent policies category is selected; existing P2 and Microsoft 365 E7 entitlements suppress unnecessary upgrade notes. Windows administrator protection retains its separate Intune Suite requirements and explains the EPM (Endpoint Privilege Management) unlock. Its Windows 11 recommendation follows the shared experience-badge rule.

## Data Security limited-experience notes

E5, E7, E3 with Purview Suite, and F1/F3 with both Defender and Purview Suites have Full experience across Data Security, including Sensitivity labels. F1/F3 with Purview Suite alone retain Limited experience for Endpoint DLP: their note requires the matching Defender Suite FLW for the Defender functionality without which eDLP will not work. Combined selected entitlements also satisfy this Defender prerequisite.

Limited-experience Sensitive Information Types (SITs) notes explain that the Purview Suite add-on also unlocks sensitivity labels based on SITs, EDM (Exact Data Match), and Trainable Classifiers. The shared Data Security card retains its category-specific heading and Purview repository licensing-guide link.

Final Data Security cards explain only selected limited categories and link to the [Purview licensing guide](https://github.com/CoC-MS/ALSO-Microsoft-Security-Purview#purview-licensing-guide). The following feature mapping reflects the user-directed licensing correction on 27 October 2026 and supersedes the older blanket frontline eDLP exclusion:

| Category | Business Premium / Microsoft 365 E3 | Microsoft 365 F1 / F3 |
| --- | --- | --- |
| DLP | Email and file DLP included; Teams chat DLP requires the matching Purview Suite add-on. | No DLP included; Purview Suite FLW required. |
| Retention | Manual retention labels, basic organization-wide or location-wide retention policies, and Teams message retention included. Rules-based automatic retention, machine-learning-based retention, and Records Management require Purview Suite. | Manual retention labels and Teams message retention included; all other retention capabilities require Purview Suite FLW. |
| Endpoint DLP / Auto labelling | Not included in the base license; matching Purview Suite required. | Not included in the base license; Purview Suite FLW required. |

Defender-only add-ons do not unlock these Purview capabilities. Matching Purview Suite licenses give Full experience for the four categories above, except that F1/F3 Endpoint DLP also requires Defender Suite FLW. F1 selections remain available with prerequisite notes so users can see the required upgrade. Sensitivity labels are Full for the fully licensed plans described above and Business Premium with Purview Suite; other plans retain Limited experience. Base Business Premium and F1 include only manual, default, and mandatory sensitivity labeling in Microsoft 365 apps; base Microsoft 365 E3 and F3 also include sensitivity labeling for containers in Microsoft 365. Notes cover selected categories and their related prerequisites. Limited SIT guidance explains the Purview Suite requirement and advanced classifier capabilities. Enterprise and SMB comparison links point to their respective PDFs.

For Business Premium, E3, F1, and F3 without the matching Purview Suite, the Sensitivity labels note names that add-on to unlock automatic sensitivity labeling in Microsoft 365 apps, manual sensitivity labeling for Teams online meetings, automatic sensitivity labels in Exchange/SharePoint/OneDrive, default sensitivity labels for SharePoint document libraries, and labels based on advanced classifiers (Trainable Classifiers, EDM, Named Entities, and contextual classifiers). Existing Purview Suite and E5/E7 selections do not receive a redundant upgrade recommendation.

## Endpoint limited-experience notes

Linux Desktop notes for base F1, F3, E3, and Business Premium state that Defender for Endpoint P2 is required and is included in the matching Defender Suite. Upgrade text names only the selected F1/F3 plan(s). Manual Cloud Apps control names Defender for Business only for Business Premium, and Defender for Endpoint P1 only for E3.

Base F1/F3 and their Purview-only variants can select every endpoint platform and category, including AV and Windows Server, as Limited experience upgrade paths. Their notes require Defender Suite FLW to unlock Defender and other endpoint protection capabilities. Windows Server additionally requires Defender for Endpoint Server licensing per server, not Defender for Business servers; the Windows Server operating system license remains separate. An existing Defender Suite entitlement suppresses the redundant Suite purchase instruction. Other license families retain their existing endpoint rules.

Antivirus (AV) limitation notes do not mention Intune Suite. Administrator protection retains its separate Intune Suite/EPM prerequisite.

Final recommendation cards show category-specific limitations before the licensing disclaimer, with links to the repository licensing guide. On Windows, macOS, iOS/iPadOS, and Android, only Antivirus (AV) can show Limited experience for non-frontline license selections; all other client endpoint categories show Full experience. Base frontline selections follow the upgrade-path rules above. Linux Server/Desktop and non-frontline Windows Server licensing notes remain separate. The AV limitation mappings were reviewed against the repository tables on 27 October 2026:

| Repository guide | License scope and limitation |
| --- | --- |
| [Windows](https://github.com/CoC-MS/ALSO-Microsoft-Security-Windows#windows-licensing-guide) | Business Premium/E3 support the BP package, not the full E5-level experience. Defender for Cloud Apps integration needs its own entitlement. Exclude Intune Suite-dependent policies without that licensing. F3 supports only the listed Defender subset; F1 supports Intune settings only. |
| [macOS](https://github.com/CoC-MS/ALSO-Microsoft-Security-MacOS#macos-licensing-guide) | Business Premium/E3 lack the full Defender for Cloud Apps experience and can manually control access using Custom Network Indicators and Web Content Filtering. F1/F3 without Defender Suite support Intune settings only. |
| [iOS/iPadOS](https://github.com/CoC-MS/ALSO-Microsoft-Security-iOSandiPadOS#iosipados-licensing-guide) and [Android](https://github.com/CoC-MS/ALSO-Microsoft-Security-Android#android-licensing-guide) | Business Premium/E3 lack the full Defender for Cloud Apps experience. F1/F3 without Defender Suite support Intune settings only. |
| [Linux](https://github.com/CoC-MS/ALSO-Microsoft-Security-Linux#linux-server-and-desktop-licensing-guide) | Defender on Linux Desktop requires Defender for Endpoint P2, included in qualifying Defender Suite/FLW add-ons. Server licensing remains separate. |
| [Windows Server](https://github.com/CoC-MS/ALSO-Microsoft-Security-WindowsServer#windows-server-licensing-guide) | Server recommendations retain separate per-server/on-premises or Defender for Cloud prerequisites; a user Defender Suite entitlement does not replace server licensing. |

Purview-only add-ons do not remove AV limitations. Qualifying Defender Suite add-ons use the matching Business Premium, E3, or frontline (FLW) guidance. Notes are scoped to selected limited categories, with separate server prerequisites retained for endpoint server selections. Full experience labels are Navigator category guidance, not a guarantee of entitlement to every repository setting. Repository tables are guidance, not a substitute for current Microsoft licensing terms; review these mappings when the source guides change.
