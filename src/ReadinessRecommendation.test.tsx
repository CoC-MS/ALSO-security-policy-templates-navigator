import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { licenses } from "./catalog";
import { securityGoalNavigation } from "./solutionCatalog";
import { getReadinessGuidance, ReadinessRecommendation, readinessUrl } from "./ReadinessRecommendation";

describe("fundamentals and Copilot Readiness", () => {
  it.each(licenses)("matches both experiences and missing entitlements for $name", ({ id, name, eligible }) => {
    const fundamentals = getReadinessGuidance("security-fundamentals", [id]);
    const copilot = getReadinessGuidance("copilot-readiness", [id]);
    if (!eligible) {
      expect(fundamentals).toBeUndefined();
      expect(copilot).toBeUndefined();
      return;
    }
    const complete = id === "e5" || id === "e7" || id.includes("defender-purview");
    const defender = complete || id.includes("defender");
    const purview = complete || id.includes("purview");
    expect(fundamentals?.experience).toBe(complete ? "full" : "limited");
    expect(copilot?.experience).toBe(id === "e7" ? "full" : "limited");
    if (!complete) {
      expect(fundamentals?.message).toContain(`With ${name}, add`);
      expect(fundamentals?.message).toContain("Defender for Identity");
      expect(fundamentals?.message).toContain("PIM, access reviews, risky sign-in policies, and risky user policies");
      expect(fundamentals?.message).toContain("auto labelling, SITs (Sensitive Information Types)");
    }
    if (id !== "e7") {
      expect(copilot?.message).toContain(`With ${name}, add`);
      if (complete) {
        expect(copilot?.message).toContain("add SharePoint Advanced Management");
      } else {
        expect(copilot?.message).toContain("Microsoft 365 Copilot");
        if (!defender) expect(copilot?.message).toContain("Defender for Cloud Apps");
        if (!purview) expect(copilot?.message).toContain("full DLP and retention policy experience");
        if (id.startsWith("f1") || id.startsWith("f3")) {
          expect(copilot?.message).toContain(`Suite FLW for Microsoft 365 ${id.startsWith("f1") ? "F1" : "F3"}`);
          expect(copilot?.message).not.toContain(id.startsWith("f1") ? "F3" : "F1");
        }
      }
    }
  });

  it("recommends only missing suites and combines existing entitlements", () => {
    expect(getReadinessGuidance("copilot-readiness", ["e3-defender"])?.message)
      .toContain("add Microsoft Purview Suite for Microsoft 365 E3 and Microsoft 365 Copilot");
    expect(getReadinessGuidance("copilot-readiness", ["business-premium-purview"])?.message)
      .toContain("add Microsoft Defender Suite for Business Premium and Microsoft 365 Copilot");
    expect(getReadinessGuidance("security-fundamentals", ["f1-defender", "f1-purview"])?.experience)
      .toBe("full");
    expect(getReadinessGuidance("copilot-readiness", ["e5", "e7"])?.experience).toBe("full");
    expect(getReadinessGuidance("copilot-readiness", ["e5"])?.experience).toBe("limited");
    expect(getReadinessGuidance("security-fundamentals", [])).toBeUndefined();
  });

  it("marks exactly the three requested goals New", () => {
    expect(securityGoalNavigation.filter((goal) => "isNew" in goal && goal.isNew)
      .map((goal) => goal.id)).toEqual(["attack-protection", "security-fundamentals", "copilot-readiness"]);
  });

  it.each(["security-fundamentals", "copilot-readiness"] as const)(
    "renders the shared final-page licensing sheets and destination for %s", (goalId) => {
      const html = renderToStaticMarkup(<ReadinessRecommendation goalId={goalId} licenseIds={["e3"]} />);
      expect(html).toContain('class="experience-badge limited"');
      expect(html).toContain("with limited experience");
      expect(html).toContain(`href="${readinessUrl}"`);
      expect(html).toContain("Disclaimer:");
      expect(html).toContain("Modern-Work-Plan-Comparison-Enterprise.pdf");
      expect(html).toContain("Modern-Work-Plan-Comparison-SMB.pdf");
      expect(renderToStaticMarkup(<ReadinessRecommendation goalId={goalId} licenseIds={["business-basic"]} />))
        .toBe("");
    },
  );
});
