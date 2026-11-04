# ALSO Security Policy Templates Navigator — selection edge cases

Tested: **29 October 2026**, using the live [navigator](https://coc-ms.github.io/ALSO-security-policy-templates-navigator/) in a desktop browser.

Site snapshot: Public Preview; 292 templates; displayed repository sync **29 Oct 2026, 15:13:12 CET**.

The main repository handoff works: clicking **Open Windows 11 repository** in the catalog opened the correct public [GitHub repository](https://github.com/CoC-MS/ALSO-Microsoft-Security-Windows) in a new tab. The most actionable problems are an incorrect eligibility badge when a selected platform has no categories, and a Back-navigation loop that strands a partner away from their recommendations.

This was exploratory testing through the visible UI. No source code was inspected or changed. Priorities below are suggested triage priorities. Licensing findings concern the site's own displayed states and explanations; they are not an independent Microsoft licensing audit. The test did not cover every possible combination, mobile layouts, or every outbound repository.

## Findings at a glance

| ID | Priority | Finding | Classification |
| --- | --- | --- | --- |
| EC-01 | High | Leaving one platform's categories empty produces an unwarranted **Full experience** result | Confirmed behavior defect |
| EC-02 | Medium | FAQ → catalog → FAQ creates a repeating in-page Back loop | Confirmed navigation defect |
| EC-03 | Medium | A selected goal can be skipped without explanation while remaining in the results heading | Selection-validation / UX gap |
| EC-04 | Medium | Adding E7 hides Business Premium limitations behind one combined **Full experience** label | Mixed-license ambiguity; intended aggregation needs a product decision |
| EC-05 | Low | Unsupported licenses silently disappear from the eligible summary in mixed selections | Exclusion-feedback gap |

## EC-01 — Empty platform categories incorrectly produce Full experience

**Reproduce**

1. Start over and select **Microsoft 365 Business Premium**.
2. Select **Endpoint protection**.
3. Select **Windows** and **Windows Server**.
4. Continue to policy categories.
5. Select **Firewall under Windows only**. Leave all Windows Server categories unselected.
6. Open recommendations.

**Observed**

- The Windows Servers card appears with a green **Full experience** badge.
- It has no specific server-license prerequisite explanation, only the general disclaimer.
- Yet all three Windows Server categories on the preceding screen are labeled **Limited experience** for the same selected license.
- Go Back, select **Firewall under Windows Server**, and reopen recommendations: the same server card becomes **Limited experience** and now explains the additional server-license requirements.

The empty-category path therefore gives a more permissive result than selecting any of the available server categories. This was reproduced again from Start over. A broader test selecting all seven endpoint platforms but only Windows Firewall also produced Full experience badges for platforms without categories.

**Why it matters:** A partner can arrive at the correct repository with misleading expectations about applicability. Skipping a category should not remove prerequisite guidance or improve eligibility.

**Expected / suggested fix:** Require at least one category for each selected platform, or explicitly let the partner skip/remove that platform. If a general platform recommendation is intentional, evaluate its platform-level prerequisites; an empty category set must not imply full eligibility. The exact implementation cause remains unverified.

**Regression check:** With Business Premium + Windows + Windows Server, leaving server categories empty must not produce Full experience for Windows Servers. Explicitly selecting Server Firewall must continue to show its prerequisite guidance.

Evidence: [empty server categories](06-server-categories-empty.jpg), [incorrect Full experience result](07-server-incorrect-full-experience.jpg), [Limited experience after selecting Server Firewall](08-server-category-selected-limited.jpg).

## EC-02 — Repeated FAQ/catalog detours trap the Back button

**Reproduce**

1. Reach recommendations. Tested with **Business Premium → Data Security → Sensitive Information Types (SITs)**.
2. Use the header to open **FAQ**.
3. Use the header to open **View all policies**.
4. Use the header to open **FAQ** again.
5. Click the page's **← Back** repeatedly.

**Observed sequence**

| Action | Result |
| --- | --- |
| Back #1 | All security policy templates |
| Back #2 | Frequently asked questions |
| Back #3 | All security policy templates |
| Back #4 | Frequently asked questions |

The in-page Back controls never return to the recommendations in this sequence. **Home** recovers to the initial license screen with the prior selections cleared.

Control case: recommendations → FAQ → catalog → Back → Back worked. The additional header navigation back into FAQ triggers the loop.

**Why it matters:** A partner looking for help can lose the route back to their tailored recommendations and have to rebuild their selections.

**Expected / suggested fix:** Preserve a reliable return target to the wizard, or use a navigation stack that cannot form a cycle between auxiliary pages. A persistent **Return to my recommendations** action would also provide a clear recovery path.

**Regression check:** Repeated transitions among FAQ and the catalog must eventually return to the same recommendation state through Back, with license and goal selections intact.

Evidence: [catalog side of loop](09-back-loop-catalog.jpg), [FAQ side of loop](10-back-loop-faq.jpg). The ordered reproduction above is essential; a single screenshot cannot establish a navigation loop.

## EC-03 — An unconfigured selected goal is silently skipped

**Reproduce**

1. Select **Microsoft 365 Business Premium**.
2. Select both **AI and Agent Security** and **Data Security**.
3. Continue to scenarios.
4. Select **Agent Security** only. Leave every Data Security option empty.
5. Click **View recommendations**.

**Observed**

- The instructions say to select one or more options under each goal, but the button enables after only Agent Security is selected.
- The results heading still includes **AI and Agent Security + Data Security**.
- Selected needs contains only Agent Security.
- The results contain Conditional Access and AI Security Windows 11; there is no Purview recommendation or explanation that Data Security was skipped.

The same general behavior occurred with all eight goals selected: unconfigured goals remained in the results heading without corresponding configured needs.

**Why it matters:** A partner can reasonably think both requested goals were handled, and miss the route to the data-security repository.

**Expected / suggested fix:** Validate every selected goal that requires options. Alternatively, make skipping explicit, identify skipped goals on the results page, and give a direct route to finish their selections. If selecting an option under every goal is intentionally optional, change the instruction and results heading accordingly.

**Regression check:** This two-goal flow must either request a Data Security choice or clearly identify Data Security as skipped. It must not imply coverage of both goals without explanation.

Evidence: [incomplete selections with enabled recommendations button](01-incomplete-goal-selection.jpg), [result with Data Security named but unconfigured](02-data-security-omitted.jpg).

## EC-04 — Mixed license tiers conceal lower-tier limitations

**Reproduce and compare**

1. Select **Business Premium alone → AI and Agent Security → Agent Security**.
2. Note the Limited experience badges and the Agent 365 prerequisite explanation.
3. Start over and select **Microsoft 365 E7 + Microsoft 365 Business Premium**.
4. Follow the same Agent Security path.

**Observed**

Both the Conditional Access and AI Security Windows 11 cards now say **Full experience**. The result explicitly names both selected licenses, but the Business Premium-specific limitation disappears. There is no breakdown of which selected license supplies full support.

**Why it matters:** The initial screen invites partners to select all licenses their customer has. For a mixed estate, one broadly capable license selection can make the result look applicable across the whole selection.

**Classification:** The behavior is confirmed. Whether using the most capable selected license is an algorithmic defect depends on the intended meaning of multi-license selection. The lack of an explanation is the UX concern; this finding does not assert that the union-based recommendation should be prohibited.

**Expected / suggested fix:** Keep the repository available, but display eligibility by selected license or use wording such as **Full experience for E7; additional requirements for Business Premium**. Explain whether licenses are being treated as separate user groups or combined entitlements.

**Regression check:** Adding E7 may expand available recommendations, but must not hide the scope of Business Premium limitations.

Evidence: [Business Premium-only result](14-business-premium-agent-only.jpg), [E7 + Business Premium result](04-mixed-licenses-full-experience.jpg).

## EC-05 — Unsupported licenses disappear without an exclusion explanation

**Reproduce**

1. Select **Microsoft 365 Business Basic** and **Microsoft 365 Business Premium**.
2. Click **Continue with 2 licenses**.

**Observed**

- The next screen's Selected eligible licenses summary contains only Business Premium.
- There is no explanation that Business Basic was excluded or why.
- Go Back: both licenses are still selected, so Basic was filtered from the eligible summary rather than deselected.
- As a control, Basic alone, and Basic + Business Standard together, produce an explicit prerequisite warning.

**Why it matters:** In a mixed customer estate, the unsupported portion can become easy to overlook. The eligible-only label helps, but it does not explain the disappearance.

**Expected / suggested fix:** Continue the supported flow while showing a compact notice such as **Business Basic was excluded from matching; these recommendations are based on Business Premium**. Preserve the full selection so the partner can review it.

**Regression check:** A supported + unsupported selection should not block progress, but should state which license was excluded and why.

Evidence: [two selected licenses](11-mixed-supported-unsupported-selection.jpg), [eligible summary containing only one](12-unsupported-license-disappears.jpg).

## Other product questions worth reviewing

These are observations rather than additional confirmed defects:

- **Separately owned add-ons cannot be represented.** The license selector offers base plans and predefined Defender/Purview bundles, but no standalone Agent 365, Entra ID P2, or server-license selections. Recommendation messages ask partners to add some of these. Consider an optional add-on step or wording that acknowledges they may already own the entitlement. The site can still link to repositories without this feature.
- **Coming-soon and upgrade messaging can conflict.** The Business Premium → AI Security result includes AI Security macOS with a Coming badge and disabled repository button, alongside text saying an Agent 365 license unlocks its full experience. Separate future availability from license eligibility so an upgrade is not presented as resolving the unavailable repository. [Observed result](03-coming-soon-upgrade-message.jpg).

## Checks that behaved as expected

| Check | Observed result |
| --- | --- |
| No selected licenses, including deselecting the last selected licenses | No Continue action |
| Business Basic alone | Explicit prerequisite warning |
| Business Basic + Business Standard | Warning names both unsupported licenses |
| No selected security goals; deselecting the final goal | Continue disabled |
| Endpoint platform/category screens with no selections | Progress disabled |
| Start over | Clears the current selections |
| Normal in-flow Back | Preserves the tested selections |
| Remove Endpoint protection after configuring Windows and Windows Server; switch to Data Security/SITs | Result contains Purview only; old endpoint needs do not leak |
| Windows Firewall + Antivirus with Business Premium | Combined Windows result is Limited experience, with Antivirus explanation |
| F1 → Windows → Firewall | Limited experience and base-license limitation guidance remain visible |
| One-level FAQ detour | Returns to existing recommendations |
| FAQ → catalog → Back → Back | Returns correctly, unlike the repeated-cross-navigation case in EC-02 |
| Catalog search for `firewall` and `   FIREWALL   ` | Both return six repository sections |
| Catalog search for `zzzz-no-such-template` | Clear no-results state; Clear restores the catalog |
| Catalog Back after searching | Restores the existing recommendation state |
| Open Windows 11 repository from catalog | Opens the correct GitHub repository in a new tab |

## Suggested order of work

1. Fix EC-01 and add a regression case for each selected platform having zero categories.
2. Fix the navigation return loop in EC-02.
3. Make skipped goals explicit or validate them consistently (EC-03).
4. Clarify multi-license coverage and exclusions (EC-04 and EC-05).

The repository links can remain easy to reach throughout these changes. The main improvement is making the selections and eligibility explanations trustworthy before the partner leaves for GitHub.
