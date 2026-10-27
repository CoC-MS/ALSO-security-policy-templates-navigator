import { describe, expect, it } from "vitest";
import { getWindowsServerLicenseNotes, isPlatformAvailableForLicenses, licenses } from "./catalog";
import {
  getDataSecurityLicenseNote,
  getConditionalAccessCategoryLicenseNote,
  getOnPremisesAppLicenseNote,
  getDesktopAppLicenseNote,
  getLicensingPrerequisiteTitle,
  getLimitedExperienceSelections,
  getAdministratorProtectionLicenseNote,
  getEndpointFeatureLicenseNote,
  getRecommendedPolicyIds,
  getSecurityGoalOptions,
  getSecurityGoalOptionExperience,
  isSecurityGoalOptionAvailable,
  getSolutionPlatformIds,
  securityGoals,
  securityGoalNavigation,
  identityAndAccessGoalIds,
  toggleSecurityGoalSelection,
} from "./solutionCatalog";

describe("security goal recommendations", () => {
  it.each(licenses.filter((license) => license.eligible).map((license) => license.id))(
    "shows limited Sensitivity labels with scoped guidance for %s",
    (id) => {
      expect(getSecurityGoalOptionExperience(
        "data-protection", [id], ["purview"], "sensitivity-labels",
      )).toBe("limited");
      const note = getDataSecurityLicenseNote([id], ["sensitivity-labels"]);
      expect(note).toContain("Sensitivity labels:");
      expect(note).not.toMatch(/DLP|retention|auto.labell|SIT/);
    },
  );

  it.each(["business-premium", "business-premium-defender", "f1", "f1-defender"] as const)(
    "includes only Microsoft 365 app sensitivity labeling for %s",
    (id) => {
      const note = getDataSecurityLicenseNote([id], ["sensitivity-labels"]);
      expect(note).toContain("Only manual, default, and mandatory sensitivity labeling in Microsoft 365 apps are included.");
      expect(note).not.toContain("containers");
    },
  );

  it.each(["e3", "e3-defender", "f3", "f3-defender"] as const)(
    "also includes Microsoft 365 container sensitivity labeling for %s",
    (id) => {
      expect(getDataSecurityLicenseNote([id], ["sensitivity-labels"]))
        .toContain("Only manual, default, and mandatory sensitivity labeling in Microsoft 365 apps, plus sensitivity labeling for containers in Microsoft 365, are included.");
    },
  );

  it.each(["business-premium", "business-premium-defender", "e3", "e3-defender", "f1", "f1-defender", "f3", "f3-defender"] as const)(
    "lists the matching Purview upgrade and all advanced sensitivity-label features for %s",
    (id) => {
      const note = getDataSecurityLicenseNote([id], ["sensitivity-labels"]);
      const suite = id.startsWith("business-premium")
        ? "Microsoft Purview Suite for Business Premium"
        : id.startsWith("e3")
          ? "Microsoft Purview Suite for Microsoft 365 E3"
          : "Microsoft Purview Suite FLW for Microsoft 365 F1/F3";
      expect(note).toContain(`Add ${suite} to unlock`);
      for (const feature of [
        "automatic sensitivity labeling in Microsoft 365 apps",
        "manual sensitivity labeling for Teams online meetings",
        "automatic sensitivity labels in Exchange, SharePoint, and OneDrive",
        "default sensitivity labels for SharePoint document libraries",
        "Trainable Classifiers", "Exact Data Match (EDM)", "Named Entities", "contextual classifiers",
      ]) {
        expect(note).toContain(feature);
      }
    },
  );

  it.each(["business-premium-purview", "e3-purview", "f1-purview", "f3-purview", "e5", "e7"] as const)(
    "does not recommend a redundant sensitivity-label upgrade for %s",
    (id) => {
      expect(getDataSecurityLicenseNote([id], ["sensitivity-labels"])).not.toContain("Add ");
    },
  );

  it.each(["business-premium", "business-premium-defender", "e3", "e3-defender"] as const)(
    "lists the exact included and upgrade-required DLP and retention features for %s",
    (id) => {
      const dlp = getDataSecurityLicenseNote([id], ["dlp"]);
      expect(dlp).toContain("DLP for emails and files is included");
      expect(dlp).toContain("to unlock DLP for Teams chat");
      expect(dlp).toContain(id.startsWith("business-premium")
        ? "Microsoft Purview Suite for Business Premium"
        : "Microsoft Purview Suite for Microsoft 365 E3");
      const retention = getDataSecurityLicenseNote([id], ["retention"]);
      expect(retention).toContain("Manual retention labels, basic organization-wide or location-wide retention policies, and Teams message retention policies are included");
      expect(retention).toContain("rules-based automatic retention policies, machine-learning-based retention, and Records Management");
      expect(retention).not.toMatch(/DLP|auto.labell|SIT/i);
    },
  );

  it.each(["f1", "f1-defender", "f3", "f3-defender"] as const)(
    "requires Purview Suite for frontline DLP and advanced retention for %s",
    (id) => {
      expect(getDataSecurityLicenseNote([id], ["dlp"]))
        .toContain("No DLP features are included");
      expect(getDataSecurityLicenseNote([id], ["dlp"]))
        .toContain("Microsoft Purview Suite FLW");
      const retention = getDataSecurityLicenseNote([id], ["retention"]);
      expect(retention).toContain("Manual retention labels and Teams message retention policies are included");
      expect(retention).toContain("All other retention capabilities");
      expect(retention).toContain("require Microsoft Purview Suite FLW");
      for (const category of ["dlp", "retention", "endpoint-dlp", "auto-labeling"]) {
        expect(isSecurityGoalOptionAvailable("data-protection", category, [id])).toBe(true);
        expect(getSecurityGoalOptionExperience("data-protection", [id], ["purview"], category))
          .toBe("limited");
      }
    },
  );

  it.each(["business-premium", "e3", "f1", "f3"] as const)(
    "requires only the matching Purview upgrade for eDLP and auto labelling for %s",
    (id) => {
      const endpoint = getDataSecurityLicenseNote([id], ["endpoint-dlp"]);
      const auto = getDataSecurityLicenseNote([id], ["auto-labeling"]);
      expect(endpoint).toContain("not included with the selected base licenses");
      expect(auto).toContain("not included with the selected base licenses");
      expect(endpoint).toContain("Add Microsoft Purview Suite");
      expect(auto).toContain("Add Microsoft Purview Suite");
      expect(endpoint).not.toContain("Defender");
      expect(auto).not.toMatch(/DLP|retention|sensitive information types/i);
    },
  );

  it.each(["e3-purview", "business-premium-purview", "f1-purview", "f3-purview", "f1-defender-purview", "f3-defender-purview", "e5", "e7"] as const)(
    "removes all covered feature upgrade notes for %s",
    (id) => {
      for (const category of ["dlp", "retention", "endpoint-dlp", "auto-labeling"]) {
        expect(getSecurityGoalOptionExperience("data-protection", [id], ["purview"], category))
          .toBe("full");
        expect(getDataSecurityLicenseNote([id], [category])).toBeUndefined();
        expect(isSecurityGoalOptionAvailable("data-protection", category, [id])).toBe(true);
      }
      expect(getDataSecurityLicenseNote(["f1", id], ["dlp"])).toBeUndefined();
    },
  );

  it.each(["business-premium", "e3", "f3", "f3-purview"] as const)(
    "never mentions unselected Data Security categories for %s",
    (licenseId) => {
      const categoryTerms = [
        ["dlp", /Endpoint|eDLP|auto.labell|retention|sensitive information types|sensitivity labels/i],
        ["sensitive-information-types", /DLP|auto.labell|retention|sensitivity labels/i],
        ["auto-labeling", /DLP|retention|sensitive information types|sensitivity labels/i],
        ["retention", /DLP|auto.labell|sensitive information types|sensitivity labels/i],
      ] as const;
      for (const [id, unrelated] of categoryTerms) {
        const note = getDataSecurityLicenseNote([licenseId], [id]);
        if (note) expect(note).not.toMatch(unrelated);
      }
    },
  );

  it.each(["business-premium", "e3", "f3"] as const)(
    "scopes Data Security limitation details to selected categories for %s",
    (licenseId) => {
      for (const option of getSecurityGoalOptions("data-protection")) {
        const note = getDataSecurityLicenseNote([licenseId], [option.id]);
        expect(note).toContain(`${option.name}:`);
        expect(note).not.toContain("undefined");
        if (option.id === "sensitive-information-types") {
          expect(note).toContain("table does not specify");
        }
      }
    },
  );

  it("preserves full and unavailable Data Security selections without extra category claims", () => {
    expect(getDataSecurityLicenseNote(["e5"], ["dlp"])).toBeUndefined();
    expect(getDataSecurityLicenseNote(["business-premium"], ["sensitivity-labels"])).toContain("Only manual");
    expect(getDataSecurityLicenseNote(["e3"], [])).toBeUndefined();
    expect(getDataSecurityLicenseNote(["f3-purview"], ["dlp"])).toBeUndefined();
    expect(getDataSecurityLicenseNote(["business-premium"], ["endpoint-dlp"]))
      .toContain("Add Microsoft Purview Suite for Business Premium");
  });

  it("locks only Attack protection as Coming and links its new repository", () => {
    expect(securityGoalNavigation.filter((goal) =>
      "comingSoon" in goal && goal.comingSoon,
    ).map((goal) => goal.id)).toEqual(["attack-protection"]);
    expect(securityGoalNavigation[0].repositoryUrl).toBe(
      "https://github.com/CoC-MS/CoC-MS-ALSO-Microsoft-Security-AttackPrevention",
    );
    expect(getSecurityGoalOptions("attack-protection").length).toBeGreaterThan(0);
  });

  it("groups the unchanged Conditional Access and Administrator protection goals under Identity and Access", () => {
    expect(securityGoalNavigation.map((goal) => goal.name)).toEqual([
      "Attack protection", "Identity and Access", "Endpoint protection",
      "AI and Agent Security", "Data Security", "App protection",
    ]);
    expect(identityAndAccessGoalIds).toEqual(["conditional-access", "administrator-protection"]);
    expect(getSecurityGoalOptions("conditional-access").map((option) => option.id)).toEqual([
      "administrator-policies", "internal-user-policies", "service-account-policies",
      "agent-policies", "guest-user-policies", "global-secure-access-policies",
      "service-principal-policies",
    ]);
    expect(getSecurityGoalOptions("administrator-protection")[0].autoSelect).toBe(true);
  });

  const selections = securityGoals.flatMap((goal) =>
    getSecurityGoalOptions(goal.id).map((option) => ({ ...option, goalId: goal.id })),
  );

  it.each(licenses.filter((license) => license.eligible).map((license) => license.id))(
    "only includes limited categories in prerequisite guidance for %s",
    (licenseId) => {
      for (const option of selections) {
        for (const platformId of option.platformIds) {
          const limited = getLimitedExperienceSelections([option], [licenseId], platformId);
          const experience = getSecurityGoalOptionExperience(
            option.goalId, [licenseId], [platformId], option.id,
          );
          expect(limited).toEqual(!option.children?.length && experience === "limited" ? [option] : []);
        }
      }
    },
  );

  it("includes limited Sensitivity labels alongside other limited Data Security categories", () => {
    const data = selections.filter((option) => option.goalId === "data-protection");
    for (const licenseId of ["business-premium", "e3", "f1", "f3"] as const) {
      const limited = getLimitedExperienceSelections(data, [licenseId], "purview");
      expect(limited.some((option) => option.id === "sensitivity-labels")).toBe(true);
      expect(limited.some((option) => option.id === "auto-labeling")).toBe(true);
    }
    for (const id of ["e5", "e7"] as const) {
      expect(getLimitedExperienceSelections(data, [id], "purview").map((option) => option.id))
        .toEqual(["sensitivity-labels"]);
    }
  });

  it("scopes prerequisite guidance to each repository and removes fully licensed selections", () => {
    const apps = selections.filter((option) =>
      option.goalId === "app-protection" &&
      (option.id === "mobile-apps" || option.id === "desktop-apps"),
    );
    expect(getLimitedExperienceSelections(apps, ["business-premium"], "macos")).toEqual([]);
    expect(getLimitedExperienceSelections(apps, ["business-premium"], "windows-11")
      .map((option) => option.id)).toEqual(["desktop-apps"]);
    expect(getLimitedExperienceSelections(apps, ["e3", "e7"], "windows-11")).toEqual([]);
    const ca = selections.filter((option) =>
      option.goalId === "conditional-access" && !option.comingSoon,
    );
    expect(getLimitedExperienceSelections(ca, ["e5"], "conditional-access")
      .map((option) => option.id)).toEqual(["agent-policies"]);
    expect(getLimitedExperienceSelections(ca, ["e7"], "conditional-access")).toEqual([]);
  });

  it("does not treat endpoint platform navigation as a limited policy selection", () => {
    const endpoint = selections.filter((option) => option.goalId === "endpoint-protection");
    const windows = endpoint.filter((option) =>
      option.children?.length || option.id === "windows-encryption",
    );
    expect(getLimitedExperienceSelections(windows, ["business-premium"], "windows-11")).toEqual([]);
    const mixed = endpoint.filter((option) =>
      option.children?.length ||
      option.id === "windows-encryption" ||
      option.id === "windows-antivirus",
    );
    expect(getLimitedExperienceSelections(mixed, ["business-premium"], "windows-11")
      .map((option) => option.id)).toEqual(["windows-antivirus"]);
  });

  it("uses selected category names for licensing headings across every goal", () => {
    for (const goal of securityGoals) {
      for (const option of getSecurityGoalOptions(goal.id)) {
        expect(getLicensingPrerequisiteTitle([option.name]))
          .toBe(`${option.name} licensing prerequisites`);
      }
    }
    expect(getLicensingPrerequisiteTitle(["Retention"])).toBe("Retention licensing prerequisites");
    expect(getLicensingPrerequisiteTitle(["Retention", "Auto labelling", "Retention"]))
      .toBe("Retention, Auto labelling licensing prerequisites");
    expect(getLicensingPrerequisiteTitle([])).toBe("Selected policies licensing prerequisites");
  });

  it.each(licenses.filter((license) => license.eligible).map((license) => license.id))(
    "uses app-specific Mobile and Desktop experience for %s",
    (licenseId) => {
      expect(getSecurityGoalOptionExperience(
        "app-protection", [licenseId], ["ios-ipados", "android"], "mobile-apps",
      )).toBe("full");
      expect(getSecurityGoalOptionExperience(
        "app-protection", [licenseId], ["macos"], "desktop-apps",
      )).toBe("full");
      const expected = licenseId === "e5" || licenseId === "e7" ? "full" : "limited";
      expect(getSecurityGoalOptionExperience(
        "app-protection", [licenseId], ["windows-11"], "desktop-apps",
      )).toBe(expected);
      expect(getSecurityGoalOptionExperience(
        "app-protection", [licenseId], ["windows-11", "macos"], "desktop-apps",
      )).toBe(expected);
      expect(getDesktopAppLicenseNote([licenseId], "macos")).toBeUndefined();
      const note = getDesktopAppLicenseNote([licenseId], "windows-11");
      expect(Boolean(note)).toBe(expected === "limited");
      if (note) expect(note.message).toContain("Microsoft Intune Suite add-on");
    },
  );

  it("combines desktop app entitlements and rejects empty app licensing inputs", () => {
    expect(getDesktopAppLicenseNote(["e3", "e5"], "windows-11")).toBeUndefined();
    expect(getDesktopAppLicenseNote(["f1", "e7"], "windows-11")).toBeUndefined();
    expect(getDesktopAppLicenseNote([], "windows-11")).toBeUndefined();
    expect(getSecurityGoalOptionExperience(
      "app-protection", [], ["ios-ipados"], "mobile-apps",
    )).toBe("limited");
    expect(getSecurityGoalOptionExperience(
      "app-protection", [], ["windows-11"], "desktop-apps",
    )).toBe("limited");
  });

  it("states the correct prerequisite on every Conditional Access category", () => {
    for (const option of getSecurityGoalOptions("conditional-access")) {
      if (option.comingSoon) continue;
      const note = getConditionalAccessCategoryLicenseNote([option.id], ["e3"]);
      if (option.id === "global-secure-access-policies") {
        expect(note?.message).toContain("Internet Access or Private Access");
        expect(note?.message).not.toContain("Entra ID P2");
      } else if (option.id === "agent-policies") {
        expect(note?.message).toContain("Agent 365 license");
        expect(note?.message).not.toContain("Entra ID P2");
      } else {
        expect(note?.message).toContain("Microsoft Entra ID P2 add-on to unlock");
        expect(note?.message?.includes("PIM authentication context")).toBe(option.id === "administrator-policies");
        expect(note?.message).toContain("Microsoft Defender Suite for Microsoft 365 E3");
        expect(note?.message).not.toContain("Agent 365");
      }
    }
  });

  it("uses category-specific prerequisites on final results without unrelated Agent upselling", () => {
    const users = getConditionalAccessCategoryLicenseNote([
      "administrator-policies", "internal-user-policies", "guest-user-policies",
    ], ["e3"]);
    expect(users?.message).toContain("Microsoft Entra ID P2 add-on");
    expect(users?.includePlanComparisons).toBe(true);
    const agents = getConditionalAccessCategoryLicenseNote(["agent-policies"], ["e5"]);
    expect(agents?.message).toContain("Agent 365 license");
    expect(agents?.includePlanComparisons).toBe(true);
    const mixed = getConditionalAccessCategoryLicenseNote(["agent-policies", "internal-user-policies"], ["e3"]);
    expect(mixed?.message).toContain("Agent 365 license");
    expect(mixed?.message).toContain("Entra ID P2 add-on");
    expect(mixed?.includePlanComparisons).toBe(true);
    expect(getConditionalAccessCategoryLicenseNote(["service-principal-policies"], ["e3"])).toBeUndefined();
    expect(getConditionalAccessCategoryLicenseNote([], ["e3"])).toBeUndefined();
  });

  it.each(["business-premium", "e3", "f1", "f3"] as const)(
    "scopes Identity and Access unlock details to the selected categories for %s",
    (id) => {
      for (const category of ["administrator-policies", "internal-user-policies", "service-account-policies", "guest-user-policies"]) {
        const note = getConditionalAccessCategoryLicenseNote([category], [id]);
        expect(note?.message).toContain("Entra ID P2 add-on to unlock");
        expect(note?.message).toContain("risky sign-in policies");
        expect(note?.message?.includes("PIM authentication context")).toBe(category === "administrator-policies");
        expect(note?.message).not.toContain("Agent 365");
      }
      const agent = getConditionalAccessCategoryLicenseNote(["agent-policies"], [id]);
      expect(agent?.message).toContain("Add an Agent 365 license to unlock all Agent policies");
      expect(agent?.message).not.toMatch(/Entra ID P2|PIM|risky/);
      expect(getConditionalAccessCategoryLicenseNote(
        ["agent-policies", "internal-user-policies"], [id],
      )?.message).not.toContain("PIM");
      expect(getConditionalAccessCategoryLicenseNote(
        ["agent-policies", "administrator-policies"], [id],
      )?.message).toContain("PIM authentication context");
    },
  );

  it.each(licenses.filter((license) => license.eligible).map((license) => license.id))(
    "matches Conditional Access prerequisites and badges to %s",
    (licenseId) => {
      const includesP2 = licenseId === "e5" || licenseId === "e7" || licenseId.includes("defender");
      for (const option of getSecurityGoalOptions("conditional-access").filter((item) => !item.comingSoon)) {
        const note = getConditionalAccessCategoryLicenseNote([option.id], [licenseId]);
        const needsAddOn = option.id === "agent-policies" || option.id === "global-secure-access-policies"
          ? licenseId !== "e7" : !includesP2;
        expect(Boolean(note)).toBe(needsAddOn);
        expect(getSecurityGoalOptionExperience(
          "conditional-access", [licenseId], ["conditional-access"], option.id,
        )).toBe(needsAddOn ? "limited" : "full");
        if (note && option.id !== "agent-policies" && option.id !== "global-secure-access-policies") {
          expect(note.message).toContain(licenseId.startsWith("f")
            ? "Microsoft Defender Suite FLW"
            : licenseId.startsWith("business-premium")
              ? "Microsoft Defender Suite for Business Premium"
              : "Microsoft Defender Suite for Microsoft 365 E3");
        }
      }
    },
  );

  it("combines license entitlements without unnecessary P2 or Agent notices", () => {
    expect(getConditionalAccessCategoryLicenseNote(
      ["internal-user-policies"], ["f1", "e5"],
    )).toBeUndefined();
    expect(getConditionalAccessCategoryLicenseNote(
      ["agent-policies", "internal-user-policies"], ["e3", "e7"],
    )).toBeUndefined();
    const note = getConditionalAccessCategoryLicenseNote(
      ["internal-user-policies"], ["f1", "business-premium", "e3"],
    );
    expect(note?.message).toContain("Microsoft Defender Suite FLW");
    expect(note?.message).toContain("Microsoft Defender Suite for Business Premium");
    expect(note?.message).toContain("Microsoft Defender Suite for Microsoft 365 E3");
    expect(getConditionalAccessCategoryLicenseNote(["internal-user-policies"], [])).toBeUndefined();
  });

  it("includes administrator protection with the requested Conditional Access policies", () => {
    expect(securityGoals.map((goal) => goal.name)).toEqual([
      "Attack protection",
      "Administrator protection",
      "Conditional Access",
      "Endpoint protection",
      "AI and Agent Security",
      "Data Security",
      "App protection",
    ]);

    expect(getSolutionPlatformIds("administrator-protection", []))
      .toEqual(["conditional-access", "windows-11", "macos"]);
    expect(
      getRecommendedPolicyIds(
        "administrator-protection",
        [],
        "conditional-access",
      ),
    ).toEqual([
      "CA100",
      "CA101",
      "CA102",
      "CA103",
      "CA104",
      "CA105",
      "CA107",
      "CA108",
      "CA109",
      "CA110",
    ]);
    const administratorOption = securityGoals
      .find((goal) => goal.id === "administrator-protection")!
      .options[0];
    expect(administratorOption.autoSelect).toBe(true);
    expect(administratorOption.recommendedPolicyNote)
      .toBe(
        "CA106 requires Microsoft Entra ID Plan 2. These recommended policies are a good starting point, but implementing them does not guarantee full protection.",
      );
  });

  it.each(licenses.filter((license) => license.eligible).map((license) => license.id))(
    "uses Intune Suite prerequisites for Windows administrator protection with %s",
    (licenseId) => {
      const note = getAdministratorProtectionLicenseNote([licenseId], "windows-11");
      expect(Boolean(note)).toBe(licenseId !== "e5" && licenseId !== "e7");
      if (note) {
        expect(note.title).toBe("Administrator protection policies licensing prerequisites");
        expect(note.message).toBe("Add the Microsoft Intune Suite add-on for the full Windows administrator protection experience. Microsoft Intune Suite is included in Microsoft 365 E5 and Microsoft 365 E7, which unlocks EPM (Endpoint Privilege Management).");
      }
      expect(getAdministratorProtectionLicenseNote([licenseId], "macos")).toBeUndefined();
      expect(getAdministratorProtectionLicenseNote([licenseId], "conditional-access")).toBeUndefined();
      expect(getRecommendedPolicyIds("administrator-protection", [], "windows-11")).toEqual([]);
      expect(getRecommendedPolicyIds("administrator-protection", [], "macos")).toEqual([]);
    },
  );

  it("offers the Conditional Access categories in the requested order", () => {
    const options = getSecurityGoalOptions("conditional-access");
    expect(options.map((option) => option.name)).toEqual([
      "Administrator policies",
      "Internal user policies",
      "Service Account policies",
      "Agent policies",
      "Guest user policies",
      "Global Secure Access Policies",
      "Service principal policies",
    ]);
    expect(options.every((option) =>
      option.platformIds.length === 1 && option.platformIds[0] === "conditional-access",
    )).toBe(true);
    expect(getSolutionPlatformIds("conditional-access", [])).toEqual([]);
    for (const option of options.filter((item) => !item.comingSoon)) {
      expect(option.autoSelect).not.toBe(true);
      expect(isSecurityGoalOptionAvailable("conditional-access", option.id, ["e3"])).toBe(true);
      expect(getSolutionPlatformIds("conditional-access", [option.id])).toEqual(["conditional-access"]);
    }
    expect(getSolutionPlatformIds(
      "conditional-access", options.map((option) => option.id),
    )).toEqual(["conditional-access"]);
  });

  it.each(licenses.filter((license) => license.eligible).map((license) => license.id))(
    "locks upcoming GSA and on-premises app protection for %s",
    (licenseId) => {
      const gsaId = "global-secure-access-policies";
      const onPremises = getSecurityGoalOptions("app-protection").find(
        (option) => option.id === "on-premises-apps",
      )!;
      expect(onPremises.comingSoon).toBe(true);
      expect(onPremises.allowRepositoryPreview).not.toBe(true);
      expect(getSecurityGoalOptions("conditional-access").find((option) => option.id === gsaId)?.comingSoon).toBe(true);
      expect(isSecurityGoalOptionAvailable("app-protection", onPremises.id, [licenseId])).toBe(false);
      expect(isSecurityGoalOptionAvailable("conditional-access", gsaId, [licenseId])).toBe(false);
      expect(getSolutionPlatformIds("app-protection", [onPremises.id])).toEqual([]);
      expect(getSolutionPlatformIds("conditional-access", [gsaId])).toEqual([]);
      expect(getRecommendedPolicyIds("conditional-access", [gsaId], "conditional-access")).toEqual([]);
      expect(getSecurityGoalOptionExperience(
        "app-protection", [licenseId], ["conditional-access"], onPremises.id,
      )).toBe(licenseId === "e7" ? "full" : "limited");
      const gsaNote = getConditionalAccessCategoryLicenseNote([gsaId], [licenseId]);
      expect(gsaNote).toBeUndefined();
      const privateNote = getOnPremisesAppLicenseNote([licenseId]);
      if (licenseId === "e7") {
        expect(gsaNote).toBeUndefined();
        expect(privateNote).toBeUndefined();
      } else {
        expect(privateNote?.message).toContain("Global Secure Access Private Access");
        expect(privateNote?.message).toContain("Microsoft Entra Suite or Microsoft 365 E7");
      }
    },
  );

  it("uses E7 entitlements for mixed selections and ignores empty on-premises licensing input", () => {
    expect(getOnPremisesAppLicenseNote(["e3", "e7"])).toBeUndefined();
    expect(getOnPremisesAppLicenseNote([])).toBeUndefined();
    const note = getConditionalAccessCategoryLicenseNote([
      "global-secure-access-policies", "agent-policies", "internal-user-policies",
    ], ["e3"]);
    expect(note?.message).not.toContain("Internet Access or Private Access");
    expect(note?.message).toContain("Agent 365");
    expect(note?.message).toContain("Entra ID P2");
  });

  it("keeps upcoming service principal policies out of recommendations", () => {
    const option = getSecurityGoalOptions("conditional-access").find(
      (item) => item.id === "service-principal-policies",
    )!;
    expect(option.comingSoon).toBe(true);
    for (const license of ["business-premium", "e3", "e5", "e7"] as const) {
      expect(isSecurityGoalOptionAvailable("conditional-access", option.id, [license])).toBe(false);
    }
    expect(getSolutionPlatformIds("conditional-access", [option.id])).toEqual([]);
    expect(getRecommendedPolicyIds("conditional-access", [option.id], "conditional-access")).toEqual([]);
  });

  it("supports selecting multiple security goals and deselecting one", () => {
    const selected = toggleSecurityGoalSelection(
      toggleSecurityGoalSelection([], "attack-protection"),
      "endpoint-protection",
    );

    expect(selected).toEqual(["attack-protection", "endpoint-protection"]);
    expect(toggleSecurityGoalSelection(selected, "attack-protection"))
      .toEqual(["endpoint-protection"]);
  });

  it.each([
    ["device-code-phishing", ["conditional-access"]],
    ["clickfix", ["windows-11", "macos"]],
    ["ransomware", ["windows-11", "macos", "windows-servers"]],
    ["token-theft", ["conditional-access", "macos", "windows-11"]],
    ["aitm-phishing", ["conditional-access"]],
    ["password-spray", ["conditional-access"]],
    ["brute-force", ["conditional-access", "windows-servers"]],
  ])("maps attack scenario %s to the requested repositories", (optionId, expected) => {
    expect(getSolutionPlatformIds("attack-protection", [optionId])).toEqual(expected);
  });

  it.each([
    ["device-code-phishing", "full"],
    ["clickfix", "limited"],
    ["ransomware", "limited"],
    ["token-theft", "limited"],
    ["aitm-phishing", "full"],
    ["password-spray", "full"],
    ["brute-force", "limited"],
  ] as const)(
    "derives the %s experience from all its actual repository prerequisites for Business Premium",
    (optionId, expectedExperience) => {
      const attackGoal = securityGoals.find((goal) => goal.id === "attack-protection")!;
      const option = attackGoal.options.find((item) => item.id === optionId)!;
      expect(
        getSecurityGoalOptionExperience(
          "attack-protection",
          ["business-premium"],
          option.platformIds,
        ),
      ).toBe(expectedExperience);
    },
  );

  it("requires every mapped repository to meet its prerequisites for Full experience", () => {
    const attackGoal = securityGoals.find((goal) => goal.id === "attack-protection")!;
    const clickfix = attackGoal.options.find((option) => option.id === "clickfix")!;
    const ransomware = attackGoal.options.find((option) => option.id === "ransomware")!;

    expect(
      getSecurityGoalOptionExperience(
        "attack-protection",
        ["business-premium-defender"],
        clickfix.platformIds,
      ),
    ).toBe("full");
    expect(
      getSecurityGoalOptionExperience(
        "attack-protection",
        ["business-premium-defender"],
        ransomware.platformIds,
      ),
    ).toBe("limited");
  });

  it("does not treat generic Conditional Access upsell guidance as an attack prerequisite", () => {
    expect(
      getSecurityGoalOptionExperience(
        "attack-protection",
        ["business-premium"],
        ["conditional-access"],
      ),
    ).toBe("full");
  });

  it("keeps license-based experience badges for non-attack goal options", () => {
    expect(
      getSecurityGoalOptionExperience(
        "app-protection",
        ["business-premium"],
        ["windows-11", "macos"],
      ),
    ).toBe("limited");
  });

  it.each(["business-premium", "e3", "f3", "f1"] as const)(
    "shows Limited experience for Sensitivity labels with %s",
    (licenseId) => {
      expect(
        getSecurityGoalOptionExperience(
          "data-protection",
          [licenseId],
          ["purview"],
          "sensitivity-labels",
        ),
      ).toBe("limited");
    },
  );

  it.each(["f1-purview", "f3-purview"] as const)(
    "keeps Sensitivity labels Limited with %s because FLW Purview has limitations",
    (licenseId) => {
      expect(
        getSecurityGoalOptionExperience(
          "data-protection",
          [licenseId],
          ["purview"],
          "sensitivity-labels",
        ),
      ).toBe("limited");
    },
  );

  it.each([
    ["device-code-phishing", ["CA004"]],
    ["aitm-phishing", ["CA105", "CA107"]],
    ["token-theft", ["CA105", "CA107"]],
    ["password-spray", ["CA002", "CA000"]],
    ["brute-force", ["CA002", "CA000"]],
  ])("recommends the specified Conditional Access policies for %s", (optionId, expected) => {
    expect(
      getRecommendedPolicyIds("attack-protection", [optionId], "conditional-access"),
    ).toEqual(expected);
  });

  it("shows attack policy IDs only on the Conditional Access repository", () => {
    expect(
      getRecommendedPolicyIds("attack-protection", ["token-theft"], "windows-11"),
    ).toEqual([]);
    expect(
      getRecommendedPolicyIds("attack-protection", ["token-theft"], "macos"),
    ).toEqual([]);
  });

  it("adds a protection disclaimer to each attack policy recommendation", () => {
    const attackOptions = securityGoals.find((goal) => goal.id === "attack-protection")!.options;
    const policyRecommendations = attackOptions.filter(
      (option) => "recommendedPolicyIds" in option,
    );

    expect(policyRecommendations.every((option) =>
      "recommendedPolicyNote" in option &&
      option.recommendedPolicyNote ===
      "These recommended policies are a good starting point, but implementing them does not guarantee full protection.",
    )).toBe(true);
  });

  it("deduplicates policies when multiple attack scenarios are selected", () => {
    expect(
      getRecommendedPolicyIds(
        "attack-protection",
        ["aitm-phishing", "token-theft"],
        "conditional-access",
      ),
    ).toEqual(["CA105", "CA107"]);
  });

  it("maps endpoint protection to all seven requested platforms", () => {
    expect(
      getSolutionPlatformIds("endpoint-protection", [
        "endpoint-windows",
        "endpoint-macos",
        "endpoint-windows-server",
        "endpoint-linux-server",
        "endpoint-linux-desktop",
        "endpoint-ios-ipados",
        "endpoint-android",
      ]),
    ).toEqual([
      "windows-11",
      "macos",
      "windows-servers",
      "linux-server",
      "linux-desktop",
      "ios-ipados",
      "android",
    ]);
  });

  it("maps requested endpoint subcategories to their parent repositories", () => {
    const endpointOptions = getSecurityGoalOptions("endpoint-protection");
    const childrenByPlatform = Object.fromEntries(
      securityGoals
        .find((goal) => goal.id === "endpoint-protection")!
        .options.map((option) => [option.id, option.children?.map((child) => child.name) ?? []]),
    );

    expect(childrenByPlatform["endpoint-windows"]).toEqual([
      "Antivirus (AV)",
      "Firewall",
      "Attack Surface Reduction (ASR)",
      "Encryption",
      "Remediation Scripts",
    ]);
    expect(childrenByPlatform["endpoint-macos"]).toEqual([
      "Antivirus (AV)",
      "Firewall",
      "Automated onboarding to Defender",
    ]);
    expect(childrenByPlatform["endpoint-windows-server"]).toEqual([
      "Antivirus (AV)",
      "Firewall",
      "Attack Surface Reduction (ASR)",
    ]);
    expect(childrenByPlatform["endpoint-linux-server"]).toEqual(["Antivirus (AV)"]);
    expect(childrenByPlatform["endpoint-linux-desktop"]).toEqual([
      "Antivirus (AV)",
      "Encryption",
    ]);
    expect(childrenByPlatform["endpoint-ios-ipados"]).toEqual([
      "App Protection",
      "Automated onboarding to Defender",
      "Antivirus (AV)",
      "App Configuration",
      "Encryption",
    ]);
    expect(childrenByPlatform["endpoint-android"]).toEqual(
      childrenByPlatform["endpoint-ios-ipados"],
    );

    const windowsAsr = endpointOptions.find((option) => option.id === "windows-asr")!;
    expect(windowsAsr.platformIds).toEqual(["windows-11"]);
    expect(getSolutionPlatformIds("endpoint-protection", [windowsAsr.id]))
      .toEqual(["windows-11"]);
  });

  it.each([
    "e7",
    "e5",
    "e3-defender",
    "e3-defender-purview",
    "business-premium-defender",
    "business-premium-defender-purview",
    "f3-defender",
    "f3-defender-purview",
    "f1-defender",
    "f1-defender-purview",
  ] as const)("shows full endpoint feature experience for %s", (licenseId) => {
    const features = getSecurityGoalOptions("endpoint-protection")
      .filter((option) => option.endpointFeature);
    for (const option of features) {
      expect(getSecurityGoalOptionExperience(
        "endpoint-protection",
        [licenseId],
        option.platformIds,
        option.id,
      )).toBe("full");
      expect(getEndpointFeatureLicenseNote(option.endpointFeature, [licenseId]))
        .toBeUndefined();
    }
  });

  it("shows full Intune settings and limited Defender settings for Business Premium and E3", () => {
    for (const licenseId of ["business-premium", "e3"] as const) {
      expect(getSecurityGoalOptionExperience(
        "endpoint-protection",
        [licenseId],
        ["windows-11"],
        "windows-encryption",
      )).toBe("full");
      expect(getSecurityGoalOptionExperience(
        "endpoint-protection",
        [licenseId],
        ["windows-11"],
        "windows-antivirus",
      )).toBe("limited");
      expect(getEndpointFeatureLicenseNote("defender", [licenseId]))
        .toContain("Add Microsoft Defender Suite");
    }
  });

  it.each(["business-premium", "business-premium-purview", "e3", "e3-purview"] as const)(
    "explains the repository-specific limited experience for %s",
    (licenseId) => {
      for (const platform of ["macos", "ios-ipados", "android"] as const) {
        const note = getEndpointFeatureLicenseNote("defender", [licenseId], platform);
        expect(note).toContain("full Defender for Cloud Apps experience is not included");
        expect(note).toContain(licenseId.startsWith("business-premium")
          ? "Microsoft Defender Suite for Business Premium"
          : "Microsoft Defender Suite for Microsoft 365 E3");
      }
      const windows = getEndpointFeatureLicenseNote("defender", [licenseId], "windows-11");
      expect(windows).toContain("Windows BP package");
      expect(windows).toContain("separate Defender for Cloud Apps entitlement");
      expect(windows).toContain("Microsoft Intune Suite must be excluded");
      const linux = getEndpointFeatureLicenseNote("defender", [licenseId], "linux-desktop");
      expect(linux).toContain("E5-level licensing only");
      expect(linux).toContain("Add Microsoft Defender Suite");
    },
  );

  it("explains the macOS Custom Indicators alternative only for Business Premium", () => {
    expect(getEndpointFeatureLicenseNote("defender", ["business-premium"], "macos"))
      .toContain("Custom Indicators and Web Content Filtering workflow instead of");
    expect(getEndpointFeatureLicenseNote("defender", ["e3"], "macos"))
      .not.toContain("Custom Indicators");
  });

  it.each(["f1", "f1-purview", "f3", "f3-purview"] as const)(
    "retains frontline limitations for Intune-only selections with %s",
    (licenseId) => {
      for (const platform of ["macos", "ios-ipados", "android"] as const) {
        const note = getEndpointFeatureLicenseNote("intune", [licenseId], platform);
        expect(note).toContain("Intune configuration settings only");
        expect(note).toContain("not support Microsoft Defender settings");
        expect(note).toContain("Microsoft Defender Suite FLW");
      }
      const windows = getEndpointFeatureLicenseNote("intune", [licenseId], "windows-11");
      expect(windows).toContain("Microsoft Intune Suite must be excluded");
      expect(windows).toContain(licenseId.startsWith("f1")
        ? "Intune configuration settings only"
        : "BitLocker To Go");
      expect(getEndpointFeatureLicenseNote("defender", [licenseId], "linux-desktop"))
        .toContain("Microsoft Defender Suite FLW");
    },
  );

  it("uses the combined entitlement without misleading lower-license limitations", () => {
    for (const platform of ["windows-11", "macos", "ios-ipados", "android", "linux-desktop"] as const) {
      expect(getEndpointFeatureLicenseNote("defender", ["business-premium", "e5"], platform))
        .toBeUndefined();
      expect(getEndpointFeatureLicenseNote("intune", ["f1", "e3-defender"], platform))
        .toBeUndefined();
    }
    expect(getEndpointFeatureLicenseNote("intune", ["f1", "f3"], "windows-11"))
      .toContain("Microsoft 365 F3 supports only");
  });

  it.each(licenses.filter((license) => license.eligible))(
    "provides a limitation or server prerequisite for every available limited endpoint category with $name",
    (license) => {
      for (const option of getSecurityGoalOptions("endpoint-protection")) {
        if (!option.endpointFeature ||
          !isSecurityGoalOptionAvailable("endpoint-protection", option.id, [license.id])) continue;
        for (const platform of option.platformIds) {
          if (!isPlatformAvailableForLicenses([license.id], platform) ||
            getSecurityGoalOptionExperience(
              "endpoint-protection", [license.id], [platform], option.id,
            ) !== "limited") continue;
          if (platform === "windows-servers" || platform === "linux-server") {
            expect(getWindowsServerLicenseNotes([license.id], platform).length).toBeGreaterThan(0);
          } else {
            expect(getEndpointFeatureLicenseNote(option.endpointFeature, [license.id], platform))
              .toBeTruthy();
          }
        }
      }
    },
  );

  it.each(licenses.filter((license) => license.eligible))(
    "limits only AV on client endpoint platforms for $name",
    (license) => {
      const options = getSecurityGoalOptions("endpoint-protection").filter((option) =>
        option.endpointFeature &&
        option.platformIds.every((id) =>
          id === "windows-11" || id === "macos" || id === "ios-ipados" || id === "android",
        ),
      );
      for (const option of options) {
        const experience = getSecurityGoalOptionExperience(
          "endpoint-protection", [license.id], option.platformIds, option.id,
        );
        if (!option.id.endsWith("-antivirus")) {
          expect(experience).toBe("full");
          expect(isSecurityGoalOptionAvailable("endpoint-protection", option.id, [license.id]))
            .toBe(true);
          expect(getLimitedExperienceSelections(
            [{ ...option, goalId: "endpoint-protection" as const }],
            [license.id],
            option.platformIds[0],
          )).toEqual([]);
        }
      }
    },
  );

  it("keeps server and Linux category experiences unchanged", () => {
    for (const licenseId of ["business-premium", "e3", "f3", "f1"] as const) {
      for (const [platform, id] of [
        ["windows-servers", "server-antivirus"],
        ["linux-server", "linux-server-antivirus"],
        ["linux-desktop", "linux-desktop-antivirus"],
      ] as const) {
        expect(getSecurityGoalOptionExperience(
          "endpoint-protection", [licenseId], [platform], id,
        )).toBe("limited");
      }
    }
    expect(getSecurityGoalOptionExperience(
      "endpoint-protection", ["f1"], ["linux-desktop"], "linux-desktop-encryption",
    )).toBe("limited");
    expect(getSecurityGoalOptionExperience(
      "endpoint-protection", ["business-premium"], ["linux-desktop"], "linux-desktop-encryption",
    )).toBe("full");
  });

  it("applies F3's AV subset and F1's AV restriction without limiting other client categories", () => {
    for (const optionId of [
      "windows-antivirus",
      "windows-firewall",
      "windows-asr",
    ]) {
      expect(isSecurityGoalOptionAvailable("endpoint-protection", optionId, ["f3"]))
        .toBe(true);
      expect(getSecurityGoalOptionExperience(
        "endpoint-protection",
        ["f3"],
        ["windows-11"],
        optionId,
      )).toBe(optionId === "windows-antivirus" ? "limited" : "full");
    }
    expect(isSecurityGoalOptionAvailable(
      "endpoint-protection",
      "macos-defender-onboarding",
      ["f3"],
    )).toBe(true);
    expect(getEndpointFeatureLicenseNote("defender", ["f3"]))
      .toContain("Defender Antimalware, Microsoft Defender Firewall, Exploit Guard");

    expect(isSecurityGoalOptionAvailable(
      "endpoint-protection",
      "windows-antivirus",
      ["f1"],
    )).toBe(false);
    expect(isSecurityGoalOptionAvailable(
      "endpoint-protection",
      "ios-app-protection",
      ["f1"],
    )).toBe(true);
    expect(getSecurityGoalOptionExperience(
      "endpoint-protection",
      ["f1"],
      ["ios-ipados"],
      "ios-app-protection",
    )).toBe("full");
    expect(getEndpointFeatureLicenseNote("intune", ["f1"]))
      .toContain("Intune configuration settings only");
  });

  it.each([
    ["endpoint-macos", "macos-antivirus", "macos-defender-onboarding", "macos"],
    ["endpoint-linux-desktop", "linux-desktop-antivirus", undefined, "linux-desktop"],
    ["endpoint-linux-server", "linux-server-antivirus", undefined, "linux-server"],
    ["endpoint-ios-ipados", "ios-antivirus", "ios-defender-onboarding", "ios-ipados"],
    ["endpoint-android", "android-antivirus", "android-defender-onboarding", "android"],
  ] as const)(
    "disables Defender settings and onboarding for F3 on %s",
    (_platformOptionId, antivirusId, onboardingId, platformId) => {
      const defenderOptions = getSecurityGoalOptions("endpoint-protection")
        .filter((option) =>
          option.endpointFeature === "defender" &&
          option.platformIds.includes(platformId),
        );

      expect(defenderOptions.length).toBeGreaterThan(0);
      for (const option of defenderOptions) {
        expect(isSecurityGoalOptionAvailable(
          "endpoint-protection",
          option.id,
          ["f3"],
        )).toBe(!option.id.endsWith("-antivirus"));
        const note = getEndpointFeatureLicenseNote(
          option.endpointFeature,
          ["f3"],
          platformId,
        );
        expect(note).toContain(platformId === "linux-desktop"
          ? "do not cover the Linux Desktop Defender policy package"
          : "does not support Microsoft Defender settings");
      }
      expect(isSecurityGoalOptionAvailable(
        "endpoint-protection",
        antivirusId,
        ["f3"],
      )).toBe(false);
      if (onboardingId) {
        expect(isSecurityGoalOptionAvailable(
          "endpoint-protection",
          onboardingId,
          ["f3"],
        )).toBe(true);
      }
      expect(getEndpointFeatureLicenseNote("defender", ["f3"], platformId))
        .toContain("Automated onboarding to Defender is not eligible");
    },
  );

  it("retains F1 AV restrictions and server/Linux rules while enabling other client categories", () => {
    const defenderOptions = getSecurityGoalOptions("endpoint-protection")
      .filter((option) => option.endpointFeature === "defender");
    for (const option of defenderOptions) {
      expect(isSecurityGoalOptionAvailable(
        "endpoint-protection",
        option.id,
        ["f1"],
      )).toBe(!option.id.endsWith("-antivirus") &&
        option.platformIds.every((id) =>
          id === "windows-11" || id === "macos" || id === "ios-ipados" || id === "android",
        ));
      expect(getEndpointFeatureLicenseNote(
        option.endpointFeature,
        ["f1"],
        option.platformIds[0],
      )).toContain("Automated onboarding to Defender is not eligible");
      expect(isSecurityGoalOptionAvailable(
        "endpoint-protection",
        option.id,
        ["f1-defender"],
      )).toBe(true);
    }
    expect(isSecurityGoalOptionAvailable(
      "endpoint-protection",
      "macos-defender-onboarding",
      ["f3-defender"],
    )).toBe(true);
  });

  it("maps every Data Security option to Purview", () => {
    const dataSecurityOptions = securityGoals
      .find((goal) => goal.id === "data-protection")!
      .options;
    expect(dataSecurityOptions.map((option) => option.name)).toEqual([
      "Sensitivity labels",
      "Data Loss Prevention (DLP)",
      "Endpoint Data Loss Prevention (eDLP)",
      "Retention",
      "Auto labelling",
      "Sensitive Information Types (SITs)",
    ]);
    expect(dataSecurityOptions.every((option) =>
      option.platformIds.length === 1 && option.platformIds[0] === "purview",
    )).toBe(true);
    expect(getSolutionPlatformIds(
      "data-protection",
      dataSecurityOptions.map((option) => option.id),
    )).toEqual(["purview"]);
    expect(getSolutionPlatformIds("ai-agent-security", ["ai-security", "agent-security"]))
      .toEqual(["ai-security", "ai-security-macos", "purview", "agent-security"]);
  });

  it.each([
    "e7",
    "e5",
    "e3-purview",
    "e3-defender-purview",
    "business-premium-purview",
    "business-premium-defender-purview",
  ] as const)("shows Full Data Security experience for %s", (licenseId) => {
    const options = securityGoals.find((goal) => goal.id === "data-protection")!.options;
    for (const option of options) {
      expect(isSecurityGoalOptionAvailable("data-protection", option.id, [licenseId]))
        .toBe(true);
      expect(getSecurityGoalOptionExperience(
        "data-protection",
        [licenseId],
        option.platformIds,
        option.id,
      )).toBe(option.id === "sensitivity-labels" ? "limited" : "full");
    }
    expect(getDataSecurityLicenseNote([licenseId])).toContain("Sensitivity labels:");
  });

  it.each(["business-premium", "e3", "e3-defender"] as const)(
    "limits DLP and auto-labeling experience for %s",
    (licenseId) => {
      const options = securityGoals.find((goal) => goal.id === "data-protection")!.options;
      for (const option of options) {
        expect(getSecurityGoalOptionExperience(
          "data-protection",
          [licenseId],
          option.platformIds,
        )).toBe("limited");
      }
      expect(getDataSecurityLicenseNote([licenseId], ["dlp"]))
        .toContain("DLP for emails and files is included");
    },
  );

  it("unlocks the user-specified Data Security features with FLW Purview Suite", () => {
    for (const licenseId of ["f1-purview", "f3-purview"] as const) {
      const options = securityGoals.find((goal) => goal.id === "data-protection")!.options;
      for (const option of options) {
        expect(getSecurityGoalOptionExperience(
          "data-protection",
          [licenseId],
          option.platformIds,
          option.id,
        )).toBe(["dlp", "endpoint-dlp", "retention", "auto-labeling"].includes(option.id)
          ? "full" : "limited");
        expect(isSecurityGoalOptionAvailable(
          "data-protection",
          option.id,
          [licenseId],
        )).toBe(true);
      }
    }
    expect(getDataSecurityLicenseNote(["f3-purview"], ["endpoint-dlp"])).toBeUndefined();
  });

  it("shows F1 upgrade paths for DLP, retention, eDLP and auto labelling", () => {
    const options = securityGoals.find((goal) => goal.id === "data-protection")!.options;
    for (const option of options) {
      expect(isSecurityGoalOptionAvailable("data-protection", option.id, ["f1"]))
        .toBe(option.id !== "sensitive-information-types");
    }
    expect(getDataSecurityLicenseNote(["f1"], ["retention"]))
      .toContain("Manual retention labels and Teams message retention policies are included");
    expect(getDataSecurityLicenseNote(["f1"]))
      .toContain("Add Microsoft Purview Suite FLW");
  });

  it.each(["e3", "e3-defender", "business-premium", "business-premium-defender"] as const)(
    "names the missing Purview add-on for %s while limiting Sensitivity labels",
    (licenseId) => {
      expect(getDataSecurityLicenseNote([licenseId])).toContain("Add Microsoft Purview Suite");
      expect(getDataSecurityLicenseNote([licenseId])).toContain(
        licenseId.startsWith("business-premium")
          ? "Microsoft Purview Suite for Business Premium"
          : "Microsoft Purview Suite for Microsoft 365 E3",
      );
      expect(getSecurityGoalOptionExperience(
        "data-protection", [licenseId], ["purview"], "sensitivity-labels",
      )).toBe("limited");
    },
  );

  it.each(["f3", "f3-defender"] as const)("names the FLW add-on missing from %s", (licenseId) => {
    expect(getDataSecurityLicenseNote([licenseId])).toContain("Add Microsoft Purview Suite FLW");
    expect(getDataSecurityLicenseNote([licenseId], ["endpoint-dlp"]))
      .toContain("Endpoint DLP (eDLP) is not included with the selected base licenses");
  });

  it("does not suggest another add-on when FLW Purview is already selected", () => {
    expect(getDataSecurityLicenseNote(["f3-purview"])).not.toContain("Add ");
    expect(getDataSecurityLicenseNote(["e3", "e5"])).toContain("Sensitivity labels:");
    expect(getDataSecurityLicenseNote(["e3", "e5"])).not.toContain("Add ");
    expect(getDataSecurityLicenseNote([])).toBeUndefined();
  });

  it.each([
    ["oauth-apps", ["conditional-access"]],
    ["desktop-apps", ["windows-11", "macos"]],
    ["mobile-apps", ["ios-ipados", "android"]],
    ["cloud-apps", ["windows-11", "windows-servers", "macos", "conditional-access"]],
  ])("maps app protection option %s to the requested repositories", (optionId, expected) => {
    expect(getSolutionPlatformIds("app-protection", [optionId])).toEqual(expected);
  });

  it("combines app protection types and deduplicates shared repositories", () => {
    expect(
      getSolutionPlatformIds("app-protection", [
        "oauth-apps",
        "desktop-apps",
        "mobile-apps",
        "cloud-apps",
      ]),
    ).toEqual([
      "conditional-access",
      "windows-11",
      "macos",
      "ios-ipados",
      "android",
      "windows-servers",
    ]);
  });
});
