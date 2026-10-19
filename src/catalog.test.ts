import { describe, expect, it } from "vitest";
import {
  enterpriseLicenses,
  getLimitedExperienceNoteForLicenses,
  getPlatformExperienceForLicenses,
  getPlatform,
  getPlatformRepositories,
  getWindowsServerLicenseNote,
  getWindowsServerLicenseNotes,
  isLicenseEligible,
  isPlatformAvailableForLicense,
  isPlatformAvailableForLicenses,
  licenses,
  platforms,
  smbLicenses,
  toggleLicenseSelection,
  togglePlatformSelection,
  type Platform,
} from "./catalog";

describe("license catalog", () => {
  it("blocks only Business Basic and Business Standard", () => {
    expect(
      licenses.filter((license) => !isLicenseEligible(license.id)).map((license) => license.id),
    ).toEqual(["business-standard", "business-basic"]);
  });

  it("keeps F3 separate from every E3 combination", () => {
    expect(
      enterpriseLicenses
        .filter((license) => license.id === "e3" || license.id.startsWith("e3-"))
        .map((license) => license.name),
    ).toEqual([
      "Microsoft 365 E3",
      "Microsoft 365 E3 + Defender Suite",
      "Microsoft 365 E3 + Purview Suite",
      "Microsoft 365 E3 + Defender and Purview Suite",
    ]);
    expect(
      enterpriseLicenses
        .filter((license) => license.id.startsWith("f3"))
        .map((license) => license.name),
    ).toEqual([
      "Microsoft 365 F3",
      "Microsoft 365 F3 + Defender Suite FLW",
      "Microsoft 365 F3 + Purview Suite FLW",
      "Microsoft 365 F3 + Defender and Purview Suite FLW",
    ]);
  });

  it("keeps F1 as a separate four-option family", () => {
    expect(
      enterpriseLicenses
        .filter((license) => license.id === "f1" || license.id.startsWith("f1-"))
        .map((license) => license.name),
    ).toEqual([
      "Microsoft 365 F1",
      "Microsoft 365 F1 + Defender Suite FLW",
      "Microsoft 365 F1 + Purview Suite FLW",
      "Microsoft 365 F1 + Defender and Purview Suite FLW",
    ]);
  });

  it("keeps the six Business plans under SMB", () => {
    expect(smbLicenses).toHaveLength(6);
  });

  it("contains no Education or Government license variants", () => {
    expect(licenses.map((license) => license.name).join(" ")).not.toMatch(
      /Microsoft 365 (?:A1|A3|A5|G3|G5|G7)/,
    );
  });
});

describe("repository routing", () => {
  it.each([
    ["windows-11", "https://github.com/CoC-MS/ALSO-Microsoft-Security-Windows"],
    ["windows-servers", "https://github.com/CoC-MS/ALSO-Microsoft-Security-WindowsServer"],
    ["ai-security", "https://github.com/CoC-MS/ALSO-Microsoft-Security-AI-Security-Windows11"],
    ["ai-security-macos", "https://github.com/CoC-MS/ALSO-Microsoft-Security-MacOS"],
    ["agent-security", "https://github.com/CoC-MS/ALSO-Microsoft-Security-Conditional-Access"],
    ["conditional-access", "https://github.com/CoC-MS/ALSO-Microsoft-Security-Conditional-Access"],
    ["linux-desktop", "https://github.com/CoC-MS/ALSO-Microsoft-Security-Linux"],
    ["linux-server", "https://github.com/CoC-MS/ALSO-Microsoft-Security-Linux"],
    ["macos", "https://github.com/CoC-MS/ALSO-Microsoft-Security-MacOS"],
    ["ios-ipados", "https://github.com/CoC-MS/ALSO-Microsoft-Security-iOSandiPadOS"],
    ["android", "https://github.com/CoC-MS/ALSO-Microsoft-Security-Android"],
    ["purview", "https://github.com/CoC-MS/ALSO-Microsoft-Security-Purview"],
  ] as const)("routes %s correctly", (platformId, repository) => {
    expect(getPlatform(platformId).repository).toBe(repository);
  });

  it("includes Agent Security and coming-soon AI Security macOS", () => {
    expect(platforms.map((platform) => platform.id)).toContain("agent-security");
    expect(platforms).toHaveLength(12);
    const macAiSecurity = getPlatform("ai-security-macos");
    expect("comingSoon" in macAiSecurity && macAiSecurity.comingSoon).toBe(true);
    expect(getPlatformRepositories(macAiSecurity)[0].name).toBe("macOS");
  });

  it("gives AI Security macOS the same license mapping as Windows AI Security", () => {
    const availableLicenseIds = (platformId: Platform["id"]) =>
      licenses
        .filter((license) => isPlatformAvailableForLicense(license.id, platformId))
        .map((license) => license.id);

    expect(availableLicenseIds("ai-security-macos")).toEqual(
      availableLicenseIds("ai-security"),
    );
    expect(getPlatform("ai-security-macos").description).toBe(
      "This baseline delivers a hardened MacOS configuration that minimizes the risk of unauthorized third-party AI access while maintaining a productive user experience,",
    );
  });

  it("routes Agent Security to Conditional Access and AI Security Windows 11", () => {
    expect(getPlatformRepositories(getPlatform("agent-security"))).toEqual([
      {
        name: "Conditional Access",
        url: "https://github.com/CoC-MS/ALSO-Microsoft-Security-Conditional-Access",
        description: "Conditional Access policy templates for protecting AI agent access.",
      },
      {
        name: "AI Security Windows 11",
        url: "https://github.com/CoC-MS/ALSO-Microsoft-Security-AI-Security-Windows11",
        description: "Windows 11 policy templates for protecting AI agent operating environments.",
      },
    ]);
  });

  it("returns one repository for ordinary platforms", () => {
    expect(getPlatformRepositories(getPlatform("windows-11"))).toHaveLength(1);
  });
});

describe("selection helpers", () => {
  it("toggles platforms", () => {
    const windows = getPlatform("windows-11");
    const purview = getPlatform("purview");
    const selected = togglePlatformSelection(togglePlatformSelection([], windows), purview);

    expect(selected.map((platform) => platform.id)).toEqual(["windows-11", "purview"]);
    expect(togglePlatformSelection(selected, windows)).toEqual([purview]);
  });

  describe("platform experience labels", () => {
    it("marks repositories with an upgrade notice as limited", () => {
      expect(
        getPlatformExperienceForLicenses(["business-premium"], "windows-11"),
      ).toBe("limited");
    });

    it("marks fully entitled repositories as full", () => {
      expect(getPlatformExperienceForLicenses(["e7"], "agent-security")).toBe(
        "full",
      );
    });

    it("marks Agent Security as limited when Agent 365 is required", () => {
      expect(
        getPlatformExperienceForLicenses(["e5"], "agent-security"),
      ).toBe("limited");
    });

    it.each([
      ["business-premium", "Microsoft 365 Business Premium"],
      ["e3", "Microsoft 365 E3"],
      ["f1-defender", "Microsoft 365 F1 + Defender Suite FLW"],
      ["f3-defender", "Microsoft 365 F3 + Defender Suite FLW"],
      ["business-premium-defender", "Microsoft 365 Business Premium + Defender Suite"],
    ] as const)(
      "marks Agent Security as limited for %s and explains the Agent 365 prerequisite",
      (licenseId, licenseName) => {
        const note = getLimitedExperienceNoteForLicenses(
          [licenseId],
          "agent-security",
        );

        expect(isPlatformAvailableForLicense(licenseId, "agent-security")).toBe(true);
        expect(note?.title).toBe("Limited Agent Security experience");
        expect(note?.message).toContain(licenseName);
        expect(note?.message).toContain(
          "an Agent 365 license is a prerequisite for using the Conditional Access policies",
        );
        expect(note?.message).toContain(
          "Adding Agent 365 does not by itself provide the full Agent Security experience",
        );
        expect(getPlatformExperienceForLicenses([licenseId], "agent-security"))
          .toBe("limited");
      },
    );

    it("marks server repositories with an additional license as limited", () => {
      expect(
        getPlatformExperienceForLicenses(["e7"], "windows-servers"),
      ).toBe("limited");
    });
  });

  it("toggles licenses", () => {
    const e5 = licenses.find((license) => license.id === "e5")!;
    const e7 = licenses.find((license) => license.id === "e7")!;
    const selected = toggleLicenseSelection(toggleLicenseSelection([], e5), e7);

    expect(selected.map((license) => license.id)).toEqual(["e5", "e7"]);
    expect(toggleLicenseSelection(selected, e5)).toEqual([e7]);
  });

  it("unions capabilities across selected licenses", () => {
    expect(
      isPlatformAvailableForLicenses(["business-premium", "e5"], "linux-desktop"),
    ).toBe(true);
  });

  it("shows Linux Desktop for every eligible license", () => {
    const availableLinuxDesktopLicenses = licenses
      .filter((license) => isPlatformAvailableForLicense(license.id, "linux-desktop"))
      .map((license) => license.id);

    expect(availableLinuxDesktopLicenses).toEqual(
      licenses.filter((license) => license.eligible).map((license) => license.id),
    );
    expect(isPlatformAvailableForLicenses(["business-premium", "e5"], "linux-desktop"))
      .toBe(true);
  });

  it("preserves Linux Desktop's Defender for Endpoint Plan 2 upgrade guidance", () => {
    const note = getLimitedExperienceNoteForLicenses(
      ["business-premium"],
      "linux-desktop",
    );

    expect(note?.title).toBe("Limited Linux Desktop experience");
    expect(note?.message).toContain("purchase Microsoft Defender for Endpoint Plan 2");
    expect(
      getLimitedExperienceNoteForLicenses(["e3-defender-purview"], "linux-desktop"),
    ).toBeUndefined();
  });
});

describe("Business Premium-only results", () => {
  const licenseIds = ["business-premium"] as const;

  it("shows every in-scope repository, with Linux Desktop limited", () => {
    expect(
      platforms
        .filter((platform) => isPlatformAvailableForLicenses(licenseIds, platform.id))
        .map((platform) => platform.id),
    ).toEqual([
      "windows-11",
      "windows-servers",
      "ai-security",
      "ai-security-macos",
      "agent-security",
      "conditional-access",
      "linux-desktop",
      "linux-server",
      "macos",
      "ios-ipados",
      "android",
      "purview",
    ]);
  });

  describe("F-series Windows Server eligibility", () => {
    it.each(["f1", "f3", "f1-purview", "f3-purview"] as const)(
      "excludes %s from Windows Server policies",
      (licenseId) => {
        expect(isPlatformAvailableForLicense(licenseId, "windows-servers")).toBe(false);
        expect(getWindowsServerLicenseNotes([licenseId], "windows-servers")).toEqual([]);
        expect(isPlatformAvailableForLicense(licenseId, "linux-server")).toBe(true);
      },
    );

    it.each(["f1-defender", "f3-defender", "f1-defender-purview", "f3-defender-purview"] as const)(
      "offers %s limited Windows Server experience with separate server licensing",
      (licenseId) => {
        expect(isPlatformAvailableForLicense(licenseId, "windows-servers")).toBe(true);
        expect(getPlatformExperienceForLicenses([licenseId], "windows-servers")).toBe("limited");
        const notes = getWindowsServerLicenseNotes([licenseId], "windows-servers");
        expect(notes).toHaveLength(1);
        expect(notes[0]).toContain("Purchase either Microsoft Defender for Servers Plan 1 or Plan 2");
        expect(notes[0]).toContain("Microsoft Defender for Endpoint Server license for each server");
      },
    );

    it("does not unlock Windows Servers by combining base F-series and Purview-only plans", () => {
      expect(isPlatformAvailableForLicenses(["f1", "f3", "f1-purview", "f3-purview"], "windows-servers")).toBe(false);
    });

    it("unions valid entitlements without adding prerequisites from excluded F-series plans", () => {
      expect(isPlatformAvailableForLicenses(["f1", "f3-purview", "f3-defender"], "windows-servers")).toBe(true);
      expect(getWindowsServerLicenseNotes(["f1", "f3-purview", "f3-defender"], "windows-servers"))
        .toEqual(getWindowsServerLicenseNotes(["f3-defender"], "windows-servers"));
      expect(isPlatformAvailableForLicenses(["f1", "e5"], "windows-servers")).toBe(true);
      expect(getWindowsServerLicenseNotes(["f1", "e5"], "windows-servers"))
        .toEqual(getWindowsServerLicenseNotes(["e5"], "windows-servers"));
    });
  });

  it("names Entra ID P2 and the Defender Suite alternative for Conditional Access", () => {
    const message = getLimitedExperienceNoteForLicenses(
      licenseIds,
      "conditional-access",
    )?.message;

    expect(message).toContain("add Microsoft Entra ID Plan 2");
    expect(message).toContain("included with the Microsoft Defender Suite add-on");
    expect(message).toContain(
      "An Agent 365 license is required for all Agent 365 policy templates",
    );
  });

  it.each([
    "windows-11",
    "ai-security",
    "ai-security-macos",
    "macos",
    "ios-ipados",
    "android",
  ] as const)("requires Defender Suite for full %s coverage", (platformId) => {
    expect(
      getLimitedExperienceNoteForLicenses(licenseIds, platformId)?.message,
    ).toContain("add the Microsoft Defender Suite add-on");
  });

  it("requires Purview Suite for full Purview coverage", () => {
    expect(
      getLimitedExperienceNoteForLicenses(licenseIds, "purview")?.message,
    ).toContain("add the Microsoft Purview Suite add-on");
  });

  it("uses the Business server add-on message", () => {
    expect(getWindowsServerLicenseNote("business-premium")).toContain(
      "Microsoft Defender for Business servers",
    );
  });
});

describe("full-capability suite tier", () => {
  const fullSuiteLicenseIds = [
    "business-premium-defender-purview",
    "e5",
    "e3-defender-purview",
    "f3-defender-purview",
    "f1-defender-purview",
  ] as const;

  it.each(fullSuiteLicenseIds)("%s provides every in-scope platform", (licenseId) => {
    expect(
      platforms.filter((platform) =>
        isPlatformAvailableForLicense(licenseId, platform.id),
      ),
    ).toHaveLength(platforms.length);
  });

  describe("Microsoft 365 E7 results", () => {
    const licenseIds = ["e7"] as const;

    it("provides every in-scope repository", () => {
      expect(
        platforms.filter((platform) =>
          isPlatformAvailableForLicenses(licenseIds, platform.id),
        ),
      ).toHaveLength(platforms.length);
    });

    describe("Defender Suite package tier", () => {
      const defenderSuiteLicenseIds = [
        "business-premium-defender",
        "e3-defender",
        "f3-defender",
        "f1-defender",
      ] as const;

      it.each(defenderSuiteLicenseIds)(
        "%s provides Agent Security only when explicitly eligible",
        (licenseId) => {
          expect(isPlatformAvailableForLicense(licenseId, "agent-security"))
            .toBe(licenseId !== "e3-defender");
        },
      );

      it("makes Agent Security available for the supported base and suite licenses", () => {
        expect(
          licenses
            .filter((license) =>
              isPlatformAvailableForLicense(license.id, "agent-security"),
            )
            .map((license) => license.id),
        ).toEqual([
          "e7",
          "e5",
          "e3",
          "e3-defender-purview",
          "f3-defender",
          "f3-defender-purview",
          "f1-defender",
          "f1-defender-purview",
          "business-premium-defender-purview",
          "business-premium-defender",
          "business-premium",
        ]);
      });

      it.each(defenderSuiteLicenseIds)(
        "%s has notices only for AI Security, Conditional Access, Purview, and both servers",
        (licenseId) => {
          for (const platform of platforms) {
            const limitedNotice = getLimitedExperienceNoteForLicenses(
              [licenseId],
              platform.id,
            );

            if (platform.id === "ai-security" || platform.id === "ai-security-macos") {
              expect(limitedNotice?.message).toContain("Agent 365 license");
            } else if (platform.id === "conditional-access") {
              expect(limitedNotice?.message).toContain("Agent 365 license");
            } else if (platform.id === "agent-security" && licenseId !== "e3-defender") {
              expect(limitedNotice?.message).toContain(
                "Agent 365 license is a prerequisite for using the Conditional Access policies",
              );
            } else if (platform.id === "purview") {
              expect(limitedNotice?.message).toContain(
                licenseId.startsWith("f")
                  ? "Microsoft Purview Suite FLW add-on"
                  : "Microsoft Purview Suite add-on",
              );
            } else {
              expect(limitedNotice).toBeUndefined();
            }
          }
        },
      );

      it.each(defenderSuiteLicenseIds)(
        "%s uses the Endpoint Server add-on message",
        (licenseId) => {
          expect(getWindowsServerLicenseNotes([licenseId])).toEqual([
            "A Microsoft Defender for Endpoint Server license is also required for each on-premises server. For cloud or Azure Arc-enabled servers, a Microsoft Defender for Servers Plan 1 or Plan 2 subscription through Microsoft Defender for Cloud is required in addition to the selected Microsoft 365 licenses.",
          ]);
        },
      );
    });

    describe("Microsoft 365 F1-only results", () => {
      const licenseIds = ["f1"] as const;

      it("excludes Windows Servers but includes Linux Desktop", () => {
        expect(
          platforms
            .filter((platform) =>
              isPlatformAvailableForLicenses(licenseIds, platform.id),
            )
            .map((platform) => platform.id),
        ).toEqual([
          "windows-11",
          "ai-security",
          "ai-security-macos",
          "conditional-access",
          "linux-desktop",
          "linux-server",
          "macos",
          "ios-ipados",
          "android",
          "purview",
        ]);
      });

      describe("Microsoft 365 E3-only results", () => {
        const licenseIds = ["e3"] as const;

        it("mirrors F1 availability except for Windows Servers and Agent Security", () => {
          for (const platform of platforms) {
            if (platform.id === "windows-servers") {
              expect(isPlatformAvailableForLicenses(licenseIds, platform.id)).toBe(true);
              continue;
            }
            if (platform.id === "agent-security") {
              expect(isPlatformAvailableForLicenses(licenseIds, platform.id)).toBe(true);
              continue;
            }
            expect(
              isPlatformAvailableForLicenses(licenseIds, platform.id),
            ).toBe(isPlatformAvailableForLicenses(["f1"], platform.id));
          }
        });

        describe("Purview Suite package tier", () => {
          const purviewSuiteLicenseIds = [
            "business-premium-purview",
            "e3-purview",
            "f3-purview",
            "f1-purview",
          ] as const;

          it.each(purviewSuiteLicenseIds)(
            "%s provides the base-tier repositories including Linux Desktop",
            (licenseId) => {
              expect(
                platforms
                  .filter((platform) =>
                    isPlatformAvailableForLicense(licenseId, platform.id),
                  )
                  .map((platform) => platform.id),
              ).toEqual([
                "windows-11",
                ...(!licenseId.startsWith("f") ? ["windows-servers"] : []),
                "ai-security",
                "ai-security-macos",
                "conditional-access",
                "linux-desktop",
                "linux-server",
                "macos",
                "ios-ipados",
                "android",
                "purview",
              ]);
            },
          );

          it.each(purviewSuiteLicenseIds)(
            "%s provides full Purview without a limitation",
            (licenseId) => {
              expect(
                getLimitedExperienceNoteForLicenses([licenseId], "purview"),
              ).toBeUndefined();
            },
          );

          it.each(["business-premium-purview", "e3-purview"] as const)(
            "%s uses standard Defender Suite upgrade messages",
            (licenseId) => {
              const messages = ["windows-11", "ai-security", "ai-security-macos", "macos", "ios-ipados", "android"]
                .map(
                  (platformId) =>
                    getLimitedExperienceNoteForLicenses(
                      [licenseId],
                      platformId as Platform["id"],
                    )?.message ?? "",
                )
                .join(" ");

              expect(messages).toContain("Microsoft Defender Suite add-on");
              expect(messages).not.toContain("Defender Suite FLW");
            },
          );

          it.each(["f3-purview", "f1-purview"] as const)(
            "%s uses Defender Suite FLW upgrade messages",
            (licenseId) => {
              expect(
                getLimitedExperienceNoteForLicenses([licenseId], "windows-11")
                  ?.message,
              ).toContain("Microsoft Defender Suite FLW add-on");
            },
          );

          it("retains each family's server prerequisites", () => {
            expect(getWindowsServerLicenseNotes(["business-premium-purview"])[0]).toContain(
              "Microsoft Defender for Business servers",
            );
            expect(getWindowsServerLicenseNotes(["e3-purview"])[0]).toContain(
              "The Microsoft Defender Suite add-on is required",
            );
            for (const licenseId of ["f3-purview", "f1-purview"] as const) {
              expect(getWindowsServerLicenseNotes([licenseId])[0]).toContain(
                "Microsoft Defender for Endpoint Plan 2 or the Microsoft Defender Suite FLW add-on",
              );
            }
          });
        });

        it.each([
          "windows-11",
          "ai-security",
          "ai-security-macos",
          "macos",
          "ios-ipados",
          "android",
        ] as const)("uses the standard Defender Suite for limited %s coverage", (platformId) => {
          const message = getLimitedExperienceNoteForLicenses(
            licenseIds,
            platformId,
          )?.message;

          expect(message).toContain("Microsoft Defender Suite add-on");
          expect(message).not.toContain("Defender Suite FLW");
        });

        it("uses standard Defender Suite in Conditional Access guidance", () => {
          const message = getLimitedExperienceNoteForLicenses(
            licenseIds,
            "conditional-access",
          )?.message;

          expect(message).toContain("Microsoft Entra ID Plan 2");
          expect(message).toContain("Microsoft Defender Suite add-on");
          expect(message).not.toContain("Defender Suite FLW");
          expect(message).toContain("Agent 365 license");
        });

        it("uses standard Purview Suite for limited Purview", () => {
          const message = getLimitedExperienceNoteForLicenses(
            licenseIds,
            "purview",
          )?.message;

          expect(message).toContain("Microsoft Purview Suite add-on");
          expect(message).not.toContain("Purview Suite FLW");
        });

        it("combines Defender and server prerequisites", () => {
          expect(getWindowsServerLicenseNotes(licenseIds)).toEqual([
            "The Microsoft Defender Suite add-on is required. A Microsoft Defender for Endpoint Server license is also required for each on-premises server. For cloud or Azure Arc-enabled servers, a Microsoft Defender for Servers Plan 1 or Plan 2 subscription through Microsoft Defender for Cloud is required in addition to the selected Microsoft 365 licenses.",
          ]);
        });

        it("never lists Defender for Endpoint Plan 2 as an E3 upgrade path", () => {
          const relevantPlatforms = [
            "windows-11",
            "ai-security",
            "ai-security-macos",
            "macos",
            "ios-ipados",
            "android",
          ] as const;
          const messages = [
            ...relevantPlatforms.map(
              (platformId) =>
                getLimitedExperienceNoteForLicenses(licenseIds, platformId)
                  ?.message ?? "",
            ),
            ...getWindowsServerLicenseNotes(licenseIds),
          ];

          expect(messages.join(" ")).not.toContain("Defender for Endpoint Plan 2");
          expect(messages.every((message) => message.includes("Defender Suite"))).toBe(
            true,
          );
        });
      });

      it.each([
        "windows-11",
        "ai-security",
        "ai-security-macos",
        "macos",
        "ios-ipados",
        "android",
      ] as const)("uses Defender Suite FLW for limited %s coverage", (platformId) => {
        const message = getLimitedExperienceNoteForLicenses(
          licenseIds,
          platformId,
        )?.message;

        expect(message).toContain("Microsoft Defender Suite FLW add-on");
        expect(message).not.toContain("Microsoft Defender Suite add-on");
      });

      it("uses Defender Suite FLW in Conditional Access guidance", () => {
        const message = getLimitedExperienceNoteForLicenses(
          licenseIds,
          "conditional-access",
        )?.message;

        expect(message).toContain("Microsoft Entra ID Plan 2");
        expect(message).toContain("Microsoft Defender Suite FLW add-on");
        expect(message).toContain("Agent 365 license");
      });

      it("uses Purview Suite FLW for the limited Purview experience", () => {
        const message = getLimitedExperienceNoteForLicenses(
          licenseIds,
          "purview",
        )?.message;

        expect(message).toContain("Microsoft Purview Suite FLW add-on");
        expect(message).not.toContain("Microsoft Purview Suite add-on");
      });

      it("combines the FLW and server prerequisites in one server message", () => {
        expect(getWindowsServerLicenseNotes(licenseIds)).toEqual([
          "Microsoft Defender for Endpoint Plan 2 or the Microsoft Defender Suite FLW add-on is required. A Microsoft Defender for Endpoint Server license is also required for each on-premises server. For cloud or Azure Arc-enabled servers, a Microsoft Defender for Servers Plan 1 or Plan 2 subscription through Microsoft Defender for Cloud is required in addition to the selected Microsoft 365 licenses.",
        ]);
      });
    });

    it("shows no limited-experience messages", () => {
      for (const platform of platforms) {
        expect(
          getLimitedExperienceNoteForLicenses(licenseIds, platform.id),
        ).toBeUndefined();
      }
    });

    it("uses the Endpoint Server add-on message for both server results", () => {
      const notes = getWindowsServerLicenseNotes(licenseIds);

      expect(notes).toHaveLength(1);
      expect(notes[0]).toBe(
        "A Microsoft Defender for Endpoint Server license is also required for each on-premises server. For cloud or Azure Arc-enabled servers, a Microsoft Defender for Servers Plan 1 or Plan 2 subscription through Microsoft Defender for Cloud is required in addition to the selected Microsoft 365 licenses.",
      );
    });
  });

  it.each(fullSuiteLicenseIds)(
    "%s has no limited notice outside AI Security, Agent Security, and Conditional Access",
    (licenseId) => {
      for (const platform of platforms.filter(
        (item) =>
          item.id !== "ai-security" &&
          item.id !== "ai-security-macos" &&
          item.id !== "agent-security" &&
          item.id !== "conditional-access",
      )) {
        expect(
          getLimitedExperienceNoteForLicenses([licenseId], platform.id),
        ).toBeUndefined();
      }
    },
  );

  it.each(fullSuiteLicenseIds)(
    "%s requires Agent 365 for full Conditional Access",
    (licenseId) => {
      const note = getLimitedExperienceNoteForLicenses(
        [licenseId],
        "conditional-access",
      );

      expect(note?.title).toBe(
        "Agent 365 license required for full Conditional Access experience",
      );
      expect(note?.message).toContain("add an Agent 365 license");
      expect(note?.message).toContain("Agent 365 is also included in Microsoft 365 E7");
      expect(note?.message).not.toContain("Microsoft Entra ID Plan 2");
    },
  );

  it("marks Conditional Access limited for every eligible license except E7", () => {
    for (const license of licenses.filter(
      (candidate) => candidate.eligible && candidate.id !== "e7",
    )) {
      expect(
        getLimitedExperienceNoteForLicenses(
          [license.id],
          "conditional-access",
        ),
        license.id,
      ).toBeDefined();
    }

    expect(
      getLimitedExperienceNoteForLicenses(["e7"], "conditional-access"),
    ).toBeUndefined();
  });

  it.each(fullSuiteLicenseIds)(
    "%s requires Agent 365 for full Agent Security",
    (licenseId) => {
      const note = getLimitedExperienceNoteForLicenses(
        [licenseId],
        "agent-security",
      );

      expect(note?.title).toBe(
        "Agent 365 license required for full Agent Security experience",
      );
      expect(note?.message).toContain("add an Agent 365 license");
      expect(note?.message).toContain("Agent 365 is also included in Microsoft 365 E7");
    },
  );

  it.each(fullSuiteLicenseIds)(
    "%s requires Agent 365 for full AI Security",
    (licenseId) => {
      const note = getLimitedExperienceNoteForLicenses(
        [licenseId],
        "ai-security",
      );

      expect(note?.title).toBe(
        "Agent 365 license required for full AI Security experience",
      );
      expect(note?.message).toContain("add an Agent 365 license");
      expect(note?.message).toContain("Agent 365 is also included in Microsoft 365 E7");
    },
  );

  it.each(fullSuiteLicenseIds)(
    "%s requires Agent 365 for full AI Security macOS",
    (licenseId) => {
      const note = getLimitedExperienceNoteForLicenses(
        [licenseId],
        "ai-security-macos",
      );

      expect(note?.title).toBe(
        "Agent 365 license required for full AI Security experience",
      );
      expect(note?.message).toContain("add an Agent 365 license");
      expect(note?.message).toContain("AI Security macOS");
      expect(note?.message).toContain("Agent 365 is also included in Microsoft 365 E7");
    },
  );

  it.each(fullSuiteLicenseIds)(
    "%s uses the Endpoint Server add-on message",
    (licenseId) => {
      const notes = getWindowsServerLicenseNotes([licenseId]);

      expect(notes).toHaveLength(1);
      expect(notes[0]).toContain("Microsoft Defender for Endpoint Server");
      expect(notes[0]).toContain("Microsoft Defender for Servers Plan 1 or Plan 2");
    },
  );

  it("does not duplicate the server message for a multi-license full-suite selection", () => {
    expect(getWindowsServerLicenseNotes(fullSuiteLicenseIds)).toHaveLength(1);
  });
});
