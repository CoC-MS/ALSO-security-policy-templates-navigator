import { Fragment, useEffect, useState, type FormEvent } from "react";
import {
  getPlatform,
  getLimitedExperienceNoteForLicenses,
  getCloudAppsConditionalAccessLicenseNote,
  requiresWorkloadIdPremiumForOAuthApps,
  enterpriseLicenses,
  platforms,
  smbLicenses,
  getPlatformRepositories,
  getWindowsServerLicenseNotes,
  isPlatformAvailableForLicenses,
  toggleLicenseSelection,
  type License,
  type Platform,
} from "./catalog";
import {
  getSolutionPlatformIds,
  getDataSecurityLicenseNote,
  getEndpointFeatureLicenseNote,
  getSecurityGoalOptions,
  getSecurityGoalOptionChildren,
  getSecurityGoalOptionExperience,
  isSecurityGoalOptionAvailable,
  securityGoals,
  toggleSecurityGoalSelection,
  type SecurityGoalId,
  type SolutionOption,
} from "./solutionCatalog";
import {
  filterPlatformsByTopics,
  getRepositoryMetadata,
  type RepositoryMetadata,
  type RepositoryMetadataIndex,
} from "./repositoryMetadata";
import { PolicyCounters } from "./PolicyCounters";
import { Faq } from "./Faq";
import {
  AiSecurityLicenseActions,
  shouldShowAiSecurityLicenseActions,
} from "./AiSecurityLicenseActions";

type Step =
  | "license"
  | "goal"
  | "focus"
  | "endpoint-categories"
  | "blocked"
  | "result"
  | "overview"
  | "faq";

function renderWindowsServerLicenseNote(note: string) {
  const productTermsPrerequisite =
    "Microsoft Defender for Business servers license";
  const endpointServerPrerequisite =
    "Microsoft Defender for Endpoint Server license";
  const defenderForServersPrerequisite =
    "Microsoft Defender for Servers Plan 1 or Plan 2";
  const parts = note.split(
    /(Microsoft Defender for Business servers license|Microsoft Defender for Endpoint Server license|Microsoft Defender for Servers Plan 1 or Plan 2)/g,
  );
  if (parts.length === 1) return note;

  return parts.map((part, index) => (
    <Fragment key={index}>
      {part === productTermsPrerequisite ? (
        <>
          {part} (
          <a
            href="https://www.microsoft.com/licensing/terms/productoffering/MicrosoftDefenderforBusinessservers/MCA#ServiceSpecificTerms"
            target="_blank"
            rel="noopener noreferrer"
          >
            Microsoft Product Terms
          </a>
          )
        </>
      ) : part === endpointServerPrerequisite ? (
        <>
          {part} (
          <a
            href="https://www.microsoft.com/licensing/terms/productoffering/MicrosoftDefenderforEndpointforservers/MCA"
            target="_blank"
            rel="noopener noreferrer"
          >
            Microsoft Product Terms
          </a>
          )
        </>
      ) : part === defenderForServersPrerequisite ? (
        <>
          {part} (
          <a
            href="https://www.microsoft.com/licensing/faqs/48"
            target="_blank"
            rel="noopener noreferrer"
          >
            Licensing Documents
          </a>
          )
        </>
      ) : part}
    </Fragment>
  ));
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18">
      <path d="M7 4h9v9M16 4 5 15M4 7v9h9" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function LicenseGrid({
  items,
  selected,
  onToggle,
}: {
  items: readonly License[];
  selected: readonly License[];
  onToggle: (license: License) => void;
}) {
  return (
    <div className="card-grid license-grid">
      {items.map((license) => {
        const isSelected = selected.some((item) => item.id === license.id);
        return (
          <button
            className={`choice-card ${isSelected ? "selected" : ""}`}
            type="button"
            key={license.id}
            aria-pressed={isSelected}
            onClick={() => onToggle(license)}
          >
            <span className="choice-icon" aria-hidden="true">M365</span>
            <span className="choice-name">{license.name}</span>
            <span className="choice-check" aria-hidden="true">{isSelected ? "\u2713" : ""}</span>
          </button>
        );
      })}
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const goalActive =
    step === "goal" ||
    step === "focus" ||
    step === "endpoint-categories" ||
    step === "result";
  return (
    <div className="steps" aria-label="Progress">
      <div className="step-item active">
        <span aria-hidden="true">1</span>
        <strong>Licenses</strong>
      </div>
      <div className="step-line" aria-hidden="true" />
      <div className={`step-item ${goalActive ? "active" : ""}`}>
        <span aria-hidden="true">2</span>
        <strong>Security goals</strong>
      </div>
      <div className="step-line" aria-hidden="true" />
      <div className={`step-item ${step === "result" ? "active" : ""}`}>
        <span aria-hidden="true">3</span>
        <strong>Recommended templates</strong>
      </div>
    </div>
  );
}

function RepositoryDetails({
  repositories,
  metadata,
  comingSoon = false,
}: {
  repositories: ReturnType<typeof getPlatformRepositories>;
  metadata: readonly RepositoryMetadata[];
  comingSoon?: boolean;
}) {
  return (
    <div className="repository-descriptions">
      {repositories.map((repository) => {
        const repositoryMetadata = getRepositoryMetadata(
          metadata,
          repository.url,
        );
        const description = comingSoon
          ? repository.description
          : repositoryMetadata?.description || repository.description;

        return (
          <section key={repository.url}>
            {repositories.length > 1 && <h3>{repository.name}</h3>}
            <p>{description}</p>
            {!comingSoon && (
              <div
                className="repository-topics"
                aria-label={`${repository.name} GitHub topics`}
              >
                {repositoryMetadata && repositoryMetadata.topics.length > 0 ? (
                  repositoryMetadata.topics.map((topic) => (
                    <span className="repository-topic" key={topic}>{topic}</span>
                  ))
                ) : (
                  <span className="repository-topic empty">No topics configured</span>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function uniquePlatforms(platformIds: readonly Platform["id"][]): Platform[] {
  return [...new Set(platformIds)].map(getPlatform);
}

interface RepositoryRecommendation {
  repository: ReturnType<typeof getPlatformRepositories>[number];
  sourcePlatform: Platform;
  solutionNames: string[];
  policyIds: string[];
  policyNotes: string[];
}

function getRepositoryRecommendations(
  selectedPlatforms: readonly Platform[],
  selectedOptions: readonly SolutionOption[],
): RepositoryRecommendation[] {
  const recommendations = new Map<string, RepositoryRecommendation>();

  for (const platform of selectedPlatforms) {
    const solutionNames = selectedOptions
      .filter((option) => option.platformIds.includes(platform.id))
      .map((option) => option.name);
    const policyIds = platform.id === "conditional-access"
      ? [...new Set(
        selectedOptions
          .filter((option) => option.platformIds.includes(platform.id))
          .flatMap((option) => option.recommendedPolicyIds ?? []),
      )]
      : [];
    const policyNotes = platform.id === "conditional-access"
      ? [...new Set(
        selectedOptions
          .filter((option) => option.platformIds.includes(platform.id))
          .map((option) => option.recommendedPolicyNote)
          .filter((note): note is string => note !== undefined),
      )]
      : [];

    for (const repository of getPlatformRepositories(platform)) {
      const existing = recommendations.get(repository.url);
      if (existing) {
        existing.solutionNames = [...new Set([...existing.solutionNames, ...solutionNames])];
        existing.policyIds = [...new Set([...existing.policyIds, ...policyIds])];
        existing.policyNotes = [...new Set([...existing.policyNotes, ...policyNotes])];
        if (
          "comingSoon" in existing.sourcePlatform &&
          existing.sourcePlatform.comingSoon &&
          !("comingSoon" in platform && platform.comingSoon)
        ) {
          existing.sourcePlatform = platform;
          existing.repository = repository;
        }
        continue;
      }

      recommendations.set(repository.url, {
        repository,
        sourcePlatform: platform,
        solutionNames,
        policyIds,
        policyNotes,
      });
    }
  }

  return [...recommendations.values()];
}

function isAutoSelectedOption(option: SolutionOption): boolean {
  return option.autoSelect === true;
}

function App() {
  const [step, setStep] = useState<Step>("license");
  const [overviewReturnStep, setOverviewReturnStep] = useState<Step>("license");
  const [faqReturnStep, setFaqReturnStep] = useState<Step>("license");
  const [selectedLicenses, setSelectedLicenses] = useState<License[]>([]);
  const [selectedGoalIds, setSelectedGoalIds] = useState<SecurityGoalId[]>([]);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [repositoryMetadata, setRepositoryMetadata] = useState<
    RepositoryMetadataIndex
  >({ generatedAt: "", repositories: [] });
  const [metadataStatus, setMetadataStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const eligibleLicenses = selectedLicenses.filter((license) => license.eligible);
  const eligibleLicenseIds = eligibleLicenses.map((license) => license.id);
  const selectedGoals = securityGoals.filter((goal) =>
    selectedGoalIds.includes(goal.id),
  );
  const endpointProtectionGoal = securityGoals.find(
    (goal) => goal.id === "endpoint-protection",
  )!;
  const selectedEndpointPlatforms = endpointProtectionGoal.options.filter((option) =>
    selectedOptionIds.includes(`endpoint-protection:${option.id}`),
  );
  const selectedEndpointCategoryIds = selectedOptionIds.filter((selectionId) =>
    endpointProtectionGoal.options.some((option) =>
      getSecurityGoalOptionChildren(option).some((child) =>
        selectionId === `endpoint-protection:${child.id}`,
      ),
    ),
  );
  const selectedOptions = selectedGoals.flatMap((goal) =>
    getSecurityGoalOptions(goal.id)
      .filter((option) =>
        isAutoSelectedOption(option) ||
        selectedOptionIds.includes(`${goal.id}:${option.id}`),
      )
      .map((option) => ({
        ...option,
        selectionId: `${goal.id}:${option.id}`,
      })),
  );
  const selectedPlatformIds = selectedGoals.flatMap((goal) =>
    getSolutionPlatformIds(
      goal.id,
      getSecurityGoalOptions(goal.id)
        .filter((option) =>
          isAutoSelectedOption(option) ||
          selectedOptionIds.includes(`${goal.id}:${option.id}`),
        )
        .map((option) => option.id),
    ),
  );
  const selectedPlatforms = selectedGoals.length > 0
    ? uniquePlatforms(selectedPlatformIds)
      .filter((platform) =>
        isPlatformAvailableForLicenses(eligibleLicenseIds, platform.id),
      )
    : [];
  const recommendedRepositories = getRepositoryRecommendations(
    selectedPlatforms,
    selectedOptions,
  );
  const overviewPlatforms = filterPlatformsByTopics(
    platforms,
    repositoryMetadata.repositories,
    searchQuery,
  );

  useEffect(() => {
    document.getElementById("main-title")?.focus();
  }, [step]);

  useEffect(() => {
    let cancelled = false;

    async function loadRepositoryMetadata() {
      try {
        const response = await fetch(
          `${import.meta.env.BASE_URL}repository-metadata.json`,
          { cache: "no-store" },
        );
        if (!response.ok) {
          throw new Error(`Repository metadata request failed: ${response.status}`);
        }
        const index = await response.json() as RepositoryMetadataIndex;
        if (!Array.isArray(index.repositories)) {
          throw new Error("Repository metadata is invalid.");
        }
        if (!cancelled) {
          setRepositoryMetadata(index);
          setMetadataStatus("ready");
        }
      } catch (error) {
        console.error("Unable to load repository metadata.", error);
        if (!cancelled) setMetadataStatus("error");
      }
    }

    void loadRepositoryMetadata();
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleLicense(license: License) {
    setSelectedLicenses((current) => toggleLicenseSelection(current, license));
  }

  function continueFromLicenses() {
    if (eligibleLicenses.length === 0) {
      setStep("blocked");
      return;
    }

    setSelectedGoalIds([]);
    setSelectedOptionIds([]);
    setStep("goal");
  }

  function chooseGoal(goalId: SecurityGoalId) {
    const isSelected = selectedGoalIds.includes(goalId);
    setSelectedGoalIds((current) => toggleSecurityGoalSelection(current, goalId));
    if (isSelected) {
      setSelectedOptionIds((current) =>
        current.filter((selection) => !selection.startsWith(`${goalId}:`)),
      );
    }
  }

  function toggleOption(goalId: SecurityGoalId, optionId: string) {
    const selection = `${goalId}:${optionId}`;
    const goal = securityGoals.find((item) => item.id === goalId);
    const parentOption = goal?.options.find((option) => option.id === optionId);
    setSelectedOptionIds((current) =>
      current.includes(selection)
        ? current.filter((selectedId) =>
          selectedId !== selection &&
          !(parentOption && getSecurityGoalOptionChildren(parentOption).some((child) =>
            selectedId === `${goalId}:${child.id}`,
          )),
        )
        : [...current, selection],
    );
  }

  function renderOptionCard(
    goalId: SecurityGoalId,
    option: SolutionOption,
    index: number,
    isChild = false,
  ) {
    const selectionId = `${goalId}:${option.id}`;
    const isSelected = selectedOptionIds.includes(selectionId);
    const optionAvailable = isSecurityGoalOptionAvailable(
      goalId,
      option.id,
      eligibleLicenseIds,
    );
    const optionPlatforms = optionAvailable
      ? option.platformIds.filter((platformId) =>
        isPlatformAvailableForLicenses(eligibleLicenseIds, platformId),
      )
      : [];
    const experience = getSecurityGoalOptionExperience(
      goalId,
      eligibleLicenseIds,
      optionPlatforms,
      option.id,
    );
    const featureNote = getEndpointFeatureLicenseNote(
      option.endpointFeature,
      eligibleLicenseIds,
      option.platformIds[0],
    );

    return (
      <button
        className={`choice-card goal-card ${isChild ? "endpoint-category-card" : ""} ${isSelected ? "selected" : ""}`}
        type="button"
        key={selectionId}
        aria-pressed={isSelected}
        disabled={!optionAvailable}
        onClick={() => toggleOption(goalId, option.id)}
      >
        <span className="choice-icon" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        <span className="choice-details">
          <span className="choice-name">{option.name}</span>
          <span className="goal-description">{option.description}</span>
          {!optionAvailable && (
            <span className="goal-description">
              {featureNote ?? "Not included with the selected licenses."}
            </span>
          )}
          {optionPlatforms.length > 0 && (
            <span className={`experience-badge ${experience}`}>
              {experience === "full" ? "Full experience" : "Limited experience"}
            </span>
          )}
        </span>
        <span className="choice-check" aria-hidden="true">{isSelected ? "\u2713" : ""}</span>
      </button>
    );
  }

  function continueFromFocus() {
    if (selectedGoalIds.includes("endpoint-protection")) {
      if (selectedEndpointPlatforms.length > 0) setStep("endpoint-categories");
      return;
    }
    if (selectedOptions.length > 0) setStep("result");
  }

  function continueFromEndpointCategories() {
    if (selectedEndpointCategoryIds.length > 0) setStep("result");
  }

  function startOver() {
    setSelectedLicenses([]);
    setSelectedGoalIds([]);
    setSelectedOptionIds([]);
    setStep("license");
  }

  function showOverview() {
    setOverviewReturnStep(step === "overview" ? overviewReturnStep : step);
    setStep("overview");
  }

  function showFaq() {
    setFaqReturnStep(step === "faq" ? faqReturnStep : step);
    setStep("faq");
  }

  function submitRepositorySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchQuery(searchInput.trim());
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href={import.meta.env.BASE_URL} aria-label="ALSO Microsoft Security Policy Templates Navigator home">
            <img className="brand-logo" src={`${import.meta.env.BASE_URL}also-logo.png`} alt="ALSO" />
            <span className="brand-divider" aria-hidden="true" />
            <span className="brand-title-group">
              <span className="brand-product">ALSO Microsoft Security Policy Templates Navigator</span>
              <span className="brand-preview">Public Preview</span>
            </span>
          </a>
          <div className="header-actions">
            <button
              className="button secondary issue-link"
              type="button"
              onClick={showOverview}
            >
              Overview
            </button>
            <button
              className="button secondary issue-link"
              type="button"
              onClick={showFaq}
            >
              FAQ
            </button>
            <a
              className="button secondary issue-link"
              href="https://github.com/CoC-MS/ALSO-security-policy-templates-navigator/issues/new/choose"
              target="_blank"
              rel="noopener noreferrer"
            >
              Report problem
            </a>
          </div>
          <label className="language-menu">
            <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
            </svg>
            <select aria-label="Language" defaultValue="en">
              <option value="en">English</option>
              <option value="de" disabled>Deutsch (coming)</option>
              <option value="fr" disabled>Français (coming)</option>
              <option value="es" disabled>Español (coming)</option>
            </select>
          </label>
        </div>
      </header>

      <main>
        <div className="content">
          {step !== "blocked" && step !== "overview" && step !== "faq" && <StepIndicator step={step} />}
          {step === "license" && (
            <PolicyCounters metadata={repositoryMetadata} status={metadataStatus} />
          )}
          {step === "faq" && (
            <>
              <Faq />
              <div className="actions centered">
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => setStep(faqReturnStep)}
                >
                  &larr; Back
                </button>
              </div>
            </>
          )}

          {step === "overview" && (
            <section className="result-wrap" aria-labelledby="main-title">
              <div className="result-heading">
                <div className="eyebrow">Complete template catalog</div>
                <h1 id="main-title" tabIndex={-1}>All security policy templates</h1>
                <p>Browse every available platform and open its policy template repository directly.</p>
              </div>
              <form
                className="repository-search"
                role="search"
                onSubmit={submitRepositorySearch}
              >
                <label htmlFor="repository-search">Search policy templates</label>
                <div className="repository-search-controls">
                  <input
                    id="repository-search"
                    type="search"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search GitHub topics, for example agentsecurity..."
                    disabled={metadataStatus !== "ready"}
                  />
                  <button className="button primary" type="submit">Search</button>
                  {searchQuery && (
                    <button
                      className="button secondary"
                      type="button"
                      onClick={() => {
                        setSearchInput("");
                        setSearchQuery("");
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>
              <div aria-live="polite">
                {metadataStatus === "loading" && (
                  <p className="search-summary">Loading GitHub topics...</p>
                )}
                {metadataStatus === "error" && (
                  <p className="search-summary search-error" role="alert">
                    GitHub topics are temporarily unavailable.
                  </p>
                )}
                {metadataStatus === "ready" && searchQuery && (
                  <p className="search-summary">
                    {overviewPlatforms.length === 0
                      ? `No repository topics found for "${searchQuery}".`
                      : `${overviewPlatforms.length} ${overviewPlatforms.length === 1 ? "repository section" : "repository sections"} found for "${searchQuery}".`}
                    {repositoryMetadata.generatedAt && (
                      <span className="search-index-date">
                        {" "}Topics refreshed {new Date(repositoryMetadata.generatedAt).toLocaleDateString()}.
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="overview-heading">
                <h2>Repository overview</h2>
                <p>Browse all repositories directly.</p>
              </div>
              <div className="recommendation-grid">
                {overviewPlatforms.map((platform) => {
                  const repositories = getPlatformRepositories(platform);
                  const comingSoon = "comingSoon" in platform && platform.comingSoon;
                  return (
                    <article className="recommendation-card" key={platform.id}>
                      <span className="choice-icon" aria-hidden="true">{platform.shortLabel}</span>
                      <div className="platform-title">
                        <h2>{platform.name}</h2>
                        {comingSoon && <span className="experience-badge coming-soon-badge">Coming</span>}
                      </div>
                      <RepositoryDetails
                        repositories={repositories}
                        metadata={repositoryMetadata.repositories}
                        comingSoon={comingSoon}
                      />
                      <div className="repository-links">
                        {comingSoon ? (
                          <button className="button primary repository-link" type="button" disabled>
                            AI Security macOS repository coming soon
                          </button>
                        ) : repositories.map((repository) => (
                            <a
                              className="button primary repository-link"
                              href={repository.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              key={repository.url}
                            >
                              Open {repository.name} repository <ArrowIcon />
                            </a>
                          ))}
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="actions centered">
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => setStep(overviewReturnStep)}
                >
                  &larr; Back
                </button>
              </div>
            </section>
          )}

          {step === "license" && (
            <section aria-labelledby="main-title">
              <div className="eyebrow">Find your security policy templates</div>
              <h1 id="main-title" tabIndex={-1}>Which Microsoft 365 licenses does your customer have?</h1>
              <p className="intro">Select all current licenses. Next, choose the security challenges your customer wants to solve to find relevant ALSO security policy templates.</p>
              <div className="license-section" aria-labelledby="enterprise-heading">
                <h2 id="enterprise-heading">Enterprise</h2>
                <LicenseGrid items={enterpriseLicenses} selected={selectedLicenses} onToggle={toggleLicense} />
              </div>
              <div className="license-section" aria-labelledby="smb-heading">
                <h2 id="smb-heading">SMB</h2>
                <LicenseGrid items={smbLicenses} selected={selectedLicenses} onToggle={toggleLicense} />
              </div>
              {selectedLicenses.length > 0 && (
                <div className="actions license-actions">
                  <button
                    className="button primary"
                    type="button"
                    onClick={continueFromLicenses}
                  >
                    Continue with {selectedLicenses.length} license{selectedLicenses.length === 1 ? "" : "s"} &rarr;
                  </button>
                </div>
              )}
            </section>
          )}

          {step === "goal" && eligibleLicenses.length > 0 && (
            <section aria-labelledby="main-title">
              <div className="selection-pills" aria-label="Selected eligible licenses">
                {eligibleLicenses.map((license) => (
                  <span className="selection-pill" key={license.id}>
                    <span aria-hidden="true">&#10003;</span>{license.name}
                  </span>
                ))}
              </div>
              <h1 id="main-title" tabIndex={-1}>What security challenges are you trying to solve?</h1>
              <p className="intro">Select one or more security goals. Select a goal again to remove it. You can combine any goals before continuing.</p>
              <div className="card-grid goal-grid" aria-label="Security goals">
                {securityGoals.map((goal, index) => (
                  <button
                    className={`choice-card goal-card ${selectedGoalIds.includes(goal.id) ? "selected" : ""}`}
                    type="button"
                    key={goal.id}
                    aria-pressed={selectedGoalIds.includes(goal.id)}
                    onClick={() => chooseGoal(goal.id)}
                  >
                    <span className="choice-icon" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <span className="choice-details">
                      <span className="choice-name">{goal.name}</span>
                      <span className="goal-description">{goal.description}</span>
                    </span>
                    <span className="choice-check" aria-hidden="true">{selectedGoalIds.includes(goal.id) ? "\u2713" : ""}</span>
                  </button>
                ))}
              </div>
              <div className="actions platform-actions">
                <div>
                  <button className="button secondary" type="button" onClick={() => setStep("license")}>&larr; Back</button>
                  <button className="button text-button" type="button" onClick={startOver}>Start over</button>
                </div>
                <button
                  className="button primary"
                  type="button"
                  disabled={selectedGoals.length === 0}
                  onClick={() => {
                    if (selectedGoals.length === 0) return;
                    setStep(
                      selectedGoals.every((goal) =>
                        goal.options.every(isAutoSelectedOption),
                      )
                        ? "result"
                        : "focus",
                    );
                  }}
                >
                  {selectedGoals.length > 0
                    ? `Continue with ${selectedGoals.length} security goal${selectedGoals.length === 1 ? "" : "s"}`
                    : "Select at least one security goal"} &rarr;
                </button>
              </div>
            </section>
          )}

          {step === "focus" && selectedGoals.length > 0 && eligibleLicenses.length > 0 && (
            <section aria-labelledby="main-title">
              <div className="selection-pills" aria-label="Selected eligible licenses">
                {eligibleLicenses.map((license) => (
                  <span className="selection-pill" key={license.id}>
                    <span aria-hidden="true">&#10003;</span>{license.name}
                  </span>
                ))}
              </div>
              <div className="eyebrow">Your selected security goals</div>
              <h1 id="main-title" tabIndex={-1}>
                {selectedGoalIds.length === 1 &&
                selectedGoalIds[0] === "endpoint-protection"
                  ? "Choose endpoint platforms"
                  : selectedGoalIds.length === 1 &&
                    selectedGoalIds[0] === "data-protection"
                    ? "Choose Data Security categories"
                    : "Choose the scenarios and platforms to include"}
              </h1>
              <p className="intro">
                {selectedGoalIds.length === 1 &&
                selectedGoalIds[0] === "endpoint-protection"
                  ? "Select the operating systems you want to protect, then choose policy categories for each."
                  : selectedGoalIds.length === 1 &&
                    selectedGoalIds[0] === "data-protection"
                    ? "Select the Purview policy categories to include in your recommendations."
                    : "Select one or more options under each goal. Select an option again to remove it. Recommendations will be matched to the licenses selected above."}
              </p>
              <div className="goal-option-sections">
                {selectedGoals.filter((goal) =>
                  goal.options.some((option) => !isAutoSelectedOption(option)),
                ).map((goal) => (
                  <section className="goal-option-section" key={goal.id} aria-labelledby={`${goal.id}-heading`}>
                    <h2 id={`${goal.id}-heading`}>{goal.name}</h2>
                    <p>{goal.prompt}</p>
                    <div className="card-grid goal-option-grid" aria-label={`${goal.name} options`}>
                      {goal.options.filter((option) => !isAutoSelectedOption(option)).map((option, index) => {
                        return renderOptionCard(goal.id, option, index);
                      })}
                    </div>
                  </section>
                ))}
              </div>
              <div className="actions platform-actions">
                <div>
                  <button className="button secondary" type="button" onClick={() => setStep("goal")}>&larr; Back</button>
                  <button className="button text-button" type="button" onClick={startOver}>Start over</button>
                </div>
                <button
                  className="button primary"
                  type="button"
                  disabled={
                    selectedGoalIds.includes("endpoint-protection")
                      ? selectedEndpointPlatforms.length === 0
                      : selectedOptions.length === 0
                  }
                  onClick={continueFromFocus}
                >
                  {selectedGoalIds.includes("endpoint-protection")
                    ? "Choose endpoint policy categories"
                    : "View recommendations"} &rarr;
                </button>
              </div>
            </section>
          )}

          {step === "endpoint-categories" &&
            selectedEndpointPlatforms.length > 0 &&
            eligibleLicenses.length > 0 && (
              <section aria-labelledby="main-title">
                <div className="selection-pills" aria-label="Selected eligible licenses">
                  {eligibleLicenses.map((license) => (
                    <span className="selection-pill" key={license.id}>
                      <span aria-hidden="true">&#10003;</span>{license.name}
                    </span>
                  ))}
                </div>
                <div className="eyebrow">Endpoint protection</div>
                <h1 id="main-title" tabIndex={-1}>Choose policy categories</h1>
                <p className="intro">
                  Select categories for the endpoint platforms you chose. Each selection will lead to its matching ALSO repository.
                </p>
                <div className="goal-option-sections">
                  {selectedEndpointPlatforms.map((platformOption) => (
                    <section
                      className="goal-option-section"
                      key={platformOption.id}
                      aria-labelledby={`${platformOption.id}-categories-heading`}
                    >
                      <h2 id={`${platformOption.id}-categories-heading`}>
                        {platformOption.name}
                      </h2>
                      <div className="card-grid endpoint-subcategory-grid">
                        {getSecurityGoalOptionChildren(platformOption).map((child, index) =>
                          renderOptionCard("endpoint-protection", child, index, true),
                        )}
                      </div>
                    </section>
                  ))}
                </div>
                <div className="actions platform-actions">
                  <div>
                    <button
                      className="button secondary"
                      type="button"
                      onClick={() => setStep("focus")}
                    >
                      &larr; Back to platforms
                    </button>
                    <button className="button text-button" type="button" onClick={startOver}>
                      Start over
                    </button>
                  </div>
                  <button
                    className="button primary"
                    type="button"
                    disabled={selectedEndpointCategoryIds.length === 0}
                    onClick={continueFromEndpointCategories}
                  >
                    {selectedEndpointCategoryIds.length === 0
                      ? "Select at least one category"
                      : "View recommendations"} &rarr;
                  </button>
                </div>
              </section>
            )}

          {step === "blocked" && selectedLicenses.length > 0 && (
            <section className="result-wrap" aria-labelledby="main-title">
              <div className="result-card blocked-card">
                <div className="result-icon blocked-icon" aria-hidden="true">!</div>
                <div className="eyebrow">License prerequisite</div>
                <h1 id="main-title" tabIndex={-1}>A higher license is needed</h1>
                <p>{selectedLicenses.map((license) => license.name).join(" and ")} {selectedLicenses.length === 1 ? "does" : "do"} not meet the minimum prerequisite for these security policy templates.</p>
                <p>The minimum supported license is <strong>Microsoft 365 Business Premium</strong>. No applicable templates are available for your selected licenses.</p>
                <button className="button primary" type="button" onClick={startOver}>&larr; Start over</button>
              </div>
            </section>
          )}

          {step === "result" && eligibleLicenses.length > 0 && selectedGoals.length > 0 && selectedOptions.length > 0 && (
            <section className="result-wrap" aria-labelledby="main-title">
              <div className="result-heading">
                <div className="eyebrow">{selectedGoals.map((goal) => goal.name).join(" + ")}</div>
                <h1 id="main-title" tabIndex={-1}>Recommended security policy templates</h1>
                <p>Based on <strong>{eligibleLicenses.map((license) => license.name).join(", ")}</strong> and the needs you selected, explore these ALSO repositories.</p>
                <div className="recommendation-context" aria-label="Selected needs">
                  {selectedOptions.map((option) => (
                    <span className="selection-pill" key={option.selectionId}>{option.name}</span>
                  ))}
                </div>
              </div>
              {recommendedRepositories.length > 0 ? (
                <div className="result-recommendations-layout">
                  <div className="recommendation-grid result-recommendation-grid">
                  {recommendedRepositories.map(({ repository, sourcePlatform, solutionNames, policyIds, policyNotes }) => {
                  const comingSoon = "comingSoon" in sourcePlatform && sourcePlatform.comingSoon;
                  const platformSelections = selectedOptions.filter((option) =>
                    option.platformIds.some((platformId) =>
                      platformId === sourcePlatform.id,
                    ),
                  );
                  const attackProtectionOnly =
                    platformSelections.length > 0 &&
                    platformSelections.every((option) =>
                      option.selectionId.startsWith("attack-protection:"),
                    );
                  const suppressAgent365Guidance = sourcePlatform.id === "conditional-access" &&
                    platformSelections.length > 0 &&
                    platformSelections.every((option) =>
                      option.selectionId.startsWith("attack-protection:") ||
                      option.selectionId === "app-protection:oauth-apps",
                    );
                  const oauthAppsOnly =
                    sourcePlatform.id === "conditional-access" &&
                    platformSelections.length === 1 &&
                    platformSelections[0].selectionId === "app-protection:oauth-apps";
                  const cloudAppsOnly =
                    sourcePlatform.id === "conditional-access" &&
                    platformSelections.length === 1 &&
                    platformSelections[0].selectionId === "app-protection:cloud-apps";
                  const limitedExperienceNote =
                    getLimitedExperienceNoteForLicenses(
                      eligibleLicenseIds,
                      sourcePlatform.id,
                      {
                        includeAgent365Guidance: !suppressAgent365Guidance,
                        includeConditionalAccessPolicyGuidance:
                          !oauthAppsOnly && !cloudAppsOnly && !attackProtectionOnly,
                      },
                    );
                  const cloudAppsConditionalAccessLicenseNote =
                    sourcePlatform.id === "conditional-access" && cloudAppsOnly
                      ? getCloudAppsConditionalAccessLicenseNote(eligibleLicenseIds)
                      : undefined;
                  const dataSecuritySelection = selectedOptions.some((option) =>
                    option.selectionId.startsWith("data-protection:") &&
                    option.platformIds.some((platformId) => platformId === "purview"),
                  );
                  const otherPurviewSelection = selectedOptions.some((option) =>
                    !option.selectionId.startsWith("data-protection:") &&
                    option.platformIds.some((platformId) => platformId === "purview"),
                  );
                  const dataSecurityLicenseNote =
                    sourcePlatform.id === "purview" && dataSecuritySelection
                      ? getDataSecurityLicenseNote(eligibleLicenseIds)
                      : undefined;
                  const endpointFeatureNotes = sourcePlatform.id !== "purview"
                    ? [...new Set(
                      platformSelections
                        .map((option) =>
                          getEndpointFeatureLicenseNote(
                            option.endpointFeature,
                            eligibleLicenseIds,
                            option.platformIds[0],
                          ),
                        )
                        .filter((note): note is string => note !== undefined),
                    )]
                    : [];
                  const needsOAuthAppsWorkloadIdLicense =
                    sourcePlatform.id === "conditional-access" &&
                    solutionNames.includes("OAuth apps") &&
                    requiresWorkloadIdPremiumForOAuthApps(eligibleLicenseIds);
                  const windowsServerNotes =
                    sourcePlatform.id === "windows-servers" ||
                    sourcePlatform.id === "linux-server"
                      ? getWindowsServerLicenseNotes(eligibleLicenseIds, sourcePlatform.id)
                      : [];
                  const showAiSecurityLicenseActions =
                    shouldShowAiSecurityLicenseActions(
                      eligibleLicenseIds,
                      sourcePlatform.id,
                    );
                  return (
                    <article
                      className={`recommendation-card${showAiSecurityLicenseActions ? " recommendation-card-ai-security" : ""}`}
                      key={repository.url}
                    >
                      <div className="recommendation-card-main">
                        <span className="choice-icon" aria-hidden="true">{sourcePlatform.shortLabel}</span>
                        <div className="platform-title">
                          <h2>{repository.name}</h2>
                          {comingSoon && <span className="experience-badge coming-soon-badge">Coming</span>}
                        </div>
                        <RepositoryDetails
                          repositories={[repository]}
                          metadata={repositoryMetadata.repositories}
                          comingSoon={comingSoon}
                        />
                        <p className="recommendation-reasons">
                          Recommended for: {solutionNames.join(", ")}
                        </p>
                        {policyIds.length > 0 && (
                          <div className="recommended-policy-list">
                            <p>
                              <strong>Recommended Conditional Access policies:</strong>{" "}
                              {policyIds.map((policyId) => (
                                <span className="recommended-policy-id" key={policyId}>{policyId}</span>
                              ))}
                            </p>
                            {policyNotes.map((note) => <p className="recommended-policy-note" key={note}>{note}</p>)}
                          </div>
                        )}
                        {limitedExperienceNote &&
                          endpointFeatureNotes.length === 0 &&
                          !(sourcePlatform.id === "purview" &&
                            dataSecuritySelection &&
                            !otherPurviewSelection &&
                            dataSecurityLicenseNote) && (
                          <aside className="license-requirement-note">
                            <strong>{limitedExperienceNote.title}</strong>
                            <p>{limitedExperienceNote.message}</p>
                            {limitedExperienceNote.message.includes("Agent 365 license") && (
                              <p>
                                Learn more about Agent 365 licensing:{" "}
                                <a
                                  href="https://www.microsoft.com/licensing/terms/productoffering/Agent365/MCA#ServiceSpecificTerms"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Microsoft Product Terms
                                </a>
                                {" | "}
                                <a
                                  href="https://www.microsoft.com/licensing/faqs/122"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Licensing Documents
                                </a>
                                .
                              </p>
                            )}
                          </aside>
                        )}
                        {dataSecurityLicenseNote && (
                          <aside className="license-requirement-note">
                            <strong>Limited Data Security experience</strong>
                            <p>{dataSecurityLicenseNote}</p>
                          </aside>
                        )}
                        {endpointFeatureNotes.map((note) => (
                          <aside className="license-requirement-note" key={note}>
                            <strong>Endpoint category licensing note</strong>
                            <p>{note}</p>
                          </aside>
                        ))}
                        {cloudAppsConditionalAccessLicenseNote && (
                          <aside className="license-requirement-note">
                            <strong>{cloudAppsConditionalAccessLicenseNote.title}</strong>
                            <p>{cloudAppsConditionalAccessLicenseNote.message}</p>
                          </aside>
                        )}
                        {needsOAuthAppsWorkloadIdLicense && (
                          <aside className="license-requirement-note">
                            <strong>Microsoft Entra Workload ID Premium required for full experience</strong>
                            <p>
                              With the selected licenses, add Microsoft Entra Workload ID Premium licenses to unlock the full OAuth apps experience.{" "}
                              <a
                                href="https://learn.microsoft.com/en-gb/entra/workload-id/workload-identities-faqs?WT.mc_id=Portal-Microsoft_Azure_Support#how-many-licenses-do-i-need-to-purchase-do-i-need-to-license-all-workload-identities-including-microsoft-and-managed-service-identities"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Learn more about Microsoft Entra Workload ID licensing
                              </a>
                              .
                            </p>
                          </aside>
                        )}
                        {windowsServerNotes.map((note) => (
                          <aside className="license-requirement-note" key={note}>
                            <strong>Additional server license required</strong>
                            <p>{renderWindowsServerLicenseNote(note)}</p>
                          </aside>
                        ))}
                        <div className="repository-links">
                          {comingSoon ? (
                            <button className="button primary repository-link" type="button" disabled>
                              AI Security macOS templates coming soon
                            </button>
                          ) : (
                            <a
                              className="button primary repository-link"
                              href={repository.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              key={repository.url}
                            >
                              Open {repository.name} repository <ArrowIcon />
                            </a>
                          )}
                        </div>
                      </div>
                      {showAiSecurityLicenseActions && <AiSecurityLicenseActions />}
                    </article>
                  );
                  })}
                  </div>
                  <aside className="professional-services-panel" aria-labelledby="professional-services-heading">
                    <h2 id="professional-services-heading">
                      Need implementation help or consulting?
                    </h2>
                    <button className="professional-services-button" type="button" disabled>
                      Request Professional Services Help from ALSO CoE
                    </button>
                    <p>Coming soon</p>
                  </aside>
                </div>
              ) : (
                <div className="result-card">
                  <h2>No matching repositories for these licenses</h2>
                  <p>The selected security goal does not currently have repositories available for the licenses selected. Review the license selection or choose another security goal.</p>
                </div>
              )}
              <div className="actions centered">
                <button
                  className="button secondary"
                  type="button"
                  onClick={() =>
                    setStep(
                      selectedGoalIds.includes("endpoint-protection")
                        ? "endpoint-categories"
                        : selectedGoals.some((goal) =>
                          goal.options.some((option) => !isAutoSelectedOption(option)),
                      )
                        ? "focus"
                        : "goal",
                    )
                  }
                >
                  &larr; Back
                </button>
                <button className="button text-button" type="button" onClick={startOver}>Start over</button>
              </div>
            </section>
          )}
        </div>
      </main>

      <footer>
        <p>ALSO Microsoft Security Central Technical Team (c) 2026 All rights reserved</p>
      </footer>
    </div>
  );
}

export default App;
