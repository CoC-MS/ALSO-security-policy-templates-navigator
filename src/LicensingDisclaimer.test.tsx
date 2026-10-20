import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  getCloudAppsConditionalAccessLicenseNote,
  getLimitedExperienceNoteForLicenses,
  getWindowsServerLicenseNotes,
  requiresWorkloadIdPremiumForOAuthApps,
  type License,
  type Platform,
} from "./catalog";
import {
  getDataSecurityLicenseNote,
  getEndpointFeatureLicenseNote,
} from "./solutionCatalog";
import { LicensingDisclaimer, licensingDisclaimerText } from "./LicensingDisclaimer";
import type { ComponentProps } from "react";

const expectedText =
  "Licensing prerequisites and feature availability listed on this page may be incorrect, incomplete, or outdated. We strongly recommend verifying all licensing information against the latest official Microsoft licensing documentation before making any purchasing or deployment decisions.";
const expectedUrl =
  "https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/bade/documents/products-and-services/en-us/education/Modern-Work-Plan-Comparison-Enterprise.pdf";

function renderDisclaimer(props: Partial<ComponentProps<typeof LicensingDisclaimer>> = {}) {
  return renderToStaticMarkup(
    <LicensingDisclaimer
      endpointNotes={[]}
      needsWorkloadIdLicense={false}
      serverNotes={[]}
      {...props}
    />,
  );
}

function expectDisclaimer(html: string, includeComparisons: boolean) {
  expect(licensingDisclaimerText).toBe(expectedText);
  expect(html).toContain(`<strong>Disclaimer:</strong> ${expectedText}`);
  expect(html.match(/<strong>Disclaimer:<\/strong>/g)).toHaveLength(1);
  if (includeComparisons) {
    expect(html).toContain("Enterprise licenses:");
    expect(html).toContain("Microsoft Enterprise Plan Comparison");
    expect(html).toContain("SMB licenses:");
    expect(html).toContain("Microsoft SMB Plan Comparison");
    expect(html.split(`href="${expectedUrl}"`)).toHaveLength(3);
    expect(html.match(/target="_blank" rel="noopener noreferrer"/g)).toHaveLength(2);
  } else {
    expect(html).not.toContain("<a ");
    expect(html).not.toContain("Plan Comparison");
  }
}

describe("recommendation card licensing disclaimer", () => {
  it("renders nothing when the card has no licensing notes", () => {
    expect(renderDisclaimer()).toBe("");
  });

  it.each<Platform["id"]>([
    "windows-11", "linux-desktop", "purview", "conditional-access", "ai-security",
  ])("includes both supplied comparison links for general %s prerequisites", (platformId) => {
    const note = getLimitedExperienceNoteForLicenses(["e3"], platformId);
    expect(note).toBeDefined();
    expectDisclaimer(renderDisclaimer({ limitedExperienceNote: note }), true);
  });

  it.each<License["id"]>(["e3", "f1", "f3", "business-premium"])(
    "covers Endpoint category notes for %s even when the general note is suppressed",
    (licenseId) => {
      const note = getEndpointFeatureLicenseNote("defender", [licenseId], "windows-11");
      expect(note).toBeDefined();
      expectDisclaimer(renderDisclaimer({ endpointNotes: [note!] }), true);
    },
  );

  it.each<License["id"]>(["e3", "f1", "f1-defender", "business-premium"])(
    "covers the Data Security-specific note for %s",
    (licenseId) => {
      const note = getDataSecurityLicenseNote([licenseId]);
      expect(note).toBeDefined();
      expectDisclaimer(renderDisclaimer({ dataSecurityNote: note }), true);
    },
  );

  it("covers the Cloud Apps-specific Defender prerequisite", () => {
    const note = getCloudAppsConditionalAccessLicenseNote(["e3"]);
    expect(note).toBeDefined();
    expectDisclaimer(renderDisclaimer({ cloudAppsNote: note }), true);
  });

  it("covers licensing prerequisites embedded in recommended policy notes", () => {
    expectDisclaimer(renderDisclaimer({ hasPolicyLicensingPrerequisites: true }), true);
  });

  it.each(["windows-servers", "linux-server"] as const)(
    "does not append generic links solely for %s licensing notices",
    (platformId) => {
      const notes = getWindowsServerLicenseNotes(["e5"], platformId);
      expect(notes.length).toBeGreaterThan(0);
      expectDisclaimer(renderDisclaimer({ serverNotes: notes }), false);
    },
  );

  it.each<Platform["id"]>([
    "conditional-access", "ai-security", "ai-security-macos", "agent-security",
  ])("does not append generic links solely for Agent 365 on %s", (platformId) => {
    const note = getLimitedExperienceNoteForLicenses(["e5"], platformId);
    expect(note).toBeDefined();
    expect(note?.message).toContain("Agent 365");
    expectDisclaimer(renderDisclaimer({ limitedExperienceNote: note }), false);
  });

  it("does not append generic links for limited Agent Security requiring only Agent 365", () => {
    const note = getLimitedExperienceNoteForLicenses(["e3"], "agent-security");
    expect(note).toBeDefined();
    expectDisclaimer(renderDisclaimer({ limitedExperienceNote: note }), false);
  });

  it("does not append generic links solely for Workload ID Premium", () => {
    const needsWorkloadIdLicense = requiresWorkloadIdPremiumForOAuthApps(["e5"]);
    expect(needsWorkloadIdLicense).toBe(true);
    expectDisclaimer(renderDisclaimer({ needsWorkloadIdLicense }), false);
  });

  it("renders one disclaimer and one pair of comparison links for multiple notices on a card", () => {
    expectDisclaimer(renderDisclaimer({
      limitedExperienceNote: getLimitedExperienceNoteForLicenses(["e3"], "ai-security"),
      endpointNotes: ["Defender prerequisite", "Intune prerequisite"],
      dataSecurityNote: getDataSecurityLicenseNote(["e3"]),
      cloudAppsNote: getCloudAppsConditionalAccessLicenseNote(["e3"]),
      needsWorkloadIdLicense: true,
      serverNotes: getWindowsServerLicenseNotes(["e3"], "windows-servers"),
    }), true);
  });
});
