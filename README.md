# ALSO Microsoft Security Policy Templates Navigator  

An interactive guide that combines a customer's Microsoft 365 licenses to identify every ALSO security policy template repository that meets their prerequisites.

Attack protection is temporarily unavailable and marked **Coming** in the security-goal menu while its content is being completed.

**Disclaimer:** Licensing prerequisites and feature availability listed on this page may be incorrect, incomplete, or outdated. We strongly recommend verifying all licensing information against the latest official Microsoft licensing documentation before making any purchasing or deployment decisions.

Enterprise licenses: [Microsoft Enterprise Plan Comparison](https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/bade/documents/products-and-services/en-us/education/Modern-Work-Plan-Comparison-Enterprise.pdf)

SMB licenses: [Microsoft SMB Plan Comparison](https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/bade/documents/products-and-services/en-us/education/Modern-Work-Plan-Comparison-Enterprise.pdf)

**Live site:** https://coc-ms.github.io/ALSO-security-policy-templates-navigator/

## Threat-informed policy coverage

The Attack protection explorer is part of the existing **Attack protection** section. That section remains marked **Coming** and disabled; the explorer does not add a separate navigation item or change the release gate.

Coverage describes reviewed settings in the public ALSO policy libraries for AiTM phishing, device-code phishing, infostealer, ClickFix, LLMjacking, and cryptojacking. It is not a customer tenant assessment, deployment or assignment check, effectiveness measure, security score, or probability of protection. A policy template may be disabled, have exclusions, require specific licensing or platform prerequisites, and still need review and deployment. Scenario mapping is limited to the exact setting values and scope stated beside each source; general-purpose hardening is identified as supporting hardening, not scenario-specific prevention or detection. Missing mappings are explicit library-evidence gaps, not proof that no other protection exists.

The scheduled Pages workflow refreshes `public/attack-policy-coverage.v1.json` from the nine repositories listed in `scripts/sync-attack-coverage.mjs`. The versioned index records each upstream commit and tree, relevant source paths, Git blob SHAs, raw-byte SHA-256 hashes, file classifications, duplicate-content references, parse status, and evidence verification results. Mappings in `scripts/attack-coverage-mappings.json` are reviewed definitions: selectors identify an exact JSON Pointer, Graph setting ID/value field, or a JSON Pointer into a base64-encoded JSON payload; every expected value must match the current source. Changed, deleted, ambiguous, or malformed mapped evidence is not counted and is shown for review.

To refresh locally, authenticate the GitHub CLI with read access to all nine public repositories and run `npm run sync:coverage`. The sync fails explicitly for inaccessible sources, API/fetch errors, truncated trees, malformed source metadata, or repository/file/byte safety limits; it does not use cached success data. The output is written only after every source inventory succeeds. The browser requests the same-origin versioned index without a cache and reports errors rather than falling back to stale coverage. When changing mappings, verify the exact source value and a current authoritative reference; document both scenario relevance and limitations. Do not treat source files, names, repository counts, ATT&CK identifiers, or unexecuted scripts as coverage evidence.

This explorer does not upload files or send data to a backend. Its source index contains only public repository files and reviewed setting values. Preserve the existing licensing disclaimer and verify licensing and platform prerequisites against current Microsoft documentation.
