import type { Platform } from "./catalog";

export interface SolutionOption {
  id: string;
  name: string;
  description: string;
  platformIds: readonly Platform["id"][];
  recommendedPolicyIds?: readonly string[];
  recommendedPolicyNote?: string;
}

export interface SecurityGoal {
  id: string;
  name: string;
  description: string;
  prompt: string;
  options: readonly SolutionOption[];
}

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
      },
      {
        id: "token-theft",
        name: "Token theft attacks",
        description: "Help reduce the risk of stolen authentication tokens being used to access accounts and devices.",
        platformIds: ["conditional-access", "macos", "windows-11"],
        recommendedPolicyIds: ["CA105", "CA107"],
      },
      {
        id: "aitm-phishing",
        name: "AiTM (Adversary-in-the-middle) phishing attacks",
        description: "Strengthen access controls against phishing proxies that attempt to capture credentials and session tokens.",
        platformIds: ["conditional-access"],
        recommendedPolicyIds: ["CA105", "CA107"],
      },
      {
        id: "password-spray",
        name: "Password spray attacks",
        description: "Apply access policies that help mitigate attempts to sign in with commonly used passwords across many accounts.",
        platformIds: ["conditional-access"],
        recommendedPolicyIds: ["CA002", "CA000"],
      },
      {
        id: "brute-force",
        name: "Brute force attacks",
        description: "Use identity and server security policies to help reduce repeated password-guessing attempts.",
        platformIds: ["conditional-access", "windows-servers"],
        recommendedPolicyIds: ["CA002", "CA000"],
      },
    ],
  },
  {
    id: "administrator-protection",
    name: "Administrator protection",
    description: "Strengthen protection for administrator accounts with Conditional Access policies.",
    prompt: "Explore recommended administrator protection policies",
    options: [
      {
        id: "administrator-protection-policies",
        name: "Administrator protection policies",
        description: "Review Conditional Access policies designed to protect administrator accounts and privileged access.",
        platformIds: ["conditional-access"],
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
        recommendedPolicyNote: "CA106 requires Microsoft Entra ID Plan 2.",
      },
    ],
  },
  {
    id: "endpoint-protection",
    name: "Endpoint protection",
    description: "Explore endpoint security policies for the devices and operating systems you manage.",
    prompt: "Which endpoint platforms do you need to protect?",
    options: [
      { id: "endpoint-windows", name: "Windows", description: "Windows endpoint policies.", platformIds: ["windows-11"] },
      { id: "endpoint-macos", name: "macOS", description: "macOS endpoint policies.", platformIds: ["macos"] },
      { id: "endpoint-windows-server", name: "Windows Server", description: "Windows Server security policies.", platformIds: ["windows-servers"] },
      { id: "endpoint-linux-server", name: "Linux Server", description: "Linux Server security policies.", platformIds: ["linux-server"] },
      { id: "endpoint-linux-desktop", name: "Linux Desktop", description: "Linux Desktop security policies.", platformIds: ["linux-desktop"] },
      { id: "endpoint-ios-ipados", name: "iOS/iPadOS", description: "iOS and iPadOS endpoint policies.", platformIds: ["ios-ipados"] },
      { id: "endpoint-android", name: "Android", description: "Android endpoint policies.", platformIds: ["android"] },
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
        platformIds: ["ai-security", "ai-security-macos"],
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
    id: "endpoint-management",
    name: "Endpoint management",
    description: "Find device management templates for mobile phones and managed endpoints.",
    prompt: "What type of endpoint management are you working on?",
    options: [
      {
        id: "mobile-phone-management",
        name: "Mobile phone management",
        description: "Manage Android and iOS/iPadOS devices.",
        platformIds: ["android", "ios-ipados"],
      },
      {
        id: "device-management",
        name: "Device management",
        description: "Manage Windows, macOS, and Linux Desktop devices.",
        platformIds: ["windows-11", "macos", "linux-desktop"],
      },
    ],
  },
  {
    id: "data-protection",
    name: "Data protection",
    description: "Explore Microsoft Purview policies for protecting organizational data.",
    prompt: "Explore data protection templates",
    options: [
      {
        id: "purview-data-protection",
        name: "Microsoft Purview",
        description: "Discover policies for data protection and compliance.",
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
        description: "Explore Conditional Access policies for OAuth app access.",
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
        id: "cloud-apps",
        name: "Cloud apps",
        description: "Explore policies for Windows, Windows Server, macOS, and Conditional Access.",
        platformIds: ["windows-11", "windows-servers", "macos", "conditional-access"],
      },
    ],
  },
] as const satisfies readonly SecurityGoal[];

export type SecurityGoalId = (typeof securityGoals)[number]["id"];

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

export function getSolutionPlatformIds(
  goalId: SecurityGoalId,
  optionIds: readonly string[],
): Platform["id"][] {
  const selectedOptions = getSecurityGoal(goalId).options.filter((option) =>
    optionIds.includes(option.id),
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
    getSecurityGoal(goalId).options
      .filter((option) =>
        optionIds.includes(option.id) && option.platformIds.includes(platformId),
      )
      .flatMap((option) => option.recommendedPolicyIds ?? []),
  )];
}
