import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { licenses, type License, type LicenseQuantities } from "./catalog";
import { AttackProtectionRecommendation, attackMapperUrl } from "./AttackProtectionRecommendation";

function render(
  licenseIds: readonly License["id"][],
  licenseQuantities?: LicenseQuantities,
) {
  return renderToStaticMarkup(
    <AttackProtectionRecommendation licenseIds={licenseIds} licenseQuantities={licenseQuantities} />,
  );
}

describe("attack prevention recommendation", () => {
  it.each(licenses.filter((license) => license.eligible))(
    "matches the P2 experience and upgrade guidance to $name",
    ({ id }) => {
      const html = render([id]);
      const includesP2 = id === "e5" || id === "e7" || id.includes("defender");
      expect(html).toContain(includesP2 ? "Full experience" : "Limited experience");
      expect(html.includes("Microsoft Entra ID P2 add-on")).toBe(!includesP2);
      if (!includesP2) {
        expect(html).toContain("PIM authentication context");
        expect(html).toContain("risky user policies");
        expect(html).toContain("risky sign-in policies");
        expect(html).toContain(id.startsWith("business-premium")
          ? "Microsoft Defender Suite for Business Premium"
          : id.startsWith("e3") ? "Microsoft Defender Suite for Microsoft 365 E3"
          : `Microsoft Defender Suite FLW for Microsoft 365 ${id.startsWith("f1") ? "F1" : "F3"}`);
      }
      if (id.startsWith("f1")) expect(html).not.toContain("F3");
      if (id.startsWith("f3")) expect(html).not.toContain("F1");
      expect(html).not.toContain("Agent 365");
    },
  );

  it("uses the standard final-card styling, disclaimer, comparison sheets and mapper link", () => {
    const html = render(["business-premium"]);
    expect(html).toContain('class="recommendation-card"');
    expect(html).toContain('class="experience-badge limited"');
    expect(html).toContain("MITRE ATT&amp;CK to ALSO Microsoft Security Policy Template Mapper");
    expect(html).toContain(`href="${attackMapperUrl}"`);
    expect(html).toContain("Disclaimer:");
    expect(html).toContain("Modern-Work-Plan-Comparison-Enterprise.pdf");
    expect(html).toContain("Modern-Work-Plan-Comparison-SMB.pdf");
    expect(html).toContain("Attack prevention with limited experience");
    expect(html).not.toContain("Mapped policies are a starting point");
    expect(html).not.toContain("Verify the prerequisites for each policy before deployment.");
  });

  it("keeps Conditional Access guidance scoped to the matching plan", () => {
    const combined = render(["f1", "f3", "e3", "business-premium"]);
    expect(combined).toContain("1 Microsoft 365 F1 license");
    expect(combined).toContain("1 Microsoft 365 F3 license");
    expect(combined).toContain("Microsoft Defender Suite for Microsoft 365 E3");
    expect(combined).toContain("Microsoft Defender Suite for Business Premium");
    const mixed = render(["e5", "business-premium"], { e5: 1, "business-premium": 25 });
    expect(mixed).toContain("1 Microsoft 365 E5 license; 25 Microsoft 365 Business Premium licenses");
    expect(mixed).toContain("25 Microsoft 365 Business Premium licenses: Add the Microsoft Entra ID P2 add-on");
    expect(mixed).toContain("Full coverage is included with this plan");
  });
});
