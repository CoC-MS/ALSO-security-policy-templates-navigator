# ALSO Microsoft Security Policy Templates Navigator

An interactive guide that combines a customer's Microsoft 365 licenses to identify every ALSO security policy template repository that meets their prerequisites.

**Live site:** https://coc-ms.github.io/ALSO-security-policy-templates-navigator/

## Template count

The home-page template total counts `.json` files on the default branch of each
unique linked repository, excluding files under Applications, Authentication
Context (including AuthenticationContext), Groups, and NamedLocations folders. Counts
refresh with the daily metadata sync; inaccessible repositories retain their
last verified counts. No repository file contents are downloaded or published.
Identical JSON files are counted only once across all repositories using Git
content hashes. Formatting differences or different exported IDs produce distinct
hashes; this is exact-content deduplication, not semantic policy comparison.
The free-template message does not imply that Microsoft licenses are free.

Purview contributes a fixed, user-confirmed count of 24 policy templates rather
than a JSON-file count, since its templates are deployed through PowerShell.

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
