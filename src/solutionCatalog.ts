import {
  getPlatform,
  getPlatformExperienceForLicenses,
  hasEntraIdP2,
  isLicenseEligible,
  type License,
  type Platform,
} from "./catalog";

export interface SolutionOption {
  id: string;
  name: string;
  description: string;
  platformIds: readonly Platform["id"][];
  children?: readonly SolutionOption[];
  endpointFeature?: "intune" | "defender";
  recommendedPolicyIds?: readonly string[];
  recommendedPolicyNote?: string;
  hasPolicyLicensingPrerequisites?: boolean;
  autoSelect?: boolean;
  comingSoon?: boolean;
  allowRepositoryPreview?: boolean;
}

export interface SecurityGoal {
  id: string;
  name: string;
  description: string;
  prompt: string;
  options: readonly SolutionOption[];
}

const ATTACK_POLICY_NOTE =
  "These recommended policies are a good starting point, but implementing them does not guarantee full protection.";
const AGENT_POLICY_NOTE =
  "Agent policies require the Agent 365 add-on. Agent 365 is also included in Microsoft 365 E7.";

export const securityGoals = [
  {
    id: "attack-protection",
    name: "Attack protection",
    description: "Find policy templates that help protect against common identity and device attacks.",
    prompt: "Which attacks are you trying to protect against?",
    options: [
      {
        id: "device-code-phishing",
        name: "Device code phishing attacks",
        description: "Protect sign-in flows that can be abused to trick users into authorizing an attacker’s device.",
        platformIds: ["conditional-access"],
        recommendedPolicyIds: ["CA004"],
        recommendedPolicyNote: ATTACK_POLICY_NOTE,
      },
      {
        id: "clickfix",
        name: "ClickFix attacks",
        description: "Explore Windows and macOS policies that help protect against ClickFix attacks.",
        platformIds: ["windows-11", "macos"],
      },
      {
        id: "ransomware",
        name: "Ransomware attacks",
        description: "Explore Windows, macOS, and Windows Server policies that help protect against ransomware.",
        platformIds: ["windows-11", "macos", "windows-servers"],
      },
      {
        id: "token-theft",
        name: "Token theft attacks",
        description: "Help reduce the risk of stolen authentication tokens being used to access accounts and devices.",
        platformIds: ["conditional-access", "macos", "windows-11"],
        recommendedPolicyIds: ["CA105", "CA107"],
        recommendedPolicyNote: ATTACK_POLICY_NOTE,
      },
      {
        id: "aitm-phishing",
        name: "AiTM (Adversary-in-the-middle) phishing attacks",
        description: "Strengthen access controls against phishing proxies that attempt to capture credentials and session tokens.",
        platformIds: ["conditional-access"],
        recommendedPolicyIds: ["CA105", "CA107"],
        recommendedPolicyNote: ATTACK_POLICY_NOTE,
      },
      {
        id: "password-spray",
        name: "Password spray attacks",
        description: "Apply access policies that help mitigate attempts to sign in with commonly used passwords across many accounts.",
        platformIds: ["conditional-access"],
        recommendedPolicyIds: ["CA002", "CA000"],
        recommendedPolicyNote: ATTACK_POLICY_NOTE,
      },
      {
        id: "brute-force",
        name: "Brute force attacks",
        description: "Use identity and server security policies to help reduce repeated password-guessing attempts.",
        platformIds: ["conditional-access", "windows-servers"],
        recommendedPolicyIds: ["CA002", "CA000"],
        recommendedPolicyNote: ATTACK_POLICY_NOTE,
      },
    ],
  },
  {
    id: "administrator-protection",
    name: "Administrator protection",
    description: "Strengthen administrator protection with Conditional Access, Windows, and macOS policies.",
    prompt: "Explore recommended administrator protection policies",
    options: [
      {
        id: "administrator-protection-policies",
        name: "Administrator protection policies",
        description: "Review Conditional Access, Windows, and macOS policies for administrator accounts and privileged access.",
        platformIds: ["conditional-access", "windows-11", "macos"],
        autoSelect: true,
        recommendedPolicyIds: [
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
        ],
        recommendedPolicyNote:
          `CA106 requires Microsoft Entra ID Plan 2. ${ATTACK_POLICY_NOTE}`,
        hasPolicyLicensingPrerequisites: true,
      },
    ],
  },
  {
    id: "conditional-access",
    name: "Conditional Access",
    description: "Explore Conditional Access policies for users, administrators, service accounts, and agents.",
    prompt: "Which Conditional Access policy categories do you need?",
    options: [
      {
        id: "administrator-policies",
        name: "Administrator policies",
        description: "Protect administrator accounts and privileged access.",
        platformIds: ["conditional-access"],
      },
      {
        id: "internal-user-policies",
        name: "Internal user policies",
        description: "Protect access for internal users.",
        platformIds: ["conditional-access"],
      },
      {
        id: "service-account-policies",
        name: "Service Account policies",
        description: "Protect access for service accounts.",
        platformIds: ["conditional-access"],
      },
      {
        id: "agent-policies",
        name: "Agent policies",
        description: "Protect access for AI agents.",
        platformIds: ["conditional-access"],
      },
      {
        id: "guest-user-policies",
        name: "Guest user policies",
        description: "Protect access for guests and external users.",
        platformIds: ["conditional-access"],
      },
      {
        id: "global-secure-access-policies",
        name: "Global Secure Access Policies",
        description: "Explore policies for secure access to Microsoft cloud services, internet, and private resources.",
        platformIds: ["conditional-access"],
        comingSoon: true,
      },
      {
        id: "service-principal-policies",
        name: "Service principal policies",
        description: "Conditional Access policies for service principals are coming soon.",
        platformIds: ["conditional-access"],
        comingSoon: true,
      },
    ],
  },
  {
    id: "endpoint-protection",
    name: "Endpoint protection",
    description: "Explore endpoint security policies for the devices and operating systems you manage.",
    prompt: "Which endpoint platforms do you need to protect?",
    options: [
      {
        id: "endpoint-windows",
        name: "Windows",
        description: "Windows endpoint policies.",
        platformIds: ["windows-11"],
        children: [
          { id: "windows-antivirus", name: "Antivirus (AV)", description: "Microsoft Defender Antivirus settings.", platformIds: ["windows-11"], endpointFeature: "defender" },
          { id: "windows-firewall", name: "Firewall", description: "Microsoft Defender Firewall settings.", platformIds: ["windows-11"], endpointFeature: "defender" },
          { id: "windows-asr", name: "Attack Surface Reduction (ASR)", description: "Attack Surface Reduction rules and settings.", platformIds: ["windows-11"], endpointFeature: "defender" },
          { id: "windows-encryption", name: "Encryption", description: "Device encryption settings, including BitLocker.", platformIds: ["windows-11"], endpointFeature: "intune" },
          { id: "windows-remediation-scripts", name: "Remediation Scripts", description: "Intune remediation scripts for Windows devices.", platformIds: ["windows-11"], endpointFeature: "intune" },
        ],
      },
      {
        id: "endpoint-macos",
        name: "macOS",
        description: "macOS endpoint policies.",
        platformIds: ["macos"],
        children: [
          { id: "macos-antivirus", name: "Antivirus (AV)", description: "Microsoft Defender Antivirus settings.", platformIds: ["macos"], endpointFeature: "defender" },
          { id: "macos-firewall", name: "Firewall", description: "Firewall settings for macOS devices.", platformIds: ["macos"], endpointFeature: "defender" },
          { id: "macos-defender-onboarding", name: "Automated onboarding to Defender", description: "Automate onboarding of macOS devices to Microsoft Defender.", platformIds: ["macos"], endpointFeature: "defender" },
        ],
      },
      {
        id: "endpoint-windows-server",
        name: "Windows Server",
        description: "Windows Server security policies.",
        platformIds: ["windows-servers"],
        children: [
          { id: "server-antivirus", name: "Antivirus (AV)", description: "Microsoft Defender Antivirus settings for Windows Server.", platformIds: ["windows-servers"], endpointFeature: "defender" },
          { id: "server-firewall", name: "Firewall", description: "Microsoft Defender Firewall settings for Windows Server.", platformIds: ["windows-servers"], endpointFeature: "defender" },
          { id: "server-asr", name: "Attack Surface Reduction (ASR)", description: "Attack Surface Reduction rules and settings for Windows Server.", platformIds: ["windows-servers"], endpointFeature: "defender" },
        ],
      },
      {
        id: "endpoint-linux-server",
        name: "Linux Server",
        description: "Linux Server security policies.",
        platformIds: ["linux-server"],
        children: [
          { id: "linux-server-antivirus", name: "Antivirus (AV)", description: "Microsoft Defender Antivirus settings for Linux servers.", platformIds: ["linux-server"], endpointFeature: "defender" },
        ],
      },
      {
        id: "endpoint-linux-desktop",
        name: "Linux Desktop",
        description: "Linux Desktop security policies.",
        platformIds: ["linux-desktop"],
        children: [
          { id: "linux-desktop-antivirus", name: "Antivirus (AV)", description: "Microsoft Defender Antivirus settings for Linux desktops.", platformIds: ["linux-desktop"], endpointFeature: "defender" },
          { id: "linux-desktop-encryption", name: "Encryption", description: "Device encryption settings for Linux desktops.", platformIds: ["linux-desktop"], endpointFeature: "intune" },
        ],
      },
      {
        id: "endpoint-ios-ipados",
        name: "iOS/iPadOS",
        description: "iOS and iPadOS endpoint policies.",
        platformIds: ["ios-ipados"],
        children: [
          { id: "ios-app-protection", name: "App Protection", description: "App protection policies for iOS and iPadOS.", platformIds: ["ios-ipados"], endpointFeature: "intune" },
          { id: "ios-defender-onboarding", name: "Automated onboarding to Defender", description: "Automate onboarding of iOS and iPadOS devices to Microsoft Defender.", platformIds: ["ios-ipados"], endpointFeature: "defender" },
          { id: "ios-antivirus", name: "Antivirus (AV)", description: "Microsoft Defender Antivirus settings for iOS and iPadOS.", platformIds: ["ios-ipados"], endpointFeature: "defender" },
          { id: "ios-app-configuration", name: "App Configuration", description: "App configuration policies for iOS and iPadOS.", platformIds: ["ios-ipados"], endpointFeature: "intune" },
          { id: "ios-encryption", name: "Encryption", description: "Encryption policies for iOS and iPadOS.", platformIds: ["ios-ipados"], endpointFeature: "intune" },
        ],
      },
      {
        id: "endpoint-android",
        name: "Android",
        description: "Android endpoint policies.",
        platformIds: ["android"],
        children: [
          { id: "android-app-protection", name: "App Protection", description: "App protection policies for Android.", platformIds: ["android"], endpointFeature: "intune" },
          { id: "android-defender-onboarding", name: "Automated onboarding to Defender", description: "Automate onboarding of Android devices to Microsoft Defender.", platformIds: ["android"], endpointFeature: "defender" },
          { id: "android-antivirus", name: "Antivirus (AV)", description: "Microsoft Defender Antivirus settings for Android.", platformIds: ["android"], endpointFeature: "defender" },
          { id: "android-app-configuration", name: "App Configuration", description: "App configuration policies for Android.", platformIds: ["android"], endpointFeature: "intune" },
          { id: "android-encryption", name: "Encryption", description: "Encryption policies for Android.", platformIds: ["android"], endpointFeature: "intune" },
        ],
      },
    ],
  },
  {
    id: "ai-agent-security",
    name: "AI and Agent Security",
    description: "Explore available security policies for AI environments and AI agents.",
    prompt: "Which AI and agent security templates do you want to explore?",
    options: [
      {
        id: "ai-security",
        name: "AI Security",
        description: "Explore available AI Security policies for Windows 11 and macOS.",
        platformIds: ["ai-security", "ai-security-macos", "purview"],
      },
      {
        id: "agent-security",
        name: "Agent Security",
        description: "Explore Conditional Access and AI Security policies for Agent Security.",
        platformIds: ["agent-security"],
      },
    ],
  },
  {
    id: "data-protection",
    name: "Data Security",
    description: "Explore Microsoft Purview policies for protecting organizational data.",
    prompt: "Choose the Data Security policy categories to explore.",
    options: [
      {
        id: "sensitivity-labels",
        name: "Sensitivity labels",
        description: "Explore policies for classifying and protecting sensitive information.",
        platformIds: ["purview"],
      },
      {
        id: "dlp",
        name: "Data Loss Prevention (DLP)",
        description: "Explore policies that help prevent sensitive data from being shared inappropriately.",
        platformIds: ["purview"],
      },
      {
        id: "endpoint-dlp",
        name: "Endpoint Data Loss Prevention (eDLP)",
        description: "Explore policies that help protect sensitive data on endpoints.",
        platformIds: ["purview"],
      },
      {
        id: "retention",
        name: "Retention",
        description: "Explore policies for retaining and deleting organizational data.",
        platformIds: ["purview"],
      },
      {
        id: "auto-labeling",
        name: "Auto labelling",
        description: "Explore policies that automatically apply sensitivity labels to content.",
        platformIds: ["purview"],
      },
      {
        id: "sensitive-information-types",
        name: "Sensitive Information Types (SITs)",
        description: "Explore policies that identify sensitive information in your organization.",
        platformIds: ["purview"],
      },
    ],
  },
  {
    id: "app-protection",
    name: "App protection",
    description: "Find policies for the types of apps your customer uses.",
    prompt: "Which types of apps do you want to protect?",
    options: [
      {
        id: "oauth-apps",
        name: "OAuth apps",
        description: "Explore Conditional Access policies for OAuth app protection.",
        platformIds: ["conditional-access"],
      },
      {
        id: "desktop-apps",
        name: "Desktop apps",
        description: "Explore policies for Windows and macOS desktop apps.",
        platformIds: ["windows-11", "macos"],
      },
      {
        id: "mobile-apps",
        name: "Mobile apps",
        description: "Explore policies for iOS/iPadOS and Android apps.",
        platformIds: ["ios-ipados", "android"],
      },
      {
        id: "on-premises-apps",
        name: "On-premises app protection",
        description: "Explore the Conditional Access repository for upcoming on-premises app protection.",
        platformIds: ["conditional-access"],
        comingSoon: true,
      },
      {
        id: "cloud-apps",
        name: "Cloud apps",
        description: "Explore policies for Windows, Windows Server, macOS, and Conditional Access.",
        platformIds: ["windows-11", "windows-servers", "macos", "conditional-access"],
      },
    ],
  },
] as const satisfies readonly SecurityGoal[];

export type SecurityGoalId = (typeof securityGoals)[number]["id"];

export const identityAndAccessGoalIds: readonly SecurityGoalId[] = [
  "conditional-access",
  "administrator-protection",
];

export const securityGoalNavigation = [
  {
    ...securityGoals[0],
    comingSoon: true,
    repositoryUrl: "https://github.com/CoC-MS/CoC-MS-ALSO-Microsoft-Security-AttackPrevention",
  },
  {
    id: "identity-and-access" as const,
    name: "Identity and Access",
    description: "Explore Conditional Access and administrator protection policies.",
  },
  ...securityGoals.filter((goal) =>
    goal.id !== securityGoals[0].id && !identityAndAccessGoalIds.includes(goal.id),
  ),
] as const;

export function getLicensingPrerequisiteTitle(categoryNames: readonly string[]): string {
  const names = [...new Set(categoryNames)];
  return `${names.length > 0 ? names.join(", ") : "Selected policies"} licensing prerequisites`;
}

const endpointFullExperienceLicenseIds = new Set<License["id"]>([
  "e7",
  "e5",
  "e3-defender",
  "e3-defender-purview",
  "f3-defender",
  "f3-defender-purview",
  "f1-defender",
  "f1-defender-purview",
  "business-premium-defender",
  "business-premium-defender-purview",
]);

const endpointIntuneFullLicenseIds = new Set<License["id"]>([
  "e7",
  "e5",
  "e3",
  "e3-defender",
  "e3-purview",
  "e3-defender-purview",
  "business-premium",
  "business-premium-defender",
  "business-premium-purview",
  "business-premium-defender-purview",
]);

const frontlineUnsupportedDefenderPlatforms = new Set<Platform["id"]>([
  "macos",
  "ios-ipados",
  "android",
  "linux-desktop",
  "linux-server",
]);

const dataSecurityFullExperienceLicenseIds = new Set<License["id"]>([
  "e7",
  "e5",
  "e3-purview",
  "e3-defender-purview",
  "business-premium-purview",
  "business-premium-defender-purview",
]);

const fullSensitivityLabelsLicenseIds = new Set<License["id"]>([
  "business-premium",
  "business-premium-defender",
  "e3",
  "e3-defender",
  "f3",
  "f3-defender",
  "f1",
  "f1-defender",
]);

const flwPurviewSuiteLicenseIds = new Set<License["id"]>([
  "f1-purview",
  "f1-defender-purview",
  "f3-purview",
  "f3-defender-purview",
]);

const f1LicenseIds = new Set<License["id"]>([
  "f1",
  "f1-defender",
  "f1-purview",
  "f1-defender-purview",
]);

export function getConditionalAccessCategoryLicenseNote(
  optionIds: readonly string[],
  licenseIds: readonly License["id"][],
): { title: string; message: string; includePlanComparisons: boolean } | undefined {
  const eligibleLicenseIds = licenseIds.filter(isLicenseEligible);
  if (eligibleLicenseIds.length === 0) return undefined;
  const selected = getSecurityGoalOptions("conditional-access").filter(
    (option) => !option.comingSoon && optionIds.includes(option.id),
  );
  const needsAgent365 = selected.some((option) => option.id === "agent-policies") &&
    !eligibleLicenseIds.includes("e7");
  const needsGlobalSecureAccess = selected.some((option) => option.id === "global-secure-access-policies") &&
    !eligibleLicenseIds.includes("e7");
  const needsEntraP2 = selected.some((option) =>
    option.id !== "agent-policies" && option.id !== "global-secure-access-policies",
  ) &&
    !hasEntraIdP2(eligibleLicenseIds);
  if (!needsAgent365 && !needsEntraP2 && !needsGlobalSecureAccess) return undefined;
  const suiteAddOns = [
    ...(eligibleLicenseIds.some((id) => id.startsWith("business-premium"))
      ? ["Microsoft Defender Suite for Business Premium"]
      : []),
    ...(eligibleLicenseIds.some((id) => id.startsWith("e3"))
      ? ["Microsoft Defender Suite for Microsoft 365 E3"]
      : []),
    ...(eligibleLicenseIds.some((id) => id.startsWith("f1") || id.startsWith("f3"))
      ? ["Microsoft Defender Suite FLW for Microsoft 365 F1/F3"]
      : []),
  ];
  const messages = [
    ...(needsEntraP2
      ? [`Some of these policies require Microsoft Entra ID P2. Add the Microsoft Entra ID P2 add-on, or get it with ${suiteAddOns.join(" or ")}.`]
      : []),
    ...(needsAgent365 ? [AGENT_POLICY_NOTE] : []),
    ...(needsGlobalSecureAccess
      ? ["Some Global Secure Access policies may require Global Secure Access Internet Access or Private Access licenses. These are also included in Microsoft Entra Suite, which is included in Microsoft 365 E7."]
      : []),
  ];
  return {
    title: "Conditional Access licensing prerequisites",
    message: messages.join(" "),
    includePlanComparisons: true,
  };
}

export function getDesktopAppLicenseNote(
  licenseIds: readonly License["id"][],
  platformId: Platform["id"],
): { title: string; message: string; includePlanComparisons: boolean } | undefined {
  return getWindowsIntuneSuiteLicenseNote(licenseIds, platformId, "desktop app protection");
}

export function getAdministratorProtectionLicenseNote(
  licenseIds: readonly License["id"][],
  platformId: Platform["id"],
): { title: string; message: string; includePlanComparisons: boolean } | undefined {
  return getWindowsIntuneSuiteLicenseNote(licenseIds, platformId, "administrator protection");
}

function getWindowsIntuneSuiteLicenseNote(
  licenseIds: readonly License["id"][],
  platformId: Platform["id"],
  scenario: string,
): { title: string; message: string; includePlanComparisons: boolean } | undefined {
  const eligibleLicenseIds = licenseIds.filter(isLicenseEligible);
  if (
    platformId !== "windows-11" ||
    eligibleLicenseIds.length === 0 ||
    eligibleLicenseIds.some((id) => id === "e5" || id === "e7")
  ) return undefined;
  return {
    title: `Limited Windows ${scenario} experience`,
    message: `Add the Microsoft Intune Suite add-on for the full Windows ${scenario} experience. Microsoft Intune Suite is included in Microsoft 365 E5 and Microsoft 365 E7, which provide the full experience.`,
    includePlanComparisons: true,
  };
}

export function getOnPremisesAppLicenseNote(
  licenseIds: readonly License["id"][],
): { title: string; message: string; includePlanComparisons: boolean } | undefined {
  const eligibleLicenseIds = licenseIds.filter(isLicenseEligible);
  if (eligibleLicenseIds.length === 0 || eligibleLicenseIds.includes("e7")) return undefined;
  return {
    title: "On-premises app protection licensing prerequisites",
    message: "On-premises app protection requires a Global Secure Access Private Access license. Private Access is also included in Microsoft Entra Suite or Microsoft 365 E7.",
    includePlanComparisons: true,
  };
}

export function isSecurityGoalOptionAvailable(
  goalId: SecurityGoalId,
  optionId: string,
  licenseIds: readonly License["id"][],
): boolean {
  const option = getSecurityGoalOptions(goalId).find((item) => item.id === optionId);
  if (option?.comingSoon && !option.allowRepositoryPreview) return false;
  if (
    goalId === "endpoint-protection" &&
    option?.endpointFeature === "defender"
  ) {
    const eligibleLicenseIds = licenseIds.filter(isLicenseEligible);
    const hasFullDefenderLicense = eligibleLicenseIds.some((licenseId) =>
      endpointFullExperienceLicenseIds.has(licenseId),
    );
    const frontlineOnly =
      eligibleLicenseIds.length > 0 &&
      eligibleLicenseIds.every((licenseId) =>
        licenseId.startsWith("f1") || licenseId.startsWith("f3"),
      );

    if (frontlineOnly && !hasFullDefenderLicense) {
      if (eligibleLicenseIds.some((licenseId) => licenseId.startsWith("f1"))) {
        return false;
      }

      if (
        option.platformIds.some((platformId) =>
          frontlineUnsupportedDefenderPlatforms.has(platformId),
        ) ||
        option.id.includes("defender-onboarding")
      ) {
        return false;
      }
    }
  }

  if (goalId !== "data-protection") {
    return true;
  }

  const eligibleLicenseIds = licenseIds.filter(isLicenseEligible);
  if (eligibleLicenseIds.some((licenseId) =>
    dataSecurityFullExperienceLicenseIds.has(licenseId),
  )) {
    return true;
  }

  if (
    optionId !== "sensitivity-labels" &&
    eligibleLicenseIds.length > 0 &&
    eligibleLicenseIds.every((licenseId) => f1LicenseIds.has(licenseId)) &&
    !eligibleLicenseIds.some((licenseId) =>
      flwPurviewSuiteLicenseIds.has(licenseId),
    )
  ) {
    return false;
  }

  if (
    optionId === "endpoint-dlp" &&
    eligibleLicenseIds.length > 0 &&
    eligibleLicenseIds.every((licenseId) =>
      licenseId.startsWith("f1") || licenseId.startsWith("f3"),
    ) &&
    eligibleLicenseIds.some((licenseId) =>
      flwPurviewSuiteLicenseIds.has(licenseId),
    )
  ) {
    return false;
  }

  return true;
}

export function getEndpointFeatureLicenseNote(
  feature: SolutionOption["endpointFeature"],
  licenseIds: readonly License["id"][],
  platformId?: Platform["id"],
): string | undefined {
  if (!feature) return undefined;

  const eligibleLicenseIds = licenseIds.filter(isLicenseEligible);
  if (eligibleLicenseIds.length === 0) return undefined;
  if (eligibleLicenseIds.some((licenseId) =>
    endpointFullExperienceLicenseIds.has(licenseId),
  )) {
    return undefined;
  }

  if (eligibleLicenseIds.every((licenseId) => licenseId.startsWith("f1"))) {
    return feature === "defender"
      ? "Microsoft 365 F1 does not support Microsoft Defender settings. Automated onboarding to Defender is not eligible with this license."
      : "Microsoft 365 F1 supports Intune configuration settings only. Microsoft Defender security policy settings are not supported with F1 licensing.";
  }

  if (eligibleLicenseIds.every((licenseId) => licenseId.startsWith("f3"))) {
    if (
      feature === "defender" &&
      platformId &&
      frontlineUnsupportedDefenderPlatforms.has(platformId)
    ) {
      return `Microsoft 365 F3 does not support Microsoft Defender settings on ${getPlatform(platformId).name}. Automated onboarding to Defender is not eligible with this license.`;
    }
    return feature === "defender"
      ? "Microsoft 365 F3 supports only Defender Antimalware, Microsoft Defender Firewall, Exploit Guard, Credential Guard, BitLocker, and BitLocker To Go. Other Defender-related configurations may require additional licensing."
      : undefined;
  }

  if (feature === "defender") {
    return "Add Microsoft Defender Suite to unlock the full Defender policy experience for this category.";
  }

  if (eligibleLicenseIds.every((licenseId) =>
    licenseId.startsWith("e3") ||
    licenseId.startsWith("business-premium"),
  )) {
    return "The selected licenses support Intune settings. Add Microsoft Defender Suite for the full Defender security policy experience.";
  }

  return undefined;
}

export function getDataSecurityLicenseNote(
  licenseIds: readonly License["id"][],
): string | undefined {
  const eligibleLicenseIds = licenseIds.filter(isLicenseEligible);
  if (eligibleLicenseIds.length === 0) return undefined;
  if (
    eligibleLicenseIds.some((licenseId) =>
      dataSecurityFullExperienceLicenseIds.has(licenseId),
    )
  ) {
    return undefined;
  }

  if (
    eligibleLicenseIds.length > 0 &&
    eligibleLicenseIds.every((licenseId) => f1LicenseIds.has(licenseId)) &&
    !eligibleLicenseIds.some((licenseId) =>
      flwPurviewSuiteLicenseIds.has(licenseId),
    )
  ) {
    return "Microsoft 365 F1 supports Sensitivity labels only. Add Microsoft Purview Suite FLW for additional Data Security capabilities with limitations; eDLP policies are not included.";
  }

  if (
    eligibleLicenseIds.length > 0 &&
    eligibleLicenseIds.every((licenseId) =>
      licenseId.startsWith("f1") || licenseId.startsWith("f3"),
    ) &&
    eligibleLicenseIds.some((licenseId) =>
      flwPurviewSuiteLicenseIds.has(licenseId),
    )
  ) {
    return "Microsoft Purview Suite FLW supports Data Security with limitations; eDLP policies are not included.";
  }

  if (
    eligibleLicenseIds.some((licenseId) =>
      ["business-premium", "business-premium-defender", "e3", "e3-defender"].includes(licenseId),
    )
  ) {
    const addOns = [
      ...(eligibleLicenseIds.some((licenseId) => licenseId.startsWith("e3"))
        ? ["Microsoft Purview Suite for Microsoft 365 E3"]
        : []),
      ...(eligibleLicenseIds.some((licenseId) => licenseId.startsWith("business-premium"))
        ? ["Microsoft Purview Suite for Business Premium"]
        : []),
    ];
    return `The selected licenses provide Data Security with limitations, without the full DLP and auto-labelling experience. Add ${addOns.join(" or ")} for the full Data Security experience.`;
  }

  return "The selected frontline licenses provide Data Security with limitations. Add Microsoft Purview Suite FLW for additional Data Security capabilities; eDLP policies are not included with this add-on.";
}

export function getSecurityGoalOptionExperience(
  goalId: SecurityGoalId,
  licenseIds: readonly License["id"][],
  platformIds: readonly Platform["id"][],
  optionId?: string,
): "full" | "limited" {
  if (goalId === "administrator-protection" &&
    platformIds.some((platformId) => getAdministratorProtectionLicenseNote(licenseIds, platformId))) {
    return "limited";
  }
  if (goalId === "app-protection" && optionId === "mobile-apps") {
    return licenseIds.some(isLicenseEligible) ? "full" : "limited";
  }
  if (goalId === "app-protection" && optionId === "desktop-apps") {
    if (!licenseIds.some(isLicenseEligible)) return "limited";
    return platformIds.some((platformId) =>
      getDesktopAppLicenseNote(licenseIds, platformId),
    ) ? "limited" : "full";
  }
  if (goalId === "app-protection" && optionId === "on-premises-apps") {
    return getOnPremisesAppLicenseNote(licenseIds) ? "limited" : "full";
  }
  if (goalId === "conditional-access") {
    return getConditionalAccessCategoryLicenseNote(
      optionId ? [optionId] : getSecurityGoalOptions(goalId).map((option) => option.id),
      licenseIds,
    ) ? "limited" : "full";
  }
  if (
    goalId === "data-protection" &&
    optionId === "sensitivity-labels" &&
    licenseIds.some((licenseId) =>
      fullSensitivityLabelsLicenseIds.has(licenseId),
    )
  ) {
    return "full";
  }

  if (goalId === "endpoint-protection" && optionId) {
    const option = getSecurityGoalOptions(goalId).find((item) => item.id === optionId);
    if (option?.endpointFeature === "intune") {
      return licenseIds.some((licenseId) =>
        endpointFullExperienceLicenseIds.has(licenseId) ||
        endpointIntuneFullLicenseIds.has(licenseId),
      )
        ? "full"
        : "limited";
    }
    if (option?.endpointFeature === "defender") {
      return licenseIds.some((licenseId) =>
        endpointFullExperienceLicenseIds.has(licenseId),
      )
        ? "full"
        : "limited";
    }
  }

  if (
    goalId === "data-protection" &&
    licenseIds.some((licenseId) =>
      dataSecurityFullExperienceLicenseIds.has(licenseId),
    )
  ) {
    return "full";
  }
  if (goalId === "data-protection") {
    return "limited";
  }

  return platformIds.some(
    (platformId) =>
      !(goalId === "attack-protection" && platformId === "conditional-access") &&
      getPlatformExperienceForLicenses(licenseIds, platformId) === "limited",
  )
    ? "limited"
    : "full";
}

export function getLimitedExperienceSelections<T extends SolutionOption & { goalId: SecurityGoalId }>(
  selections: readonly T[],
  licenseIds: readonly License["id"][],
  platformId: Platform["id"],
): T[] {
  return selections.filter((option) =>
    !option.children?.length &&
    option.platformIds.includes(platformId) &&
    getSecurityGoalOptionExperience(
      option.goalId,
      licenseIds,
      [platformId],
      option.id,
    ) === "limited",
  );
}

export function toggleSecurityGoalSelection(
  selected: readonly SecurityGoalId[],
  goalId: SecurityGoalId,
): SecurityGoalId[] {
  return selected.includes(goalId)
    ? selected.filter((selectedId) => selectedId !== goalId)
    : [...selected, goalId];
}

export function getSecurityGoal(goalId: SecurityGoalId): SecurityGoal {
  const goal = securityGoals.find((item) => item.id === goalId);
  if (!goal) {
    throw new Error(`Unknown security goal: ${goalId}`);
  }
  return goal;
}

export function getSecurityGoalOptions(goalId: SecurityGoalId): SolutionOption[] {
  return getSecurityGoal(goalId).options.flatMap((option) => [
    option,
    ...(option.children ?? []),
  ]);
}

export function getSecurityGoalOptionChildren(
  option: SolutionOption,
): readonly SolutionOption[] {
  return option.children ?? [];
}

export function getSolutionPlatformIds(
  goalId: SecurityGoalId,
  optionIds: readonly string[],
): Platform["id"][] {
  const selectedOptions = getSecurityGoalOptions(goalId).filter((option) =>
    (!option.comingSoon || option.allowRepositoryPreview) &&
    (option.autoSelect || optionIds.includes(option.id)),
  );
  return [...new Set(selectedOptions.flatMap((option) => option.platformIds))];
}

export function getRecommendedPolicyIds(
  goalId: SecurityGoalId,
  optionIds: readonly string[],
  platformId: Platform["id"],
): string[] {
  if (platformId !== "conditional-access") return [];
  return [...new Set(
    getSecurityGoalOptions(goalId)
      .filter((option) =>
        !option.comingSoon &&
        (option.autoSelect || optionIds.includes(option.id)) &&
        option.platformIds.includes(platformId),
      )
      .flatMap((option) => option.recommendedPolicyIds ?? []),
  )];
}
