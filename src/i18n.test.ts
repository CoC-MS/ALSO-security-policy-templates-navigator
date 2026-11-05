import { describe, expect, it } from "vitest";
import { coreTranslationKeys, getLocaleFromPath, getLocalePath, translate, translateFormat, type Locale } from "./i18n";
import { additionalTranslationKeys } from "./additionalTranslations";
import {
  getAdministratorProtectionLicenseNote,
  getConditionalAccessCategoryLicenseNote,
  getDataSecurityLicenseNote,
  getEndpointFeatureLicenseNote,
  getOnPremisesAppLicenseNote,
  getSecurityGoalOptions,
  securityGoalNavigation,
  securityGoals,
} from "./solutionCatalog";
import { getCloudAppsConditionalAccessLicenseNote, getLimitedExperienceNoteForLicenses, getWindowsServerLicenseNotes, licenses, platforms } from "./catalog";
import { getReadinessGuidance } from "./ReadinessRecommendation";
import repositoryMetadata from "../public/repository-metadata.json";

const baseUrl = "/ALSO-security-policy-templates-navigator/";

describe("reviewed German wording", () => {
  it("uses the supplied goal, template, app and KI wording", () => {
    expect(translate("de", "What security challenges are you trying to solve?"))
      .toBe("Welche Sicherheitsziele möchten Sie erreichen?");
    expect(translate("de", "Find policy templates that help protect against common identity and device attacks."))
      .toBe("Sicherheitsrichtlinienvorlagen zum Schutz vor häufigen Identitäts- und Geräteangriffen.");
    expect(translate("de", "Find policies for the types of apps your customer uses."))
      .toBe("Finden Sie Richtlinien für die von Ihrem Kunden eingesetzten Apps.");
    expect(translate("de", "Which types of apps do you want to protect?"))
      .toBe("Welche eingesetzten Apps möchten Sie schützen?");
    expect(translate("de", "AI and Agent Security")).toBe("KI- und Agentensicherheit");
    expect(translate("de", "AI Security Windows 11")).toBe("KI-Sicherheit Windows 11");
    expect(translate("de", "AI Security macOS")).toBe("KI-Sicherheit macOS");
  });

  it("keeps Conditional Access and KI wording consistent across categories and licensing guidance", () => {
    const sources = new Set(additionalTranslationKeys);
    for (const goal of [...securityGoalNavigation, ...securityGoals]) {
      sources.add(goal.name);
      sources.add(goal.description);
    }
    for (const goal of securityGoals) {
      sources.add(goal.prompt);
      for (const option of getSecurityGoalOptions(goal.id)) {
        sources.add(option.name);
        sources.add(option.description);
      }
    }
    for (const platform of platforms) {
      sources.add(platform.name);
      sources.add(platform.description);
      for (const license of licenses.filter(item => item.eligible)) {
        const note = getLimitedExperienceNoteForLicenses([license.id], platform.id);
        if (note) {
          sources.add(note.title);
          sources.add(note.message);
        }
      }
    }
    for (const source of sources) {
      expect(translate("de", source), source)
        .not.toMatch(/bedingte[nrsm]?(?:n)? Zugriff|Sicherheitsvorlagen|App-Typen|\bAI(?: Security|-Security| environments| agents)/i);
    }
  });

  it("keeps customer guidance singular and uses the supplied license selection wording", () => {
    const selection = translate("de", "Select each license plan and enter the number of licenses available. Next, choose the security challenges your customer wants to solve to find relevant ALSO security policy templates.");
    expect(selection).toContain("Wählen Sie die vorhandenen Lizenzpläne aus");
    expect(selection).toContain("Ihres Kunden");
    const introduction = translate("de", "Grab a coffee, pick templates, import them into your lab, test them, tweak them, and make them your own. Build the security baseline that works for your customers.");
    expect(introduction).toContain("zu Ihrem Kunden passt");
    expect(introduction).not.toContain("Ihren Kunden");
  });

  it("uses Repositories consistently and balances the deployment description", () => {
    expect(translate("de", "Browse all repositories directly.")).toBe("Alle Repositories direkt durchsuchen.");
    expect(translate("de", "repositories")).toBe("Repositories");
    for (const repository of repositoryMetadata.repositories) {
      const description = translate("de", repository.description.trim());
      expect(description).not.toContain("Bereitstellungen und Umsetzung");
    }
  });

  it("keeps server product names consistent with licensing guidance", () => {
    for (const platform of platforms.filter(item => ["windows-servers", "linux-server", "linux-desktop"].includes(item.id))) {
      const description = translate("de", platform.description);
      expect(description).toContain("Microsoft Defender for Servers");
      expect(description).toContain("Microsoft Defender for Business servers");
      expect(description).toContain("Microsoft Defender for Endpoint Server");
      expect(description).not.toMatch(/Endpoint for Servers|Defender for Business-Servern/);
    }
  });
});

describe("localized routes", () => {
  it.each([
    [baseUrl, "en"],
    [`${baseUrl}de`, "de"],
    [`${baseUrl}fr/`, "fr"],
    [`${baseUrl}es`, "es"],
    [`${baseUrl}ru`, "ru"],
    [`${baseUrl}it/`, "it"],
    [`${baseUrl}pl`, "pl"],
  ] as const)("resolves %s to %s", (path, expectedLocale) => {
    expect(getLocaleFromPath(path, baseUrl)).toBe(expectedLocale);
  });

  describe("translated feature parity", () => {
    it.each(["de", "fr", "es", "ru", "it", "pl"] as const)("translates every goal and nested option description in %s", locale => {
      for (const goal of securityGoalNavigation) {
        expect(translate(locale, goal.name), goal.name).not.toBe(goal.name);
        expect(translate(locale, goal.description), goal.description).not.toBe(goal.description);
      }
      for (const goal of securityGoals) {
        expect(translate(locale, goal.prompt), goal.prompt).not.toBe(goal.prompt);
        if (locale === "pl") expect(translate(locale, goal.name), goal.name).not.toBe(goal.name);
        for (const option of getSecurityGoalOptions(goal.id)) {
          expect(translate(locale, option.description), option.description).not.toBe(option.description);
          if (locale === "pl" && ![
            "Windows", "Windows Server", "macOS", "Linux", "Linux Desktop", "Linux Server",
            "Android", "iOS", "iOS/iPadOS", "Windows Servers",
          ].includes(option.name)) {
            expect(translate(locale, option.name), option.name).not.toBe(option.name);
          }
        }
      }
    });

    it.each(["de", "fr", "es", "ru", "it", "pl"] as const)("preserves mixed-plan counts and translates readiness guidance in %s", locale => {
      for (const goalId of ["security-fundamentals", "copilot-readiness"] as const) {
        const guidance = getReadinessGuidance(goalId, ["e5", "business-premium"], { e5: 1, "business-premium": 100 })!;
        const translated = translate(locale, guidance.message);
        expect(translated).toContain("1");
        expect(translated).toContain("Microsoft 365 E5");
        expect(translated).toContain("100");
        expect(translated).toContain("Microsoft 365 Business Premium");
        expect(translated).not.toContain("Coverage applies only");
        expect(translated).not.toContain("full Security fundamentals experience");
        expect(translated).not.toContain("Defender Suite unlocks");
        expect(translated).not.toContain("Purview Suite unlocks");
        expect(translated).not.toContain("It can be purchased");
        expect(translated).not.toContain("only core SharePoint");
      }
    });

    it.each(["de", "fr", "es", "ru", "it", "pl"] as const)("translates repository descriptions and licensing sentences in %s", locale => {
      const messages = new Set<string>();
      for (const repository of repositoryMetadata.repositories) messages.add(repository.description.trim());
      for (const platform of platforms) messages.add(platform.description);
      for (const license of licenses.filter(item => item.eligible)) {
        const ids = [license.id];
        for (const platform of platforms) {
          const note = getLimitedExperienceNoteForLicenses(ids, platform.id);
          if (note) messages.add(note.message);
          if (platform.id === "windows-servers" || platform.id === "linux-server") {
            for (const note of getWindowsServerLicenseNotes(ids, platform.id)) messages.add(note);
          }
          for (const feature of ["intune", "defender"] as const) {
            const note = getEndpointFeatureLicenseNote(feature, ids, platform.id);
            if (note) messages.add(note);
          }
          const adminNote = getAdministratorProtectionLicenseNote(ids, platform.id);
          if (adminNote) messages.add(adminNote.message);
        }
        for (const option of getSecurityGoalOptions("conditional-access")) {
          const note = getConditionalAccessCategoryLicenseNote([option.id], ids);
          if (note) messages.add(note.message);
        }
        for (const option of getSecurityGoalOptions("data-protection")) {
          const note = getDataSecurityLicenseNote(ids, [option.id]);
          if (note) messages.add(note);
        }
        for (const note of [getCloudAppsConditionalAccessLicenseNote(ids), getOnPremisesAppLicenseNote(ids)]) {
          if (note) messages.add(note.message);
        }
        for (const goalId of ["security-fundamentals", "copilot-readiness"] as const) {
          const note = getReadinessGuidance(goalId, ids);
          if (note?.message) messages.add(note.message);
        }
      }
      const sentences = new Set([...messages].flatMap(message => message.split(/(?<=[.!?])\s+(?=[A-Z0-9])/)));
      const untranslated = [...sentences].filter(sentence => translate(locale, sentence) === sentence);
      expect(untranslated, untranslated.join("\n")).toEqual([]);
    });
  });

  it.each([
    ["en", baseUrl],
    ["de", `${baseUrl}de`],
    ["fr", `${baseUrl}fr`],
    ["es", `${baseUrl}es`],
    ["ru", `${baseUrl}ru`],
    ["it", `${baseUrl}it`],
    ["pl", `${baseUrl}pl`],
  ] as const)("builds the canonical route for %s", (locale, expectedPath) => {
    expect(getLocalePath(locale, baseUrl)).toBe(expectedPath);
  });

  it("translates copy while preserving English on the root route", () => {
    const source = "What security challenges are you trying to solve?";
    expect(translate("en", source)).toBe(source);
    expect(translate("de", source)).toBe("Welche Sicherheitsziele möchten Sie erreichen?");
    expect(translate("fr", source)).toBe("Quels défis de sécurité souhaitez-vous relever ?");
    expect(translate("es", source)).toBe("¿Qué desafíos de seguridad quiere resolver?");
    expect(translate("ru", source)).toBe("Какие задачи безопасности вы хотите решить?");
    expect(translate("it", source)).toBe("Quali sfide di sicurezza vuoi affrontare?");
    expect(translate("pl", source)).toBe("Jakie problemy związane z bezpieczeństwem chcesz rozwiązać?");
  });

  it("uses the requested Russian terms for Conditional Access and scripts", () => {
    expect(translate("ru", "Conditional Access")).toBe("Условный доступ");
    expect(translate("ru", "Conditional Access policies")).toBe("Политики условного доступа");
    expect(translate("ru", "Recommended Conditional Access policies:")).toBe("Рекомендуемые политики условного доступа:");
    expect(translate("ru", "Scripts")).toBe("Скрипты");
    expect(translate("ru", "Remediation Scripts")).toBe("Скрипты исправления");
    expect(translate("ru", "Explore attack scenarios and their mapped ALSO Microsoft Security policy templates."))
      .toBe("Изучите сценарии атак и сопоставленные с ними шаблоны политик безопасности ALSO Microsoft.");
  });

  it("uses the reviewed Conditional Access and device compliance terminology", () => {
    const expected: Record<Exclude<Locale, "en">, [string, string]> = {
      de: ["Conditional Access", "Gerätekompatibilitätsrichtlinien"],
      fr: ["Accès conditionnel", "Stratégies de conformité d’appareils"],
      es: ["Acceso condicional", "Directivas de cumplimiento de dispositivos"],
      it: ["Accesso condizionale", "Criteri di conformità dei dispositivi"],
      ru: ["Условный доступ", "Политики соответствия устройств требованиям"],
      pl: ["Dostęp warunkowy", "Polityki zgodności urządzeń końcowych"],
    };
    for (const [locale, [conditionalAccess, deviceCompliance]] of Object.entries(expected) as
      [Exclude<Locale, "en">, [string, string]][]) {
      expect(translate(locale, "Conditional Access")).toBe(conditionalAccess);
      expect(translate(locale, "Endpoint compliance policies")).toBe(deviceCompliance);
    }
  });

  it("uses Microsoft Learn ASR and Intune remediation terminology", () => {
    expect(translate("de", "Attack Surface Reduction (ASR)")).toBe("Reduzierung der Angriffsfläche (ASR)");
    expect(translate("ru", "Attack Surface Reduction (ASR)")).toBe("Уменьшение поверхности атаки (ASR)");
    expect(translate("de", "Remediation Scripts")).toBe("Skripts für Korrekturen");
    expect(translate("ru", "Remediation Scripts")).toBe("Скрипты исправления");
  });

  it("uses Polish Microsoft terminology and accurate license-count forms", () => {
    expect(translate("pl", "Conditional Access")).toBe("Dostęp warunkowy");
    expect(translate("pl", "Conditional Access policies")).toBe("Polityki dostępu warunkowego");
    expect(translate("pl", "Endpoint compliance policies")).toBe("Polityki zgodności urządzeń końcowych");
    expect(translate("pl", "Endpoint protection")).toBe("Ochrona urządzeń końcowych");
    expect(translate("pl", "Copilot Readiness")).toBe("Gotowość do wdrożenia rozwiązania Copilot");
    expect(translate("pl", "Explore Copilot Readiness")).toBe("Poznaj zagadnienia związane z gotowością do wdrożenia rozwiązania Copilot");
    expect(translate("pl", "The selected Microsoft 365 F3 base licensing provides limited endpoint protection experience."))
      .toBe("Wybrana licencja podstawowa Microsoft 365 F3 zapewnia ograniczony zakres funkcji ochrony urządzeń końcowych.");
    expect(translate("pl", "add Microsoft 365 E5 for full Copilot Readiness experience."))
      .toBe("dodaj Microsoft 365 E5, aby uzyskać pełny zakres funkcji związanych z gotowością do wdrożenia rozwiązania Copilot.");
    expect(translate("pl", "Scripts")).toBe("Skrypty");
    expect(translate("pl", "Remediation Scripts")).toBe("Skrypty korygujące");
    expect(translate("pl", "Settings catalog")).toBe("Katalog ustawień");
    expect(translate("pl", "App protection policies")).toBe("Zasady ochrony aplikacji");
    expect(translate("pl", "Update rings")).toBe("Pierścienie aktualizacji");
    expect(translate("pl", "Filters")).toBe("Filtry");
    expect(translate("pl", "Attack Surface Reduction (ASR)")).toBe("Redukcja powierzchni ataku (ASR)");
    expect(translate("pl", "Data Loss Prevention (DLP)")).toBe("Ochrona przed utratą danych (DLP)");
    expect(translate("pl", "Sensitivity labels")).toBe("Etykiety poufności");
    expect(translate("pl", "Retention")).toBe("Zasady przechowywania");
    expect(translate("pl", "Access reviews")).toBe("Przeglądy dostępu");
    expect(translate("pl", "Privileged Identity Management (PIM)")).toBe("Privileged Identity Management (PIM)");
    expect(translateFormat("pl", "Continue with {count} license plans ({seats} seats) →", { count: 2, seats: 1 }))
      .toBe("Kontynuuj: 2 plany licencyjne (1 licencja) →");
    expect(translateFormat("pl", "Continue with {count} license plans ({seats} seats) →", { count: 5, seats: 22 }))
      .toBe("Kontynuuj: 5 planów licencyjnych (22 licencje) →");
    expect(translate("pl", "Continue with 3 security goals"))
      .toBe("Kontynuuj: 3 cele związane z bezpieczeństwem");
    expect(translate("pl", "Continue with 12 security goals"))
      .toBe("Kontynuuj: 12 celów związanych z bezpieczeństwem");
  });

  it("uses the documented French Purview DLP feature name", () => {
    expect(translate("fr", "Data Loss Prevention (DLP)")).toBe("Protection contre la perte de données (DLP)");
    expect(translate("fr", "Endpoint Data Loss Prevention (eDLP)"))
      .toBe("Protection contre la perte de données sur les terminaux (eDLP)");
  });

  it.each(["ru", "it"] as const)("translates all shared feature strings in %s", locale => {
    const untranslated = additionalTranslationKeys.filter((source) => {
      if (source.includes("{") || (locale === "it" && ["Firewall", "Antivirus (AV)"].includes(source))) return false;
      return translate(locale, source) === source;
    });
    expect(untranslated.slice(0, 5), untranslated.slice(0, 5).join("\n")).toEqual([]);
  });

  it.each(["ru", "it"] as const)("translates generated placeholder strings in %s", locale => {
    const samples: Record<string, string> = {
      value: "Microsoft 365 E5",
      detail: "Defender",
      name: "Repository",
      count: "3",
      seats: "12",
    };
    const untranslated = additionalTranslationKeys
      .filter(source => source.includes("{"))
      .map(source => source.replace(/\{([^}]+)\}/g, (_match, key: string) => samples[key] ?? "sample"))
      .filter(source => translate(locale, source) === source);
    expect(untranslated.slice(0, 10), untranslated.slice(0, 10).join("\n")).toEqual([]);
  });

  it("translates all shared feature strings and generated placeholders in Polish", () => {
    expect(translate("pl", "1 Microsoft 365 E5 license: full Security fundamentals experience is covered for this plan."))
      .toBe("Plan Microsoft 365 E5 obejmuje pełny zakres funkcji dotyczących podstaw bezpieczeństwa.");
    const samples: Record<string, string> = {
      value: "Microsoft 365 E5",
      detail: "Defender",
      name: "Repository",
      count: "3",
      seats: "12",
    };
    const untranslated = [...coreTranslationKeys, ...additionalTranslationKeys]
      .filter(source => !source.includes("{"))
      .filter(source => source !== "Purview")
      .filter(source => translate("pl", source) === source);
    const untranslatedPlaceholders = [...coreTranslationKeys, ...additionalTranslationKeys]
      .filter(source => source !== "Purview")
      .filter(source => source.includes("{"))
      .map(source => source.replace(/\{([^}]+)\}/g, (_match, key: string) => samples[key] ?? "sample"))
      .filter(source => translate("pl", source) === source);
    const uncovered = [...untranslated, ...untranslatedPlaceholders];
    expect(uncovered.length, uncovered.slice(0, 25).join("\n")).toBe(0);
  });
});
