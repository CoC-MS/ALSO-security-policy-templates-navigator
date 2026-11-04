# ALSO Microsoft Security Policy Templates Navigator  

An interactive guide that combines a customer's Microsoft 365 licenses to identify every ALSO security policy template repository that meets their prerequisites.

**Disclaimer:** Licensing prerequisites and feature availability listed on this page may be incorrect, incomplete, or outdated. We strongly recommend verifying all licensing information against the latest official Microsoft licensing documentation before making any purchasing or deployment decisions.

Enterprise licenses: [Microsoft Enterprise Plan Comparison](https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/bade/documents/products-and-services/en-us/education/Modern-Work-Plan-Comparison-Enterprise.pdf)

SMB licenses: [Microsoft SMB Plan Comparison](https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/bade/documents/products-and-services/en-us/education/Modern-Work-Plan-Comparison-SMB.pdf)

**Live site:** https://coc-ms.github.io/ALSO-security-policy-templates-navigator/

## Local translation review

Run `npm run dev` and open the URL printed by Vite. English uses the base URL;
German, French, Spanish, Russian, Italian, and Polish use the same base followed
by `de`, `fr`, `es`, `ru`, `it`, and `pl`.
The language selector preserves the current selections. All languages share the
same security goals, nested policy categories, and licensing logic.

Home returns to license selection in the current language; View all policies
opens the repository catalog. Report problem opens GitHub's issue chooser in
the current tab and requires a GitHub sign-in.
Localized disclaimer links open Microsoft's corresponding German, French, or
Spanish plan comparison pages. Russian comparison links use Microsoft's Russian
Enterprise and business pricing pages with `market=kz`. Italian links directly to
the existing English PDFs and labels them as English. Detailed PDFs for other non-English
locales are also explicitly labeled as English references.
Polish comparison links use Microsoft's localized Enterprise and business plan
comparison pages; the linked detailed PDFs remain clearly labeled as English.

Attack Prevention and Fundamentals/Copilot Readiness recommendation buttons keep
the selected language when opening their companion sites. During loopback Vite
development they open the corresponding local previews on ports 5182 and 5183.
Production builds always use the existing public site URLs with the selected
locale (`de/`, `fr/`, `es/`, `ru/`, `it/`, or `pl/`) appended; English keeps its
original URL.

## Security fundamentals and Copilot Readiness

Both sections link to the [ALSO Security Fundamentals and Copilot Readiness site](https://coc-ms.github.io/ALSO-Microsoft-Security-Fundamentals-and-Copilot-Readiness/) and use the standard experience badges, licensing disclaimer, and Enterprise/SMB comparison sheets. Both goals and Attack prevention carry New badges.

Security fundamentals is Full for E5, E7, or combined Defender and Purview Suite entitlements. Copilot Readiness is Limited for all eligible selections: all need SharePoint Advanced Management, with missing Defender or Purview Suites recommended as applicable. Add-on names follow the selected BP/E3 or F1/F3 FLW plans. Basic and Standard remain inapplicable.

The SharePoint Advanced Management upgrade note explains that E5 and E7 include only core features and require a separate SharePoint Advanced Management license for the full experience. Every limited-experience note describes the full reporting experience for SharePoint sites and OneDrive and lists add-on availability only for the selected base plans, without repeating suite variants. Missing-suite guidance covers Purview advanced classifiers and Insider Risk Management, and Defender PIM, Access Reviews, risky sign-in and risky user policies, Identity Protection, Defender for Identity, and Defender for Cloud Apps. The notes do not recommend a Copilot license.

Repository, repository licensing-guide, and mapped-policy links allow origin-only referrals using `strict-origin-when-cross-origin`, while retaining `noopener`. GitHub may show `coc-ms.github.io` in each destination repository's **Insights > Traffic > Referring sites**; page paths and query parameters are not shared. Reporting depends on GitHub and visitors' browser privacy settings. Other external links continue to suppress referrals.
