# ALSO Microsoft Security Policy Templates Navigator

An interactive guide that combines a customer's Microsoft 365 licenses to identify every ALSO security policy template repository that meets their prerequisites.

**Live site:** https://coc-ms.github.io/ALSO-security-policy-templates-navigator/

## Live template counts  

The home page and Overview show an animated counter dashboard of the linked
repositories' default branches, refreshed every day. The last sync date and time
use Central European time (`Europe/Brussels`): CEST during daylight saving time
and CET in winter, regardless of the visitor's local time zone. Counters remain
visible during loading, and errors display an explicit unavailable message
instead of fabricated zero counts. Count-up animation respects reduced-motion
preferences. Category
totals count unique Git blob contents across repositories:

- Conditional Access policies: JSON files in `ConditionalAccess` folders.
- Endpoint policies: JSON files in `SettingsCatalog`, `AdministrativeTemplates`,
  `ADMXFiles`, `Autopilot`, `DeviceConfiguration`, `DriveUpdateProfiles`,
  `QualityUpdatePolicies`, and `UpdatePolicies`.
- Endpoint compliance policies and scripts: JSON files in `CompliancePolicies` and JSON
  or script files in `ComplianceScripts`.
- Scripts: PowerShell, shell, Python, and command scripts in `PowerShellScripts`,
  `DeviceHealthScripts`, and `RemediationScripts`, plus five Purview scripts.
- Filter settings and applications: JSON files in filter and `Applications`
  folders respectively.
- Purview contributes a fixed, user-confirmed count of 24 policies.

The overall template total is the sum of the seven displayed category counters,
including scripts, applications, and the fixed Purview contributions. It is
calculated from the same refreshed category data, so it always reconciles with
the category boxes. No additional uncategorized JSON files contribute to this
dashboard total.
Formatting differences or different exported IDs produce distinct hashes; this
is exact-content deduplication, not semantic policy comparison. No repository
file contents are downloaded or published. The free-template message does not
imply that Microsoft licenses are free.

The active `Deploy GitHub Pages` workflow runs daily at **03:17 UTC**
(05:17 CEST / 04:17 CET), and on pushes to `main`. Each run executes
`npm run sync:metadata` before testing, building, and deploying the refreshed
site. GitHub scheduled runs can be delayed. Inaccessible repositories retain
their cached metadata and emit a warning in the workflow logs.

## Reporting issues and requesting improvements

Use the [issue forms](https://github.com/CoC-MS/ALSO-security-policy-templates-navigator/issues/new/choose)
for Navigator bugs, feature or repository-listing requests, and documentation or
licensing corrections. For bugs, include your browser, all selected licenses and
platforms, any topic filter, and reproduction steps. For licensing or mapping
corrections, include a public authoritative reference where available.

Policy deployment questions, policy bugs, and requests for new deployable
policies belong in the relevant repository linked by the Navigator. Keep reports
free of customer data, tenant identifiers, secrets, confidential licensing
agreements, non-public pricing, and sensitive logs or screenshots. Do not
disclose security vulnerabilities in public issues.
