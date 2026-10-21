import { describe, expect, it } from "vitest";
import { licenses } from "./catalog";
import {
  getDataSecurityLicenseNote,
  getConditionalAccessCategoryLicenseNote,
  getOnPremisesAppLicenseNote,
  getDesktopAppLicenseNote,
  getEndpointFeatureLicenseNote,
  getRecommendedPolicyIds,
  getSecurityGoalOptions,
  getSecurityGoalOptionExperience,
  isSecurityGoalOptionAvailable,
  getSolutionPlatformIds,
  securityGoals,
  toggleSecurityGoalSelection,
} from "./solutionCatalog";

describe("security goal recommendations", () => {
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
        expect(note?.message).toContain("Agent 365 add-on");
        expect(note?.message).not.toContain("Entra ID P2");
      } else {
        expect(note?.message).toContain("Some of these policies require Microsoft Entra ID P2");
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
    expect(agents?.message).toContain("Agent 365 add-on");
    expect(agents?.includePlanComparisons).toBe(true);
    const mixed = getConditionalAccessCategoryLicenseNote(["agent-policies", "internal-user-policies"], ["e3"]);
    expect(mixed?.message).toContain("Agent 365 add-on");
    expect(mixed?.message).toContain("Entra ID P2 add-on");
    expect(mixed?.includePlanComparisons).toBe(true);
    expect(getConditionalAccessCategoryLicenseNote(["service-principal-policies"], ["e3"])).toBeUndefined();
    expect(getConditionalAccessCategoryLicenseNote([], ["e3"])).toBeUndefined();
  });

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
      .toEqual(["conditional-access"]);
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
    "maps GSA and upcoming on-premises app protection to Conditional Access for %s",
    (licenseId) => {
      const gsaId = "global-secure-access-policies";
      const onPremises = getSecurityGoalOptions("app-protection").find(
        (option) => option.id === "on-premises-apps",
      )!;
      expect(onPremises.comingSoon).toBe(true);
      expect(onPremises.allowRepositoryPreview).toBe(true);
      expect(isSecurityGoalOptionAvailable("app-protection", onPremises.id, [licenseId])).toBe(true);
      expect(getSolutionPlatformIds("app-protection", [onPremises.id])).toEqual(["conditional-access"]);
      expect(getSolutionPlatformIds("conditional-access", [gsaId])).toEqual(["conditional-access"]);
      expect(getSecurityGoalOptionExperience(
        "app-protection", [licenseId], ["conditional-access"], onPremises.id,
      )).toBe(licenseId === "e7" ? "full" : "limited");
      const gsaNote = getConditionalAccessCategoryLicenseNote([gsaId], [licenseId]);
      const privateNote = getOnPremisesAppLicenseNote([licenseId]);
      if (licenseId === "e7") {
        expect(gsaNote).toBeUndefined();
        expect(privateNote).toBeUndefined();
      } else {
        expect(gsaNote?.message).toContain("Internet Access or Private Access");
        expect(gsaNote?.message).toContain("Microsoft Entra Suite");
        expect(gsaNote?.message).toContain("Microsoft 365 E7");
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
    expect(note?.message).toContain("Internet Access or Private Access");
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
    "shows Full experience for Sensitivity labels with %s",
    (licenseId) => {
      expect(
        getSecurityGoalOptionExperience(
          "data-protection",
          [licenseId],
          ["purview"],
          "sensitivity-labels",
        ),
      ).toBe("full");
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

  it("applies F3's supported Defender subset and F1's Intune-only limitation", () => {
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
      )).toBe("limited");
    }
    expect(isSecurityGoalOptionAvailable(
      "endpoint-protection",
      "macos-defender-onboarding",
      ["f3"],
    )).toBe(false);
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
    )).toBe("limited");
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
        )).toBe(false);
        expect(getEndpointFeatureLicenseNote(
          option.endpointFeature,
          ["f3"],
          platformId,
        )).toContain("does not support Microsoft Defender settings");
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
        )).toBe(false);
      }
      expect(getEndpointFeatureLicenseNote("defender", ["f3"], platformId))
        .toContain("Automated onboarding to Defender is not eligible");
    },
  );

  it("disables all F1 Defender categories while retaining Defender Suite support", () => {
    const defenderOptions = getSecurityGoalOptions("endpoint-protection")
      .filter((option) => option.endpointFeature === "defender");
    for (const option of defenderOptions) {
      expect(isSecurityGoalOptionAvailable(
        "endpoint-protection",
        option.id,
        ["f1"],
      )).toBe(false);
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
      )).toBe("full");
    }
    expect(getDataSecurityLicenseNote([licenseId])).toBeUndefined();
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
      expect(getDataSecurityLicenseNote([licenseId]))
        .toContain("without the full DLP and auto-labelling experience");
    },
  );

  it("limits FLW Purview experience and excludes eDLP", () => {
    for (const licenseId of ["f1-purview", "f3-purview"] as const) {
      const options = securityGoals.find((goal) => goal.id === "data-protection")!.options;
      for (const option of options) {
        expect(getSecurityGoalOptionExperience(
          "data-protection",
          [licenseId],
          option.platformIds,
        )).toBe("limited");
        expect(isSecurityGoalOptionAvailable(
          "data-protection",
          option.id,
          [licenseId],
        )).toBe(option.id !== "endpoint-dlp");
      }
    }
    expect(getDataSecurityLicenseNote(["f3-purview"]))
      .toContain("eDLP policies are not included");
  });

  it("limits F1 to Sensitivity labels without Purview Suite", () => {
    const options = securityGoals.find((goal) => goal.id === "data-protection")!.options;
    for (const option of options) {
      expect(isSecurityGoalOptionAvailable("data-protection", option.id, ["f1"]))
        .toBe(option.id === "sensitivity-labels");
    }
    expect(getDataSecurityLicenseNote(["f1"]))
      .toContain("Microsoft 365 F1 supports Sensitivity labels only.");
    expect(getDataSecurityLicenseNote(["f1"]))
      .toContain("Add Microsoft Purview Suite FLW");
  });

  it.each(["e3", "e3-defender", "business-premium", "business-premium-defender"] as const)(
    "names the missing Purview add-on for %s without changing Sensitivity labels experience",
    (licenseId) => {
      expect(getDataSecurityLicenseNote([licenseId])).toContain("Add Microsoft Purview Suite");
      expect(getDataSecurityLicenseNote([licenseId])).toContain(
        licenseId.startsWith("business-premium")
          ? "Microsoft Purview Suite for Business Premium"
          : "Microsoft Purview Suite for Microsoft 365 E3",
      );
      expect(getSecurityGoalOptionExperience(
        "data-protection", [licenseId], ["purview"], "sensitivity-labels",
      )).toBe("full");
    },
  );

  it.each(["f3", "f3-defender"] as const)("names the FLW add-on missing from %s", (licenseId) => {
    expect(getDataSecurityLicenseNote([licenseId])).toContain("Add Microsoft Purview Suite FLW");
    expect(getDataSecurityLicenseNote([licenseId])).toContain("eDLP policies are not included");
  });

  it("does not suggest another add-on when FLW Purview is already selected", () => {
    expect(getDataSecurityLicenseNote(["f3-purview"])).not.toContain("Add ");
    expect(getDataSecurityLicenseNote(["e3", "e5"])).toBeUndefined();
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
