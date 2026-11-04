# ALSO Microsoft Security Policy Templates Navigator  

An interactive guide that combines a customer's Microsoft 365 licenses to identify every ALSO security policy template repository that meets their prerequisites.

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
Spanish plan comparison pages. Verified Russian and Italian comparison
destinations are not available, so those locales link directly to the existing
English PDFs and label them as English. Detailed PDFs for other non-English
locales are also explicitly labeled as English references.
Polish comparison links use Microsoft's localized Enterprise and business plan
comparison pages; the linked detailed PDFs remain clearly labeled as English.

Attack Prevention and Fundamentals/Copilot Readiness recommendation buttons keep
the selected language when opening their companion sites. During loopback Vite
development they open the corresponding local previews on ports 5182 and 5183.
Production builds always use the existing public site URLs with the selected
locale (`de/`, `fr/`, `es/`, `ru/`, `it/`, or `pl/`) appended; English keeps its
original URL.
