import { useEffect, useState, type FormEvent } from "react";
import {
  getPlatform,
  getLimitedExperienceNoteForLicenses,
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

type Step = "license" | "goal" | "focus" | "blocked" | "result" | "overview" | "faq";

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
  const goalActive = step === "goal" || step === "focus" || step === "result";
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

    for (const repository of getPlatformRepositories(platform)) {
      const existing = recommendations.get(repository.url);
      if (existing) {
        existing.solutionNames = [...new Set([...existing.solutionNames, ...solutionNames])];
        existing.policyIds = [...new Set([...existing.policyIds, ...policyIds])];
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
      });
    }
  }

  return [...recommendations.values()];
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
  const selectedOptions = selectedGoals.flatMap((goal) =>
    goal.options
      .filter((option) => selectedOptionIds.includes(`${goal.id}:${option.id}`))
      .map((option) => ({
        ...option,
        selectionId: `${goal.id}:${option.id}`,
      })),
  );
  const selectedPlatformIds = selectedGoals.flatMap((goal) =>
    getSolutionPlatformIds(
      goal.id,
      goal.options
        .filter((option) => selectedOptionIds.includes(`${goal.id}:${option.id}`))
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
    setSelectedOptionIds((current) =>
      current.includes(selection)
        ? current.filter((selectedId) => selectedId !== selection)
        : [...current, selection],
    );
  }

  function continueFromFocus() {
    if (selectedOptionIds.length > 0) setStep("result");
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
                  onClick={() => selectedGoals.length > 0 && setStep("focus")}
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
              <h1 id="main-title" tabIndex={-1}>Choose the scenarios and platforms to include</h1>
              <p className="intro">Select one or more options under each goal. Select an option again to remove it. Recommendations will be matched to the licenses selected above.</p>
              <div className="goal-option-sections">
                {selectedGoals.map((goal) => (
                  <section className="goal-option-section" key={goal.id} aria-labelledby={`${goal.id}-heading`}>
                    <h2 id={`${goal.id}-heading`}>{goal.name}</h2>
                    <p>{goal.prompt}</p>
                    <div className="card-grid goal-option-grid" aria-label={`${goal.name} options`}>
                      {goal.options.map((option, index) => {
                        const selectionId = `${goal.id}:${option.id}`;
                        const isSelected = selectedOptionIds.includes(selectionId);
                        return (
                          <button
                            className={`choice-card goal-card ${isSelected ? "selected" : ""}`}
                            type="button"
                            key={selectionId}
                            aria-pressed={isSelected}
                            onClick={() => toggleOption(goal.id, option.id)}
                          >
                            <span className="choice-icon" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                            <span className="choice-details">
                              <span className="choice-name">{option.name}</span>
                              <span className="goal-description">{option.description}</span>
                            </span>
                            <span className="choice-check" aria-hidden="true">{isSelected ? "\u2713" : ""}</span>
                          </button>
                        );
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
                  disabled={selectedOptionIds.length === 0}
                  onClick={continueFromFocus}
                >
                  {selectedOptions.length === 0
                    ? "Select at least one option"
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
                <div className="recommendation-grid">
                  {recommendedRepositories.map(({ repository, sourcePlatform, solutionNames, policyIds }) => {
                  const comingSoon = "comingSoon" in sourcePlatform && sourcePlatform.comingSoon;
                  const limitedExperienceNote =
                    getLimitedExperienceNoteForLicenses(
                      eligibleLicenseIds,
                      sourcePlatform.id,
                    );
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
                          <p className="recommended-policy-list">
                            <strong>Recommended Conditional Access policies:</strong>{" "}
                            {policyIds.map((policyId) => (
                              <span className="recommended-policy-id" key={policyId}>{policyId}</span>
                            ))}
                          </p>
                        )}
                        {limitedExperienceNote && (
                          <aside className="license-requirement-note">
                            <strong>{limitedExperienceNote.title}</strong>
                            <p>{limitedExperienceNote.message}</p>
                          </aside>
                        )}
                        {windowsServerNotes.map((note) => (
                          <aside className="license-requirement-note" key={note}>
                            <strong>Additional server license required</strong>
                            <p>{note}</p>
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
              ) : (
                <div className="result-card">
                  <h2>No matching repositories for these licenses</h2>
                  <p>The selected security goal does not currently have repositories available for the licenses selected. Review the license selection or choose another security goal.</p>
                </div>
              )}
              <div className="actions centered">
                <button className="button secondary" type="button" onClick={() => setStep("focus")}>&larr; Back</button>
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
