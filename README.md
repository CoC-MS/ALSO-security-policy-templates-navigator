# ALSO Microsoft Security Policy Templates Navigator  

An interactive guide that combines a customer's Microsoft 365 licenses to identify every ALSO security policy template repository that meets their prerequisites.

In step 2, choose **Identity and Access**, then **Conditional Access** to select Administrator, Internal user, Service Account, Agent, or Guest user policies. These categories recommend the Conditional Access repository. Service principal policies are marked **Coming** and cannot yet be selected.

Policy-selection previews show short descriptions and experience/Coming badges only. Licensing prerequisites appear on the final repository results, not on the previews.

Final licensing-note headings use the selected category names (for example, **Retention licensing prerequisites**), across all security goals. Shared notes list the relevant selected categories once; repository names and licensing requirements are unchanged.

**Identity and Access** groups **Conditional Access** and **Administrator protection** in a separate selection page. Either or both can be combined with other security goals; their policy categories, recommendations, and licensing behavior remain unchanged.

Licensing prerequisite messages appear only for selected categories with Limited experience on that repository's platform. Full-experience categories do not show prerequisite messages or contribute to shared licensing headings. The licensing disclaimer and comparison links remain on every final repository card.

Administrator protection recommends Conditional Access, Windows, and macOS repositories. Its Windows result shows Limited experience and the Intune Suite add-on prerequisite unless Microsoft 365 E5/E7 is selected; the result notes Intune Suite's inclusion in E5/E7.

Mobile app protection provides Full experience for every eligible license. Desktop app protection provides Full experience on macOS; Windows requires Microsoft 365 E5/E7 or the Microsoft Intune Suite add-on. Other Windows selections show Limited experience and name Intune Suite on the final repository result, without applying unrelated endpoint Defender requirements to app-only recommendations.

Global Secure Access Policies recommend Conditional Access and show Limited experience unless Microsoft 365 E7 is selected. Final results explain Internet Access/Private Access licensing and inclusion in Entra Suite and E7. App protection also offers an **On-premises app protection** repository preview marked **Coming**; its final result explains the Private Access prerequisite and does not imply those templates are already available. Both use the full disclaimer and both comparison links.

Conditional Access guidance and experience badges follow the selected licenses. Microsoft 365 E7 provides the full experience for all available categories; Microsoft 365 E5 provides the full experience except for Agent policies, which require Agent 365. Business Premium, E3, F1, and F3 without Defender Suite show the Entra ID P2 prerequisite and the corresponding Defender Suite add-on (Defender Suite FLW for F1/F3) on the final recommendation. Every result disclaimer includes both Enterprise and SMB comparison links, including server, Agent 365, and Workload ID notices.

**Disclaimer:** Licensing prerequisites and feature availability listed on this page may be incorrect, incomplete, or outdated. We strongly recommend verifying all licensing information against the latest official Microsoft licensing documentation before making any purchasing or deployment decisions.

Enterprise licenses: [Microsoft Enterprise Plan Comparison](https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/bade/documents/products-and-services/en-us/education/Modern-Work-Plan-Comparison-Enterprise.pdf)

SMB licenses: [Microsoft SMB Plan Comparison](https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/bade/documents/products-and-services/en-us/education/Modern-Work-Plan-Comparison-Enterprise.pdf)

**Live site:** https://coc-ms.github.io/ALSO-security-policy-templates-navigator/
