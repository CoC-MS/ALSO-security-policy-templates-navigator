# ALSO Microsoft Security Policy Templates Navigator  

An interactive guide that combines a customer's Microsoft 365 licenses to identify every ALSO security policy template repository that meets their prerequisites.

Attack protection is available as a **Public preview**. Its coverage explorer shows reviewed policy-library evidence, not a customer environment assessment or proof of deployed protection.

**Disclaimer:** Licensing prerequisites and feature availability listed on this page may be incorrect, incomplete, or outdated. We strongly recommend verifying all licensing information against the latest official Microsoft licensing documentation before making any purchasing or deployment decisions.

Enterprise licenses: [Microsoft Enterprise Plan Comparison](https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/bade/documents/products-and-services/en-us/education/Modern-Work-Plan-Comparison-Enterprise.pdf)

SMB licenses: [Microsoft SMB Plan Comparison](https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/bade/documents/products-and-services/en-us/education/Modern-Work-Plan-Comparison-Enterprise.pdf)

**Live site:** https://coc-ms.github.io/ALSO-security-policy-templates-navigator/

## Threat-informed policy coverage

The Attack protection explorer is part of the existing **Attack protection** section, marked **Public preview** and available for evaluation. The explorer does not add a separate navigation item.

The public view is a simple **Overview**: choose an attack scenario and see policy names linking directly to their repository files. Duplicate references to the same file are shown once. Technical evidence, attack steps, inventories, scores, and extra filters are not displayed. Mappings use the user-supplied *ALSO Microsoft Security Attack Prevention Quick Tips* as guidance, validated against actual repository settings; recommendations requiring manual setup or unavailable templates are not invented.

The six scenarios are AiTM phishing, device-code phishing, infostealer, ClickFix, LLMjacking, and cryptojacking. This is not a customer tenant assessment or proof of deployed protection. A template may be disabled, have exclusions, require licensing or platform prerequisites, and need review before deployment. Only policies with verified mapping evidence are linked; an empty scenario says that no matching policies have been mapped yet.

The scheduled Pages workflow refreshes `public/attack-policy-coverage.v1.json` from the nine repositories listed in `scripts/sync-attack-coverage.mjs`. The versioned index retains source commits, file hashes, classifications, duplicate references, and evidence for maintainers. Mapping selectors identify exact setting values, which must still match the current source. Changed, deleted, ambiguous, or malformed mapped evidence is excluded from the public policy list. Internal ATT&CK references describe behavioral context, not a mitigation assertion.

To refresh locally, authenticate the GitHub CLI with read access to all nine public repositories and run `npm run sync:coverage`. The sync fails explicitly for inaccessible sources, API/fetch errors, truncated trees, malformed source metadata, or repository/file/byte safety limits; it does not use cached success data. The output is written only after every source inventory succeeds. The browser requests the same-origin versioned index without a cache and reports errors rather than falling back to stale coverage. When changing mappings, verify the exact source value and a current authoritative reference; document both scenario relevance and limitations. Do not treat source files, names, repository counts, ATT&CK identifiers, or unexecuted scripts as coverage evidence.

This explorer does not upload files or send data to a backend. Its source index contains only public repository files and reviewed setting values. Preserve the existing licensing disclaimer and verify licensing and platform prerequisites against current Microsoft documentation.
