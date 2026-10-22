import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AttackProtectionExplorer } from "./AttackProtectionExplorer";
import { attackScenarios } from "./attackCoverage";

describe("simple attack policy overview", () => {
  it("shows Overview, one scenario selector, and an accessible loading state", () => {
    const html = renderToStaticMarkup(<AttackProtectionExplorer />);
    expect(html).toContain('id="coverage-heading">Overview</h2>');
    expect(html.match(/<select/g)).toHaveLength(1);
    expect(html.match(/<option/g)).toHaveLength(attackScenarios.length);
    for (const scenario of attackScenarios) {
      expect(html).toContain(`value="${scenario.id}"`);
      expect(html).toContain(scenario.name);
    }
    expect(html).toContain('role="status">Loading policies...');
    expect(html).not.toContain("Reach a phishing link");
    expect(html).not.toContain("coverage-step");
    expect(html).not.toContain("coverage-summary");
    expect(html).not.toContain("coverage-evidence");
  });
});
