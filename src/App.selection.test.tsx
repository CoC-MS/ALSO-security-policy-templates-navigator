// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { getPlatform, getPlatformRepositories } from "./catalog";
import { getRelatedSiteUrl, secureByDefaultUrl } from "./relatedSites";

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

function expectGoalSection(name: string, hasOptions: boolean) {
  const section = [...container.querySelectorAll(".goal-option-section")]
    .find((item) => item.querySelector("h2, h3")?.textContent === name);
  expect(section, `visible section ${name}`).toBeDefined();
  expect(section!.querySelector(".goal-option-grid") !== null).toBe(hasOptions);
  if (!hasOptions) expect(section!.querySelector("button")).toBeNull();
}

async function selectGoals(names: string[]) {
  await click(choice("Microsoft 365 E7"));
  await click(choice("Microsoft 365 E5"));
  await action("Continue with 2 license plans");
  for (const name of names) await click(choice(name));
  await action(`Continue with ${names.length} security goal`);
}

async function browseGoals(names: string[]) {
  await action("Skip license selection");
  for (const name of names) await click(choice(name));
  await action(`Continue with ${names.length} security goal`);
}

function expectLicensingNotEvaluated() {
  expect(container.textContent).toContain("Licensing not evaluated");
  expect(container.querySelector('[aria-label="Selected eligible licenses"]')).toBeNull();
  expect(container.querySelector(".experience-badge.full, .experience-badge.limited")).toBeNull();
  expect(container.querySelector(".license-requirement-note:not(.licensing-disclaimer)")).toBeNull();
  expect(container.textContent).not.toContain("Recommendations will be matched to the selected licenses");
}

describe("Windows Remediation Scripts licensing", () => {
  it.each([
    "Microsoft 365 Business Premium",
    "Microsoft 365 Business Premium + Defender and Purview Suite",
  ])("shows a limited Remediation Scripts category and recommendation for %s", async (licenseName) => {
    await click(choice(licenseName));
    await action("Continue with 1 license plan");
    await click(choice("Endpoint protection"));
    await action("Continue with 1 security goal");
    await click(choice("Windows"));
    await action("Choose endpoint policy categories");
    expect(choice("Remediation Scripts").disabled).toBe(false);
    expect(choice("Remediation Scripts").querySelector(".experience-badge")?.textContent)
      .toBe("Limited experience");
    expect(choice("Encryption").querySelector(".experience-badge")?.textContent).toBe("Full experience");
    await click(choice("Remediation Scripts"));
    await action("View recommendations");
    expect(container.querySelector(".recommendation-card .experience-badge")?.textContent)
      .toBe("Limited experience");
    const note = container.querySelector(".license-requirement-note:not(.licensing-disclaimer)");
    expect(note?.textContent).toContain("Remediation Scripts with limited experience");
    expect(note?.textContent).toContain("Windows Enterprise E3 or E5");
    expect(note?.textContent).not.toContain("Defender Suite");
    await action("← Back");
    expect(choice("Remediation Scripts").getAttribute("aria-pressed")).toBe("true");
  });

  it("keeps Remediation Scripts licensing unevaluated when license selection is skipped", async () => {
    await browseGoals(["Endpoint protection"]);
    await click(choice("Windows"));
    await action("Choose endpoint policy categories");
    expect(choice("Remediation Scripts").querySelector(".experience-badge")?.textContent)
      .toBe("Licensing not evaluated");
    await click(choice("Remediation Scripts"));
    await action("View recommendations");
    expectLicensingNotEvaluated();
  });
});

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

describe("compact automatically included goal cards", () => {
  it.each([false, true])("uses option-style cards without extra choices or recommendation panels (skip licensing: %s)", async (skipLicensing) => {
    const goals = ["Attack prevention", "Identity and Access", "App protection", "Copilot Readiness"];
    if (skipLicensing) await browseGoals(goals);
    else await selectGoals(goals);

    function expectIncludedCards() {
      for (const id of ["attack-protection", "copilot-readiness"]) {
        const section = container.querySelector(`#${id}-heading`)!.parentElement!;
        expect(section.querySelector(".choice-card.selected.included-goal-card")).not.toBeNull();
        expect(section.querySelector(".experience-badge")?.textContent).toBe("Included automatically");
        expect(section.querySelector("button, a, .recommendation-card, .license-requirement-note, .goal-option-grid"))
          .toBeNull();
      }
      expectSelectedGoals(goals);
    }

    expectIncludedCards();
    await click(choice("Administrator protection"));
    await click(choice("Desktop apps"));
    await action("Continue with selected policies");
    expectIncludedCards();
    expect(container.querySelector("#administrator-protection-heading")!.parentElement!
      .querySelector(".included-goal-card .choice-name")?.textContent).toBe("Administrator protection policies");
    expect(choice("Desktop apps").getAttribute("aria-pressed")).toBe("true");
    await action("View recommendations");
    expect(container.querySelector("h1")?.textContent).toBe("Recommended security policy templates");
    const links = [...container.querySelectorAll<HTMLAnchorElement>(".repository-link")].map(link => link.href);
    expect(links).toContain(getRelatedSiteUrl("attackPrevention", "en"));
    expect(links).toContain(getRelatedSiteUrl("readiness", "en"));
    await action("← Back");
    expectIncludedCards();
    if (skipLicensing) expectLicensingNotEvaluated();
  });
});

describe("browse without license selection", () => {
  it("places Skip below the introduction and opens the goal page without assuming a license", async () => {
    const intro = container.querySelector("#main-title")!.nextElementSibling!;
    expect(intro.nextElementSibling?.querySelector("button")?.textContent)
      .toContain("Skip license selection");
    expect(intro.nextElementSibling?.nextElementSibling?.querySelector("h2")?.id)
      .toBe("enterprise-heading");
    await click(choice("Microsoft 365 E7"));
    await action("Skip license selection");
    expect(container.querySelector("h1")?.textContent)
      .toBe("What security challenges are you trying to solve?");
    expectLicensingNotEvaluated();
    expect(choice("Azure security deployment best practices").disabled).toBe(true);

    await action("← Back");
    expect(choice("Microsoft 365 E7").getAttribute("aria-pressed")).toBe("false");
    expect(container.querySelector('input[type="number"]')).toBeNull();
  });

  it("retains all pictured goals through recommendations with zero licenses and unevaluated badges", async () => {
    const goals = ["Attack prevention", "App protection", "Copilot Readiness"];
    await browseGoals(goals);
    expectSelectedGoals(goals);
    expectGoalSection("Attack prevention", false);
    expectGoalSection("App protection", true);
    expectGoalSection("Copilot Readiness", false);
    expectLicensingNotEvaluated();
    expect(choice("On-premises app protection").disabled).toBe(true);
    await click(choice("OAuth apps"));
    await action("View recommendations");
    expectSelectedGoals(goals);
    expectLicensingNotEvaluated();
    const cards = [...container.querySelectorAll(".recommendation-card")];
    expect(cards.length).toBeGreaterThan(2);
    for (const card of cards) {
      expect(card.querySelector(".experience-badge")?.textContent).toBe("Licensing not evaluated");
    }
    const links = [...container.querySelectorAll<HTMLAnchorElement>(".repository-link")].map(link => link.href);
    expect(links).toContain(getRelatedSiteUrl("attackPrevention", "en"));
    expect(links).toContain(getRelatedSiteUrl("readiness", "en"));
    expect(links).toContain(getPlatformRepositories(getPlatform("conditional-access"))[0].url);
    await action("← Back");
    expect(choice("OAuth apps").getAttribute("aria-pressed")).toBe("true");
    expectLicensingNotEvaluated();
  });

  it("allows all available Identity, endpoint, AI and data categories while keeping Coming restrictions", async () => {
    const goals = ["Identity and Access", "Endpoint protection", "AI and Agent Security", "Data Security", "Copilot Readiness"];
    await browseGoals(goals);
    expectSelectedGoals(goals);
    expectLicensingNotEvaluated();
    for (const button of container.querySelectorAll<HTMLButtonElement>(".goal-option-grid button")) {
      expect(button.disabled).toBe(false);
    }
    await click(choice("Conditional Access"));
    await click(choice("Administrator protection"));
    await click(choice("Windows Server"));
    await click(choice("Linux Server"));
    await click(choice("AI Security"));
    await click(choice("Agent Security"));
    await click(choice("Retention"));
    await action("Continue with selected policies");
    expectSelectedGoals(goals);
    expectLicensingNotEvaluated();
    expect(choice("Global Secure Access Policies").disabled).toBe(true);
    expect(choice("Service principal policies").disabled).toBe(true);
    await click(choice("Internal user policies"));
    await action("Choose endpoint policy categories");
    expectSelectedGoals(goals);
    expectLicensingNotEvaluated();
    for (const id of ["endpoint-windows-server", "endpoint-linux-server"]) {
      const section = container.querySelector(`#${id}-categories-heading`)!.parentElement!;
      for (const button of section.querySelectorAll<HTMLButtonElement>("button")) {
        expect(button.disabled).toBe(false);
      }
      await click(section.querySelector<HTMLButtonElement>("button")!);
    }
    await action("View recommendations");
    expectSelectedGoals(goals);
    expectLicensingNotEvaluated();
    const links = [...container.querySelectorAll<HTMLAnchorElement>(".repository-link")].map(link => link.href);
    for (const id of ["windows-servers", "linux-server", "ai-security", "agent-security", "purview"] as const) {
      expect(links).toContain(getPlatformRepositories(getPlatform(id))[0].url);
    }
    for (const badge of container.querySelectorAll(".recommendation-card .experience-badge")) {
      expect(["Licensing not evaluated", "Coming"]).toContain(badge.textContent);
    }
  });

  it("keeps the coming-soon AI macOS resource disabled when browsing AI policies", async () => {
    await browseGoals(["AI and Agent Security"]);
    await click(choice("AI Security"));
    await action("View recommendations");
    expectLicensingNotEvaluated();
    const comingCard = [...container.querySelectorAll(".recommendation-card")]
      .find(card => card.querySelector(".coming-soon-badge"));
    expect(comingCard).toBeDefined();
    expect(comingCard!.querySelector<HTMLButtonElement>("button.repository-link")?.disabled).toBe(true);
    expect(comingCard!.querySelector("a.repository-link")).toBeNull();
  });

  it("renders every direct resource without licenses instead of silently dropping readiness resources", async () => {
    await browseGoals(["Attack prevention", "Security fundamentals", "Copilot Readiness", "Automated Discovery and Deployment"]);
    expect(container.querySelector("h1")?.textContent).toBe("Recommended security policy templates");
    expectSelectedGoals(["Attack prevention", "Automated Discovery and Deployment", "Security fundamentals", "Copilot Readiness"]);
    expectLicensingNotEvaluated();
    expect(container.querySelectorAll(".recommendation-card")).toHaveLength(4);
    const links = [...container.querySelectorAll<HTMLAnchorElement>(".repository-link")].map(link => link.href);
    expect(links).toContain(secureByDefaultUrl);
    expect(links.filter(link => link === getRelatedSiteUrl("readiness", "en"))).toHaveLength(2);
  });

  it("preserves browsing selections on Back and re-entry, then restores normal license filtering when licenses are chosen", async () => {
    await browseGoals(["App protection", "Copilot Readiness"]);
    await click(choice("Desktop apps"));
    await action("← Back");
    await action("← Back");
    await action("Skip license selection");
    expect(choice("App protection").getAttribute("aria-pressed")).toBe("true");
    await action("Continue with 2 security goals");
    expect(choice("Desktop apps").getAttribute("aria-pressed")).toBe("true");
    await action("← Back");
    await action("← Back");
    await click(choice("Microsoft 365 F1"));
    await action("Continue with 1 license plan");
    expect(container.textContent).not.toContain("Licensing not evaluated");
    expect(choice("App protection").getAttribute("aria-pressed")).toBe("false");
    await click(choice("Data Security"));
    await action("Continue with 1 security goal");
    expect(choice("Sensitive Information Types (SITs)").disabled).toBe(true);
    expect(container.querySelector(".experience-badge.limited")).not.toBeNull();
    await action("← Back");
    await action("← Back");
    await action("Skip license selection");
    await click(choice("Data Security"));
    await action("Continue with 1 security goal");
    expect(choice("Sensitive Information Types (SITs)").disabled).toBe(false);
    expectLicensingNotEvaluated();
  });

  it("clears browse mode on Start over and retains ordinary licensed recommendation guidance", async () => {
    await browseGoals(["Copilot Readiness"]);
    await action("Start over");
    expect(container.textContent).not.toContain("Licensing not evaluated");
    expect(container.querySelector("h1")?.textContent).toBe("Which Microsoft 365 licenses does your customer have?");
    await click(choice("Microsoft 365 E7"));
    await action("Continue with 1 license plan");
    await click(choice("Copilot Readiness"));
    await action("Continue with 1 security goal");
    expect(container.querySelector(".experience-badge.limited")?.textContent).toBe("Limited experience");
    expect(container.textContent).toContain("SharePoint Advanced Management");
    expect(container.textContent).not.toContain("Licensing not evaluated");
  });
});

describe("rendered selected-goal visibility and transitions", () => {
  it("shows all three pictured goals on the scenario page without inventing direct-resource options", async () => {
    const goals = ["Attack prevention", "App protection", "Copilot Readiness"];
    await selectGoals(goals);

    expect(container.querySelector("h1")?.textContent)
      .toBe("Choose the scenarios and platforms to include");
    expectSelectedGoals(goals);
    expectGoalSection("Attack prevention", false);
    expectGoalSection("App protection", true);
    expectGoalSection("Copilot Readiness", false);
    expect(choice("On-premises app protection").disabled).toBe(true);

    await click(choice("Desktop apps"));
    await action("View recommendations");
    expectSelectedGoals(goals);
    expect(container.querySelector("h1")?.textContent)
      .toBe("Recommended security policy templates");
    await action("← Back");
    expectSelectedGoals(goals);
    expect(choice("Desktop apps").getAttribute("aria-pressed")).toBe("true");
  });

  it("shows every direct-resource companion alongside Identity and Access and retains options on the following page", async () => {
    const goals = [
      "Attack prevention", "Identity and Access", "App protection",
      "Automated Discovery and Deployment", "Security fundamentals", "Copilot Readiness",
    ];
    await selectGoals(goals);

    expect(container.querySelector("h1")?.textContent).toBe("Choose the scenarios and platforms to include");
    expect([...container.querySelectorAll('[aria-label="Selected eligible licenses"] .selection-pill')]
      .map((pill) => pill.textContent?.replace("✓", "").trim())).toEqual(["Microsoft 365 E7", "Microsoft 365 E5"]);
    expectSelectedGoals(goals);
    expect([...container.querySelectorAll(".goal-option-sections > .goal-option-section > h2")]
      .map((heading) => heading.textContent)).toEqual(goals);
    for (const name of goals.filter((name) => name !== "Identity and Access")) {
      expectGoalSection(name, name === "App protection");
    }
    await click(choice("Desktop apps"));
    await click(choice("Conditional Access"));
    await click(choice("Administrator protection"));
    await action("Continue with selected policies");

    expectSelectedGoals(goals);
    expect([...container.querySelectorAll(".goal-option-sections > .goal-option-section > h2")]
      .map((heading) => heading.textContent)).toEqual(goals);
    expectGoalSection("Administrator protection", false);
    expectGoalSection("Conditional Access", true);
    expect(choice("Desktop apps").getAttribute("aria-pressed")).toBe("true");
    await click(choice("Internal user policies"));
    await action("View recommendations");
    expectSelectedGoals(goals);
    await action("← Back");
    expect(choice("Internal user policies").getAttribute("aria-pressed")).toBe("true");
    expect(choice("Desktop apps").getAttribute("aria-pressed")).toBe("true");
  });

  it("uses numbered goal order rather than click order or pinning Identity first", async () => {
    await selectGoals(["AI and Agent Security", "Endpoint protection", "Identity and Access", "Attack prevention"]);
    const goals = ["Attack prevention", "Identity and Access", "Endpoint protection", "AI and Agent Security"];
    expectSelectedGoals(goals);
    expect([...container.querySelectorAll(".goal-option-sections > .goal-option-section > h2")]
      .map((heading) => heading.textContent)).toEqual(goals);
    expect(container.querySelector("h1")?.textContent).toBe("Choose the scenarios and platforms to include");
    await click(choice("Conditional Access"));
    await action("Continue with selected policies");
    expectSelectedGoals(goals);
    expect([...container.querySelectorAll(".goal-option-sections > .goal-option-section > h2")]
      .map((heading) => heading.textContent)).toEqual(goals);
  });

  it("retains the Identity-specific title for an Identity-only selection", async () => {
    await selectGoals(["Identity and Access"]);
    expect(container.querySelector("h1")?.textContent).toBe("Choose Identity and Access policies");
    expect(container.querySelector("#identity-and-access-heading")?.textContent).toBe("Identity and Access");
    await click(choice("Administrator protection"));
    await action("Continue with selected policies");
    expect(container.querySelector("h1")?.textContent).toBe("Recommended security policy templates");
    expectSelectedGoals(["Identity and Access"]);
    await action("← Back");
    expect(choice("Administrator protection").getAttribute("aria-pressed")).toBe("true");
  });

  it("keeps all goals visible through endpoint category selection and preserves only retained platform categories", async () => {
    const goals = ["Attack prevention", "Endpoint protection", "App protection", "Copilot Readiness"];
    await selectGoals(goals);
    await click(choice("Windows"));
    await click(choice("macOS"));
    await click(choice("Desktop apps"));
    await action("Choose endpoint policy categories");
    expectSelectedGoals(goals);

    const windows = container.querySelector("#endpoint-windows-categories-heading")!.parentElement!;
    const macos = container.querySelector("#endpoint-macos-categories-heading")!.parentElement!;
    await click(windows.querySelector<HTMLButtonElement>("button")!);
    await click(macos.querySelector<HTMLButtonElement>("button")!);
    await action("View recommendations");
    expectSelectedGoals(goals);
    await action("← Back");
    expectSelectedGoals(goals);
    await action("← Back to platforms");
    expect(choice("Desktop apps").getAttribute("aria-pressed")).toBe("true");
    await click(choice("Windows"));
    await click(choice("Windows"));
    await action("Choose endpoint policy categories");

    const retainedMacos = container.querySelector("#endpoint-macos-categories-heading")!.parentElement!;
    const resetWindows = container.querySelector("#endpoint-windows-categories-heading")!.parentElement!;
    expect(retainedMacos.querySelector('button[aria-pressed="true"]')).not.toBeNull();
    expect(resetWindows.querySelector('button[aria-pressed="true"]')).toBeNull();
    expectSelectedGoals(goals);
  });

  it("removes deselected goals and their options without clearing other goals' selections", async () => {
    await selectGoals(["Attack prevention", "App protection", "Copilot Readiness"]);
    await click(choice("Desktop apps"));
    await action("← Back");
    await click(choice("Attack prevention"));
    await click(choice("Copilot Readiness"));
    await action("Continue with 1 security goal");
    expectSelectedGoals(["App protection"]);
    expect(container.querySelector("#attack-protection-heading")).toBeNull();
    expect(container.querySelector("#copilot-readiness-heading")).toBeNull();
    expect(choice("Desktop apps").getAttribute("aria-pressed")).toBe("true");

    await action("← Back");
    await click(choice("App protection"));
    await click(choice("App protection"));
    await click(choice("Copilot Readiness"));
    await action("Continue with 2 security goals");
    expectSelectedGoals(["App protection", "Copilot Readiness"]);
    expect(choice("Desktop apps").getAttribute("aria-pressed")).toBe("false");
    await click(choice("Desktop apps"));
    await click(choice("Desktop apps"));
    expect(choice("Desktop apps").getAttribute("aria-pressed")).toBe("false");
  });

  it("clears deselected Identity policies but preserves configurable companions", async () => {
    await selectGoals(["Identity and Access", "App protection", "Copilot Readiness"]);
    await click(choice("Conditional Access"));
    await click(choice("Desktop apps"));
    await action("Continue with selected policies");
    await click(choice("Internal user policies"));
    await action("← Back");
    await action("← Back");
    await click(choice("Identity and Access"));
    await action("Continue with 2 security goals");
    expectSelectedGoals(["App protection", "Copilot Readiness"]);
    expect(container.querySelector("#conditional-access-heading")).toBeNull();
    expect(choice("Desktop apps").getAttribute("aria-pressed")).toBe("true");

    await action("← Back");
    await click(choice("Identity and Access"));
    await action("Continue with 3 security goals");
    expect(choice("Conditional Access").getAttribute("aria-pressed")).toBe("false");
    await click(choice("Conditional Access"));
    await action("Continue with selected policies");
    expect(choice("Internal user policies").getAttribute("aria-pressed")).toBe("false");
    expect(choice("Desktop apps").getAttribute("aria-pressed")).toBe("true");
  });

  it("continues directly to recommendations when no selected goal needs options", async () => {
    const goals = ["Attack prevention", "Security fundamentals", "Copilot Readiness"];
    await selectGoals(goals);
    expect(container.querySelector("h1")?.textContent).toBe("Recommended security policy templates");
    expectSelectedGoals(goals);
    await action("← Back");
    expect(choice("Attack prevention").getAttribute("aria-pressed")).toBe("true");
    expect(choice("Copilot Readiness").getAttribute("aria-pressed")).toBe("true");
    expect(choice("Azure security deployment best practices").disabled).toBe(true);
  });
});
