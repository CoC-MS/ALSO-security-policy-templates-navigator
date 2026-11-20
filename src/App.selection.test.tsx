// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { getPlatform, getPlatformRepositories } from "./catalog";
import { getRelatedSiteUrl, secureByDefaultUrl } from "./relatedSites";
import { securityGoalNavigation } from "./solutionCatalog";

let container: HTMLDivElement;
let root: Root;

function choice(name: string): HTMLButtonElement {
  const button = [...container.querySelectorAll<HTMLButtonElement>("button")]
    .find((item) => item.querySelector(".choice-name")?.textContent === name);
  expect(button, `choice ${name}`).toBeDefined();
  return button!;
}

async function click(button: HTMLButtonElement) {
  expect(button.disabled).toBe(false);
  await act(async () => button.click());
}

async function clickChoices(names: string[]) {
  const buttons = names.map(choice);
  for (const button of buttons) expect(button.disabled).toBe(false);
  await act(async () => buttons.forEach((button) => button.click()));
}

async function action(text: string) {
  const button = [...container.querySelectorAll<HTMLButtonElement>("button")]
    .find((item) => item.textContent?.trim().startsWith(text));
  expect(button, `action ${text}`).toBeDefined();
  await click(button!);
}

function expectSelectedGoals(names: string[]) {
  const summary = container.querySelector('[aria-label="Your selected security goals"]');
  expect(summary).not.toBeNull();
  expect([...summary!.querySelectorAll(".selection-pill")]
    .map((pill) => pill.textContent?.replace("✓", "").trim())).toEqual(names);
}

async function selectLicensedGoals(names: string[], license = "Microsoft 365 E7") {
  await click(choice(license));
  await action("Continue with 1 license plan");
  for (const name of names) await click(choice(name));
  await action(`Continue with ${names.length} security goal`);
}

async function browseGoals(names: string[]) {
  await action("Skip license selection");
  for (const name of names) await click(choice(name));
  await action(`Continue with ${names.length} security goal`);
}

async function openCategories() {
  const categoryButton = [...container.querySelectorAll<HTMLButtonElement>("button")]
    .find((button) => button.textContent?.trim().startsWith("Choose policy categories"));
  if (!categoryButton) return false;
  await click(categoryButton);
  expect(container.querySelector("h1")?.textContent).toBe("Choose policy categories");
  return true;
}

async function openResults() {
  await action("View recommendations");
  expect(container.querySelector("h1")?.textContent)
    .toBe("Recommended security policy templates");
}

function expectLicensingNotEvaluated() {
  expect(container.textContent).toContain("Licensing not evaluated");
  expect(container.querySelector('[aria-label="Selected eligible licenses"]')).toBeNull();
  expect(container.querySelector(".experience-badge.full, .experience-badge.limited")).toBeNull();
  expect(container.querySelector(".license-requirement-note:not(.licensing-disclaimer)")).toBeNull();
  expect(container.textContent).not.toContain("Recommendations will be matched to the selected licenses");
}

beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ generatedAt: "", repositories: [] }),
  }));
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<App />));
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe("scenario and category navigation", () => {
  it.each([
    ["Automated Discovery and Deployment", secureByDefaultUrl],
    ["Security fundamentals", getRelatedSiteUrl("readiness", "en")],
    ["Copilot Readiness", getRelatedSiteUrl("readiness", "en")],
  ])("takes direct-resource goal %s from scenarios directly to recommendations", async (goal, resultUrl) => {
    await selectLicensedGoals([goal]);
    expect(container.querySelector("h1")?.textContent)
      .toBe("Choose the scenarios and platforms to include");
    expect([...container.querySelectorAll(".steps .step-item strong")].map((step) => step.textContent))
      .toEqual(["Licenses", "Security challenges", "Recommended templates"]);
    const scenarioSection = container.querySelector(".goal-option-section")!;
    expect(scenarioSection.querySelector(".included-goal-card")).not.toBeNull();
    expect(scenarioSection.querySelector("button, a")).toBeNull();
    expect(await openCategories()).toBe(false);
    await openResults();
    expect([...container.querySelectorAll<HTMLAnchorElement>(".repository-link")]
      .map((link) => link.href)).toContain(resultUrl);
  });

  it("shows selected AI and app scenarios as compact summaries only when another goal needs categories", async () => {
    await selectLicensedGoals(["Endpoint protection", "AI and Agent Security", "App protection"]);
    await clickChoices(["Windows", "AI Security", "Agent Security", "OAuth apps", "Desktop apps"]);
    expect(await openCategories()).toBe(true);

    expect([...container.querySelectorAll(".category-option-summary .selection-pill")]
      .map((summary) => summary.textContent?.replace("✓", "").trim()))
      .toEqual(["AI Security", "Agent Security", "OAuth apps", "Desktop apps"]);
    expect(container.querySelector(".category-option-summary .choice-card, .category-option-summary button"))
      .toBeNull();
    expect([...container.querySelectorAll<HTMLButtonElement>(".goal-option-sections button .choice-name")]
      .map((item) => item.textContent))
      .not.toEqual(expect.arrayContaining(["AI Security", "Agent Security", "OAuth apps", "Desktop apps"]));
  });

  it("keeps all selected goal sections in numbered order without a duplicate Identity scenario page", async () => {
    const selected = [
      "AI and Agent Security", "Endpoint protection", "Identity and Access",
      "Attack prevention", "App protection", "Data Security",
    ];
    await selectLicensedGoals(selected);
    const ordered = [
      "Attack prevention", "Identity and Access", "Endpoint protection",
      "AI and Agent Security", "Data Security", "App protection",
    ];
    expectSelectedGoals(ordered);
    expect([...container.querySelectorAll(".goal-option-sections > .goal-option-section > h2")]
      .map((heading) => heading.textContent)).toEqual(ordered);

    await clickChoices([
      "Device code phishing attacks", "Administrator protection", "Windows",
      "AI Security", "Desktop apps", "Retention",
    ]);
    expect(await openCategories()).toBe(true);
    expectSelectedGoals(ordered);
    expect([...container.querySelectorAll(".goal-option-sections > .goal-option-section > h2")]
      .map((heading) => heading.textContent)).toEqual(ordered);
    expect([...container.querySelectorAll(".category-option-summary .selection-pill")]
      .some((summary) => summary.textContent?.includes("Retention"))).toBe(true);
    expect([...container.querySelectorAll<HTMLButtonElement>(".goal-option-sections button .choice-name")]
      .map((item) => item.textContent)).not.toContain("Retention");
    await click(choice("Antivirus (AV)"));
    await openResults();
    expectSelectedGoals(ordered);
  });

  it("requires an Identity choice and takes Administrator protection directly to recommendations", async () => {
    await selectLicensedGoals(["Identity and Access"]);
    expect(container.querySelectorAll("#identity-and-access-heading")).toHaveLength(1);
    expect(choice("Conditional Access").getAttribute("aria-pressed")).toBe("false");
    expect(choice("Administrator protection").getAttribute("aria-pressed")).toBe("false");
    expect([...container.querySelectorAll<HTMLButtonElement>(".actions button.primary")]
      .some((button) => button.disabled)).toBe(true);

    await click(choice("Administrator protection"));
    expect(await openCategories()).toBe(false);
    expect(choice("Administrator protection").getAttribute("aria-pressed")).toBe("true");
    await openResults();
    expectSelectedGoals(["Identity and Access"]);
  });

  it("selects Data Security categories on scenarios and Conditional Access categories on the category stage", async () => {
    await selectLicensedGoals(["Identity and Access", "Data Security"]);
    await click(choice("Conditional Access"));
    await click(choice("Retention"));
    const scenarioChoices = [...container.querySelectorAll<HTMLButtonElement>("button .choice-name")]
      .map((item) => item.textContent);
    expect(scenarioChoices).not.toContain("Administrator policies");
    expect(scenarioChoices).toContain("Retention");
    expect(container.querySelector("#retention-heading")).toBeNull();
    expect(await openCategories()).toBe(true);
    expect(choice("Administrator policies").disabled).toBe(false);
    expect(container.querySelector(".category-option-summary .selection-pill")?.textContent)
      .toContain("Retention");
    expect([...container.querySelectorAll<HTMLButtonElement>(".goal-option-sections button .choice-name")]
      .map((item) => item.textContent)).not.toContain("Retention");
    expect([...container.querySelectorAll<HTMLButtonElement>(".actions button.primary")]
      .some((button) => button.disabled)).toBe(true);
    await click(choice("Administrator policies"));
    await openResults();
    expectSelectedGoals(["Identity and Access", "Data Security"]);
  });

  it("requires Data Security categories on the scenarios page without adding a separate category step", async () => {
    await selectLicensedGoals(["Data Security"]);
    const continueButton = [...container.querySelectorAll<HTMLButtonElement>("button.primary")]
      .find((button) => button.textContent?.includes("Data Security category"));
    expect(continueButton?.disabled).toBe(true);
    await click(choice("Retention"));
    expect(await openCategories()).toBe(false);
    await openResults();
    expectSelectedGoals(["Data Security"]);
  });

  it("requires a scenario, endpoint platform, and categories where those goals need them", async () => {
    await selectLicensedGoals(["Attack prevention", "Endpoint protection", "App protection"]);
    const continueButton = [...container.querySelectorAll<HTMLButtonElement>("button.primary")]
      .find((button) => button.textContent?.includes("Select at least one endpoint platform"));
    expect(continueButton?.disabled).toBe(true);
    await clickChoices(["ClickFix attacks", "Windows", "Desktop apps"]);
    expect(await openCategories()).toBe(true);
    expect(choice("Antivirus (AV)").disabled).toBe(false);
    expect([...container.querySelectorAll<HTMLButtonElement>("button.primary")]
      .find((button) => button.textContent?.includes("Choose a category"))?.disabled).toBe(true);
    await click(choice("Antivirus (AV)"));
    await openResults();
  });

  it("shows endpoint child categories and preserves them through Back and deselection", async () => {
    await selectLicensedGoals(["Endpoint protection", "App protection"]);
    await clickChoices(["Windows", "Desktop apps"]);
    expect(await openCategories()).toBe(true);
    expect([...container.querySelectorAll(".steps .step-item strong")].map((step) => step.textContent))
      .toEqual(["Licenses", "Security challenges", "Recommended templates"]);
    await click(choice("Remediation Scripts"));
    await action("← Back to scenarios");
    expect(choice("Desktop apps").getAttribute("aria-pressed")).toBe("true");
    await action("Choose policy categories");
    expect(choice("Remediation Scripts").getAttribute("aria-pressed")).toBe("true");
    await action("← Back to scenarios");
    await action("← Back");
    await click(choice("Endpoint protection"));
    await action("Continue with 1 security goal");
    expectSelectedGoals(["App protection"]);
    expect(choice("Desktop apps").getAttribute("aria-pressed")).toBe("true");
  });

  it("preserves Skip-mode re-entry and clears all choices on Start over", async () => {
    await browseGoals(["App protection", "Copilot Readiness"]);
    await click(choice("Desktop apps"));
    expect(await openCategories()).toBe(false);
    await openResults();
    await action("← Back to scenarios");
    await action("← Back");
    await action("← Back");
    await action("Skip license selection");
    expect(choice("App protection").getAttribute("aria-pressed")).toBe("true");
    await action("Continue with 2 security goals");
    expect(choice("Desktop apps").getAttribute("aria-pressed")).toBe("true");
    expect(await openCategories()).toBe(false);
    await openResults();
    expectLicensingNotEvaluated();
    await action("Start over");
    expect(container.querySelector("h1")?.textContent)
      .toBe("Which Microsoft 365 licenses does your customer have?");
    expect(container.textContent).not.toContain("Licensing not evaluated");
  });

  it("preserves scenario and category selections after returning to an unchanged license context", async () => {
    await selectLicensedGoals(["Endpoint protection", "Data Security", "App protection"]);
    await clickChoices(["Windows", "Desktop apps", "Retention"]);
    expect(await openCategories()).toBe(true);
    await click(choice("Antivirus (AV)"));
    await action("← Back to scenarios");
    await action("← Back");
    await action("← Back");
    await action("Continue with 1 license plan");

    expect(choice("Endpoint protection").getAttribute("aria-pressed")).toBe("true");
    expect(choice("Data Security").getAttribute("aria-pressed")).toBe("true");
    expect(choice("App protection").getAttribute("aria-pressed")).toBe("true");
    await action("Continue with 3 security goals");
    expect(choice("Windows").getAttribute("aria-pressed")).toBe("true");
    expect(choice("Desktop apps").getAttribute("aria-pressed")).toBe("true");
    expect(choice("Retention").getAttribute("aria-pressed")).toBe("true");
    expect(await openCategories()).toBe(true);
    expect(choice("Antivirus (AV)").getAttribute("aria-pressed")).toBe("true");
    expect(container.querySelector(".category-option-summary .selection-pill")?.textContent)
      .toContain("Retention");
  });

  it("restores normal license evaluation after Skip mode without retaining Skip-mode selections", async () => {
    await browseGoals(["App protection"]);
    await click(choice("Desktop apps"));
    await action("← Back");
    await action("← Back");
    await click(choice("Microsoft 365 E7"));
    await action("Continue with 1 license plan");
    expect(container.textContent).not.toContain("Licensing not evaluated");
    expect(choice("App protection").getAttribute("aria-pressed")).toBe("false");
    await click(choice("App protection"));
    await action("Continue with 1 security goal");
    expect(choice("Desktop apps").getAttribute("aria-pressed")).toBe("false");
  });
});

describe("existing license-specific category behavior", () => {
  it("retains Business Premium Remediation Scripts guidance in final recommendations", async () => {
    await selectLicensedGoals(["Endpoint protection"], "Microsoft 365 Business Premium");
    await click(choice("Windows"));
    await openCategories();
    expect(choice("Remediation Scripts").querySelector(".experience-badge")?.textContent)
      .toBe("Limited experience");
    await click(choice("Remediation Scripts"));
    await openResults();
    const note = container.querySelector(".license-requirement-note:not(.licensing-disclaimer)");
    expect(note?.textContent).toContain("Remediation Scripts with limited experience");
    expect(note?.textContent).toContain("Windows Enterprise E3 or E5");
  });

  it("keeps F1 Sensitive Information Types gated on the Data Security scenario page", async () => {
    await selectLicensedGoals(["Data Security"], "Microsoft 365 F1");
    expect(choice("Sensitive Information Types (SITs)").disabled).toBe(true);
    expect(choice("Retention").disabled).toBe(false);
    await click(choice("Retention"));
    expect(await openCategories()).toBe(false);
    await openResults();
    expectSelectedGoals(["Data Security"]);
  });
});

describe("Attack prevention scenarios", () => {
  it.each([
    ["Device code phishing attacks", ["conditional-access"]],
    ["ClickFix attacks", ["windows-11", "macos"]],
    ["Ransomware attacks", ["windows-11", "macos", "windows-servers"]],
    ["Token theft attacks", ["conditional-access", "macos", "windows-11"]],
    ["AiTM (Adversary-in-the-middle) phishing attacks", ["conditional-access"]],
    ["Password spray attacks", ["conditional-access"]],
    ["Brute force attacks", ["conditional-access", "windows-servers"]],
  ] as const)("recommends existing resources for %s", async (attack, platformIds) => {
    await browseGoals(["Attack prevention"]);
    expect(choice(attack).disabled).toBe(false);
    await click(choice(attack));
    await openCategories();
    await openResults();
    expect(container.querySelector(".goal-option-grid")).toBeNull();
    const links = [...container.querySelectorAll<HTMLAnchorElement>(".repository-link")]
      .map((link) => link.href);
    expect(links).toContain(getRelatedSiteUrl("attackPrevention", "en"));
    for (const platformId of platformIds) {
      expect(links).toContain(getPlatformRepositories(getPlatform(platformId))[0].url);
    }
  });
});

describe("shared repository availability and license guidance", () => {
  it("retains the Workload ID Premium warning when Agent Security shares Conditional Access with OAuth apps", async () => {
    await selectLicensedGoals(["AI and Agent Security", "App protection"], "Microsoft 365 Business Premium");
    await clickChoices(["Agent Security", "OAuth apps"]);
    await openCategories();
    await openResults();
    expect(container.textContent).toContain("Microsoft Entra Workload ID Premium is required");
    expect(container.textContent).toContain("Microsoft 365 Business Premium");
  });

  it("keeps E7 exempt and does not evaluate Workload ID warnings in Skip mode", async () => {
    await selectLicensedGoals(["App protection"]);
    await click(choice("OAuth apps"));
    await openCategories();
    await openResults();
    expect(container.textContent).not.toContain("Workload ID Premium is required");

    await action("Start over");
    await browseGoals(["App protection"]);
    await click(choice("OAuth apps"));
    await openCategories();
    await openResults();
    expectLicensingNotEvaluated();
  });

  it("keeps the AI Security macOS scope Coming while allowing the shared macOS repository for Desktop apps", async () => {
    await selectLicensedGoals(["AI and Agent Security", "App protection"]);
    await clickChoices(["AI Security", "Desktop apps"]);
    await openCategories();
    await openResults();
    const macosUrl = getPlatformRepositories(getPlatform("macos"))[0].url;
    const macosCard = [...container.querySelectorAll<HTMLElement>(".recommendation-card")]
      .find((card) => card.querySelector<HTMLAnchorElement>(".repository-link")?.href === macosUrl);
    expect(macosCard).toBeDefined();
    expect(macosCard!.querySelector(".coming-soon-badge")?.textContent).toBe("Coming");
    expect(macosCard!.textContent).toContain("AI Security macOS");
    expect(macosCard!.querySelector(".recommendation-reasons")?.textContent)
      .toBe("Recommended for: Desktop apps");
    expect(macosCard!.querySelector<HTMLAnchorElement>(".repository-link")?.href).toBe(macosUrl);
  });

  it("keeps AI Security macOS unavailable when it is the only macOS source", async () => {
    await selectLicensedGoals(["AI and Agent Security"]);
    await click(choice("AI Security"));
    await openCategories();
    await openResults();
    const comingCard = [...container.querySelectorAll<HTMLElement>(".recommendation-card")]
      .find((card) => card.querySelector(".coming-soon-badge"));
    expect(comingCard).toBeDefined();
    expect(comingCard!.querySelector<HTMLButtonElement>("button.repository-link")?.disabled).toBe(true);
    expect(comingCard!.querySelector("a.repository-link")).toBeNull();
  });
});

describe("license context and re-entry", () => {
  it("preserves scenario selections when returning to licenses without changing the plan", async () => {
    await selectLicensedGoals(["AI and Agent Security"]);
    await click(choice("Agent Security"));
    expect(await openCategories()).toBe(false);
    await openResults();
    await action("← Back to scenarios");
    await action("← Back");
    await action("← Back");
    expect(choice("Microsoft 365 E7").getAttribute("aria-pressed")).toBe("true");
    await action("Continue with 1 license plan");
    expect(choice("AI and Agent Security").getAttribute("aria-pressed")).toBe("true");
    await action("Continue with 1 security goal");
    expect(choice("Agent Security").getAttribute("aria-pressed")).toBe("true");
  });

  it("clears selections when the selected license plan changes", async () => {
    await selectLicensedGoals(["AI and Agent Security"]);
    await click(choice("Agent Security"));
    await action("← Back");
    await action("← Back");
    await click(choice("Microsoft 365 E7"));
    await click(choice("Microsoft 365 E5"));
    await action("Continue with 1 license plan");
    expect(choice("AI and Agent Security").getAttribute("aria-pressed")).toBe("false");
  });
});

describe("top-level combination sweep", () => {
  it("takes all 511 supported goal combinations through their applicable selection flow", async () => {
    const supportedNames = securityGoalNavigation
      .filter((goal) => !("comingSoon" in goal && goal.comingSoon))
      .map((goal) => goal.name);
    expect(supportedNames).toHaveLength(9);

    for (let mask = 1; mask < 1 << supportedNames.length; mask += 1) {
      if (mask > 1) await action("Start over");
      await action("Skip license selection");
      const selectedNames = supportedNames.filter((_, index) => (mask & (1 << index)) !== 0);
      await clickChoices(selectedNames);
      await action(`Continue with ${selectedNames.length} security goal`);
      const scenarios = [
        ...(selectedNames.includes("Attack prevention") ? ["Device code phishing attacks"] : []),
        ...(selectedNames.includes("Identity and Access") ? ["Administrator protection"] : []),
        ...(selectedNames.includes("Endpoint protection") ? ["Windows"] : []),
        ...(selectedNames.includes("AI and Agent Security") ? ["AI Security"] : []),
          ...(selectedNames.includes("Data Security") ? ["Retention"] : []),
        ...(selectedNames.includes("App protection") ? ["Desktop apps"] : []),
      ];
      if (scenarios.length) await clickChoices(scenarios);
        if (selectedNames.includes("Endpoint protection")) {
          await action("Choose policy categories");
          await click(choice("Antivirus (AV)"));
        }
      await action("View recommendations");
      expect(container.querySelector("h1")?.textContent)
        .toBe("Recommended security policy templates");
    }
  }, 120_000);
});
