import { getLocalePath, translate, translateFormat, type Locale } from "./i18n";
import { useLanguage, useLocale } from "./LocaleContext";
import { Fragment, useEffect, useState, type FormEvent } from "react";
import {
  getPlatform,
  formatSelectedLicenseMix,
  getLicenseBadgeLabel,
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
  type LicenseQuantities,
  type Platform,
} from "./catalog";
import {
  getSolutionPlatformIds,
  getLicensingPrerequisiteTitle,
  getLimitedExperienceSelections,
  getConditionalAccessCategoryLicenseNote,
  getOnPremisesAppLicenseNote,
  getAdministratorProtectionLicenseNote,
  getDataSecurityLicenseNote,
  getEndpointFeatureLicenseNote,
  getSecurityGoalOptions,
  getSecurityGoalOptionChildren,
  getSecurityGoalOptionExperience,
  isSecurityGoalOptionAvailable,
  securityGoals,
  securityGoalNavigation,
  identityAndAccessGoalIds,
  toggleSecurityGoalSelection,
  type SecurityGoal,
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
import { LicensingDisclaimer } from "./LicensingDisclaimer";
import { AttackProtectionRecommendation } from "./AttackProtectionRecommendation";
import { ReadinessRecommendation } from "./ReadinessRecommendation";
import { BusinessLicensePrerequisites } from "./BusinessLicensePrerequisites";

type Step =
  | "license"
  | "goal"
  | "identity-and-access"
  | "focus"
  | "endpoint-categories"
  | "blocked"
  | "result"
  | "overview"
  | "faq";

export function getAuxiliaryPageReturnStep(currentStep: Step, returnStep: Step): Step {
  return currentStep === "overview" || currentStep === "faq" ? returnStep : currentStep;
}

export function getUnconfiguredGoalNames(
  goals: readonly SecurityGoal[],
  selectedOptionIds: readonly string[],
): string[] {
  return goals
    .filter((goal) =>
      goal.id !== "attack-protection" &&
      goal.id !== "endpoint-protection" &&
      goal.options.some((option) => !isAutoSelectedOption(option)) &&
      !goal.options.some((option) =>
        !isAutoSelectedOption(option) &&
        selectedOptionIds.includes(`${goal.id}:${option.id}`),
      ),
    )
    .map((goal) => goal.name);
}

export function getEndpointPlatformsMissingCategories(
  selectedPlatforms: readonly SolutionOption[],
  selectedCategoryIds: readonly string[],
): string[] {
  return selectedPlatforms
    .filter((platform) =>
      !getSecurityGoalOptionChildren(platform).some((category) =>
        selectedCategoryIds.includes(`endpoint-protection:${category.id}`),
      ),
    )
    .map((platform) => platform.name);
}

export function getExcludedLicenses(selectedLicenses: readonly License[]): License[] {
  return selectedLicenses.filter((license) => !license.eligible);
}

function ProfessionalServicesPanel() {
  const locale = useLocale();

  return (
    <aside className="professional-services-panel" aria-labelledby="professional-services-heading">
      <h2 id="professional-services-heading">{translate(locale, "Need implementation help or consulting?")}</h2>
      <button className="professional-services-button" type="button" disabled>
        {translate(locale, "Request Professional Services Help from ALSO CoE")}</button>
      <p>{translate(locale, "Coming soon")}</p>
    </aside>
  );
}

function renderWindowsServerLicenseNote(note: string, locale: Locale) {

  const productTermsPrerequisite =
    "Microsoft Defender for Business servers";
  const endpointServerPrerequisite =
    "Microsoft Defender for Endpoint Server";
  const defenderForServersPrerequisite =
    "Microsoft Defender for Servers Plan 1 or Plan 2";
  const parts = translate(locale, note).split(
    /(Microsoft Defender for Business servers|Microsoft Defender for Endpoint Server|Microsoft Defender for Servers Plan 1 or Plan 2)/g,
  );
  if (parts.length === 1) return translate(locale, note);

  return parts.map((part, index) => (
    <Fragment key={index}>
      {part === productTermsPrerequisite ? (
        <>
          {translate(locale, part)} (
          <a
            href="https://www.microsoft.com/licensing/terms/productoffering/MicrosoftDefenderforBusinessservers/MCA#ServiceSpecificTerms"
            target="_blank"
            rel="noopener noreferrer"
          >
            {translate(locale, "Microsoft Product Terms")}</a>
          )
        </>
      ) : part === endpointServerPrerequisite ? (
        <>
          {translate(locale, part)} (
          <a
            href="https://www.microsoft.com/licensing/terms/productoffering/MicrosoftDefenderforEndpointforservers/MCA"
            target="_blank"
            rel="noopener noreferrer"
          >
            {translate(locale, "Microsoft Product Terms")}</a>
          )
        </>
      ) : part === defenderForServersPrerequisite ? (
        <>
          {translate(locale, part)} (
          <a
            href="https://www.microsoft.com/licensing/faqs/48"
            target="_blank"
            rel="noopener noreferrer"
          >
            {translate(locale, "Licensing Documents")}</a>
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
  quantities,
  onToggle,
  onQuantityChange,
}: {
  items: readonly License[];
  selected: readonly License[];
  quantities: LicenseQuantities;
  onToggle: (license: License) => void;
  onQuantityChange: (licenseId: License["id"], quantity: number) => void;
}) {
  const locale = useLocale();

  return (
    <div className="card-grid license-grid">
      {items.map((license) => {
        const isSelected = selected.some((item) => item.id === license.id);
        return (
          <div className="license-choice" key={license.id}>
            <button
              className={`choice-card ${isSelected ? "selected" : ""}`}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(license)}
            >
              <span className="choice-icon license-badge" aria-hidden="true">{translate(locale, getLicenseBadgeLabel(license))}</span>
              <span className="choice-name">{translate(locale, license.name)}</span>
              <span className="choice-check" aria-hidden="true">{translate(locale, isSelected ? "\u2713" : "")}</span>
            </button>
            {isSelected && (
              <label className="license-quantity">
                {translate(locale, "Number of licenses")}<input
                  type="number"
                  min="1"
                  step="1"
                  value={quantities[license.id] ?? 1}
                  aria-label={translateFormat(locale, "Number of licenses: {name}", { name: license.name })}
                  onChange={(event) => onQuantityChange(
                    license.id,
                    Math.max(1, Number.parseInt(event.currentTarget.value, 10) || 1),
                  )}
                />
              </label>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const locale = useLocale();

  const goalActive =
    step === "goal" ||
    step === "identity-and-access" ||
    step === "focus" ||
    step === "endpoint-categories" ||
    step === "result";
  return (
    <div className="steps" aria-label={translate(locale, "Progress")}>
      <div className="step-item active">
        <span aria-hidden="true">1</span>
        <strong>{translate(locale, "Licenses")}</strong>
      </div>
      <div className="step-line" aria-hidden="true" />
      <div className={`step-item ${goalActive ? "active" : ""}`}>
        <span aria-hidden="true">2</span>
        <strong>{translate(locale, "Security goals")}</strong>
      </div>
      <div className="step-line" aria-hidden="true" />
      <div className={`step-item ${step === "result" ? "active" : ""}`}>
        <span aria-hidden="true">3</span>
        <strong>{translate(locale, "Recommended templates")}</strong>
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
  const locale = useLocale();

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
            {repositories.length > 1 && <h3>{translate(locale, repository.name)}</h3>}
            <p>{translate(locale, description)}</p>
            {!comingSoon && (
              <div
                className="repository-topics"
                aria-label={translateFormat(locale, "{name} GitHub topics", { name: translate(locale, repository.name) })}
              >
                {repositoryMetadata && repositoryMetadata.topics.length > 0 ? (
                  repositoryMetadata.topics.map((topic) => (
                    <span className="repository-topic" key={topic}>{topic}</span>
                  ))
                ) : (
                  <span className="repository-topic empty">{translate(locale, "No topics configured")}</span>
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
  sourcePlatformIds: Platform["id"][];
  solutionNames: string[];
  policyIds: string[];
  policyNotes: string[];
}

const endpointLicensingGuideAnchors: Partial<Record<Platform["id"], string>> = {
  "windows-11": "windows-licensing-guide",
  macos: "macos-licensing-guide",
  "ios-ipados": "iosipados-licensing-guide",
  android: "android-licensing-guide",
  "windows-servers": "windows-server-licensing-guide",
  "linux-server": "linux-server-and-desktop-licensing-guide",
  "linux-desktop": "linux-server-and-desktop-licensing-guide",
};

export function getRepositoryRecommendations(
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
        existing.sourcePlatformIds = [...new Set([...existing.sourcePlatformIds, platform.id])];
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
        sourcePlatformIds: [platform.id],
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
  const { locale, changeLocale } = useLanguage();

  const [step, setStep] = useState<Step>("license");
  const [auxiliaryReturnStep, setAuxiliaryReturnStep] = useState<Step>("license");
  const [selectedLicenses, setSelectedLicenses] = useState<License[]>([]);
  const [licenseQuantities, setLicenseQuantities] = useState<LicenseQuantities>({});
  const [selectedGoalIds, setSelectedGoalIds] = useState<SecurityGoalId[]>([]);
  const [identityAndAccessSelected, setIdentityAndAccessSelected] = useState(false);
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
  const excludedLicenses = getExcludedLicenses(selectedLicenses);
  const eligibleLicenseIds = eligibleLicenses.map((license) => license.id);
  const totalEligibleLicenseSeats = eligibleLicenses.reduce(
    (total, license) => total + (licenseQuantities[license.id] ?? 1), 0,
  );
  const selectedGoals = securityGoals.filter((goal) =>
    selectedGoalIds.includes(goal.id),
  );
  const selectedNavigationCount = securityGoalNavigation.filter((goal) =>
    goal.id === "identity-and-access"
      ? identityAndAccessSelected
      : selectedGoalIds.includes(goal.id),
  ).length;
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
  const missingEndpointCategories = getEndpointPlatformsMissingCategories(
    selectedEndpointPlatforms,
    selectedEndpointCategoryIds,
  );
  const unconfiguredGoalNames = getUnconfiguredGoalNames(
    selectedGoals,
    selectedOptionIds,
  );
  const selectedOptions = selectedGoals.flatMap((goal) =>
    getSecurityGoalOptions(goal.id)
      .filter((option) =>
        (!option.comingSoon || option.allowRepositoryPreview) &&
        (isAutoSelectedOption(option) ||
        selectedOptionIds.includes(`${goal.id}:${option.id}`)),
      )
      .map((option) => ({
        ...option,
        goalId: goal.id,
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
    const isSelected = selectedLicenses.some((selected) => selected.id === license.id);
    setSelectedLicenses((current) => toggleLicenseSelection(current, license));
    setLicenseQuantities((current) => {
      const next = { ...current };
      if (isSelected) delete next[license.id];
      else next[license.id] = 1;
      return next;
    });
  }

  function changeLicenseQuantity(licenseId: License["id"], quantity: number) {
    setLicenseQuantities((current) => ({ ...current, [licenseId]: quantity }));
  }

  function continueFromLicenses() {
    if (eligibleLicenses.length === 0) {
      setStep("blocked");
      return;
    }

    setSelectedGoalIds([]);
    setIdentityAndAccessSelected(false);
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
  const locale = useLocale();

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
    return (
      <button
        className={`choice-card goal-card ${isChild ? "endpoint-category-card" : ""} ${isSelected ? "selected" : ""}`}
        type="button"
        key={selectionId}
        aria-pressed={isSelected}
        disabled={!optionAvailable}
        onClick={() => toggleOption(goalId, option.id)}
      >
        <span className="choice-icon" aria-hidden="true">{translate(locale, String(index + 1).padStart(2, "0"))}</span>
        <span className="choice-details">
          <span className="choice-name">{translate(locale, option.name)}</span>
          <span className="goal-description">{translate(locale, option.description)}</span>
          {option.comingSoon && (
            <span className="experience-badge coming-soon-badge">{translate(locale, "Coming")}</span>
          )}
          {optionPlatforms.length > 0 && (
            <span className={`experience-badge ${experience}`}>
              {translate(locale, experience === "full" ? "Full experience" : "Limited experience")}
            </span>
          )}
        </span>
        <span className="choice-check" aria-hidden="true">{translate(locale, isSelected ? "\u2713" : "")}</span>
      </button>
    );
  }

  function continueFromFocus() {
    if (unconfiguredGoalNames.length > 0) return;
    if (selectedGoalIds.includes("endpoint-protection")) {
      if (selectedEndpointPlatforms.length > 0) setStep("endpoint-categories");
      return;
    }
    if (selectedOptions.length > 0) setStep("result");
  }

  function continueFromEndpointCategories() {
    if (
      missingEndpointCategories.length === 0 &&
      unconfiguredGoalNames.length === 0
    ) {
      setStep("result");
    }
  }

  function startOver() {
    setSelectedLicenses([]);
    setLicenseQuantities({});
    setSelectedGoalIds([]);
    setIdentityAndAccessSelected(false);
    setSelectedOptionIds([]);
    setStep("license");
  }

  function showOverview() {
    setAuxiliaryReturnStep((current) =>
      getAuxiliaryPageReturnStep(step, current),
    );
    setStep("overview");
  }

  function showFaq() {
    setAuxiliaryReturnStep((current) =>
      getAuxiliaryPageReturnStep(step, current),
    );
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
          <a className="brand" href={getLocalePath(locale, import.meta.env.BASE_URL)} aria-label={translate(locale, "ALSO Microsoft Security Policy Templates Navigator home")}>
            <img className="brand-logo" src={`${import.meta.env.BASE_URL}also-logo.png`} alt="ALSO" />
            <span className="brand-divider" aria-hidden="true" />
            <span className="brand-title-group">
              <span className="brand-product">{translate(locale, "ALSO Microsoft Security Policy Templates Navigator")}</span>
              <span className="brand-preview">{translate(locale, "Public Preview")}</span>
            </span>
          </a>
          <div className="header-actions">
            <a
              className="button secondary issue-link"
              href={getLocalePath(locale, import.meta.env.BASE_URL)}
            >
              {translate(locale, "Home")}</a>
            <button
              className="button secondary issue-link"
              type="button"
              onClick={showOverview}
            >
              {translate(locale, "View all policies")}</button>
            <button
              className="button secondary issue-link"
              type="button"
              onClick={showFaq}
            >
              {translate(locale, "FAQ")}</button>
            <a
              className="button secondary issue-link"
              href="https://github.com/CoC-MS/ALSO-security-policy-templates-navigator/issues/new/choose"
              title={translate(locale, "Report a problem on GitHub (sign-in required)")}
            >
              {translate(locale, "Report problem")}</a>
          </div>
          <label className="language-menu">
            <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
            </svg>
            <select
              aria-label={translate(locale, "Language")}
              value={locale}
              onChange={(event) => changeLocale(event.currentTarget.value as Locale)}
            >
              <option value="en">{translate(locale, "English")}</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="ru">Русский</option>
              <option value="it">Italiano</option>
              <option value="pl">Polski</option>
            </select>
          </label>
        </div>
      </header>

      <main>
        <div className="content">
          {step !== "blocked" && step !== "overview" && step !== "faq" && <StepIndicator step={step} />}
          {excludedLicenses.length > 0 && step !== "license" && step !== "blocked" && (
            <aside className="license-exclusion-notice" role="note">
              <strong>{translate(locale, "Excluded from matching:")}</strong>{translate(locale, " ")}
              {translate(locale, excludedLicenses.map((license) => license.name).join(", "))} {translate(locale, "do not meet the minimum supported license requirement. Recommendations are based only on")}{" "}{translate(locale, eligibleLicenses.map((license) => license.name).join(", "))}.
            </aside>
          )}
          {step === "license" && (
            <PolicyCounters metadata={repositoryMetadata} status={metadataStatus} locale={locale} />
          )}
          {step === "faq" && (
            <>
              <Faq locale={locale} />
              <div className="actions centered">
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => setStep(auxiliaryReturnStep)}
                >
                  {translate(locale, "← Back")}</button>
              </div>
            </>
          )}

          {step === "overview" && (
            <section className="result-wrap" aria-labelledby="main-title">
              <div className="result-heading">
                <div className="eyebrow">{translate(locale, "Complete template catalog")}</div>
                <h1 id="main-title" tabIndex={-1}>{translate(locale, "All security policy templates")}</h1>
                <p>{translate(locale, "Browse every available platform and open its policy template repository directly.")}</p>
              </div>
              <form
                className="repository-search"
                role="search"
                onSubmit={submitRepositorySearch}
              >
                <label htmlFor="repository-search">{translate(locale, "Search policy templates")}</label>
                <div className="repository-search-controls">
                  <input
                    id="repository-search"
                    type="search"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder={translate(locale, "Search GitHub topics, for example agentsecurity...")}
                    disabled={metadataStatus !== "ready"}
                  />
                  <button className="button primary" type="submit">{translate(locale, "Search")}</button>
                  {searchQuery && (
                    <button
                      className="button secondary"
                      type="button"
                      onClick={() => {
                        setSearchInput("");
                        setSearchQuery("");
                      }}
                    >
                      {translate(locale, "Clear")}</button>
                  )}
                </div>
              </form>
              <div aria-live="polite">
                {metadataStatus === "loading" && (
                  <p className="search-summary">{translate(locale, "Loading GitHub topics...")}</p>
                )}
                {metadataStatus === "error" && (
                  <p className="search-summary search-error" role="alert">
                    {translate(locale, "GitHub topics are temporarily unavailable.")}</p>
                )}
                {metadataStatus === "ready" && searchQuery && (
                  <p className="search-summary">
                    {translate(locale, overviewPlatforms.length === 0
                      ? `No repository topics found for "${searchQuery}".`
                      : `${overviewPlatforms.length} ${overviewPlatforms.length === 1 ? "repository section" : "repository sections"} found for "${searchQuery}".`)}
                    {repositoryMetadata.generatedAt && (
                      <span className="search-index-date">
                        {" "}{translate(locale, "Topics refreshed")}{" "}{new Date(repositoryMetadata.generatedAt).toLocaleDateString(locale)}.
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="overview-heading">
                <h2>{translate(locale, "Repository overview")}</h2>
                <p>{translate(locale, "Browse all repositories directly.")}</p>
              </div>
              <div className="recommendation-grid">
                {overviewPlatforms.map((platform) => {
                  const repositories = getPlatformRepositories(platform);
                  const comingSoon = "comingSoon" in platform && platform.comingSoon;
                  return (
                    <article className="recommendation-card" key={platform.id}>
                      <span className="choice-icon" aria-hidden="true">{translate(locale, platform.shortLabel)}</span>
                      <div className="platform-title">
                        <h2>{translate(locale, platform.name)}</h2>
                        {comingSoon && <span className="experience-badge coming-soon-badge">{translate(locale, "Coming")}</span>}
                      </div>
                      <RepositoryDetails
                        repositories={repositories}
                        metadata={repositoryMetadata.repositories}
                        comingSoon={comingSoon}
                      />
                      <div className="repository-links">
                        {comingSoon ? (
                          <button className="button primary repository-link" type="button" disabled>
                            {translate(locale, "AI Security macOS repository coming soon")}</button>
                        ) : repositories.map((repository) => (
                            <a
                              className="button primary repository-link"
                              href={repository.url}
                              target="_blank"
                              rel="noopener"
                              referrerPolicy="strict-origin-when-cross-origin"
                              key={repository.url}
                            >
                              {translateFormat(locale, "Open {name} repository", { name: translate(locale, repository.name) })}<ArrowIcon />
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
                  onClick={() => setStep(auxiliaryReturnStep)}
                >
                  {translate(locale, "← Back")}</button>
              </div>
            </section>
          )}

          {step === "license" && (
            <section aria-labelledby="main-title">
              <div className="eyebrow">{translate(locale, "Find your security policy templates")}</div>
              <h1 id="main-title" tabIndex={-1}>{translate(locale, "Which Microsoft 365 licenses does your customer have?")}</h1>
              <p className="intro">{translate(locale, "Select each license plan and enter the number of licenses available. Next, choose the security challenges your customer wants to solve to find relevant ALSO security policy templates.")}</p>
              <div className="license-section" aria-labelledby="enterprise-heading">
                <h2 id="enterprise-heading">{translate(locale, "Enterprise")}</h2>
                <LicenseGrid
                  items={enterpriseLicenses}
                  selected={selectedLicenses}
                  quantities={licenseQuantities}
                  onToggle={toggleLicense}
                  onQuantityChange={changeLicenseQuantity}
                />
              </div>
              <div className="license-section" aria-labelledby="smb-heading">
                <h2 id="smb-heading">{translate(locale, "SMB")}</h2>
                <LicenseGrid
                  items={smbLicenses}
                  selected={selectedLicenses}
                  quantities={licenseQuantities}
                  onToggle={toggleLicense}
                  onQuantityChange={changeLicenseQuantity}
                />
              </div>
              {selectedLicenses.length > 0 && (
                <div className="actions license-actions">
                  <button
                    className="button primary"
                    type="button"
                    onClick={continueFromLicenses}
                  >
                    {translateFormat(
                      locale,
                      selectedLicenses.length === 1
                        ? "Continue with {count} license plan ({seats} seats) →"
                        : "Continue with {count} license plans ({seats} seats) →",
                      { count: selectedLicenses.length, seats: totalEligibleLicenseSeats },
                    )}
                  </button>
                </div>
              )}
            </section>
          )}

          {step === "goal" && eligibleLicenses.length > 0 && (
            <section aria-labelledby="main-title">
              <div className="selection-pills" aria-label={translate(locale, "Selected eligible licenses")}>
                {eligibleLicenses.map((license) => (
                  <span className="selection-pill" key={license.id}>
                    <span aria-hidden="true">&#10003;</span>{translate(locale, license.name)}
                  </span>
                ))}
              </div>
              <h1 id="main-title" tabIndex={-1}>{translate(locale, "What security challenges are you trying to solve?")}</h1>
              <p className="intro">{translate(locale, "Select one or more security goals. Select a goal again to remove it. You can combine any goals before continuing.")}</p>
              <div className="card-grid goal-grid" aria-label={translate(locale, "Security goals")}>
                {securityGoalNavigation.map((goal, index) => {
                  const comingSoon = "comingSoon" in goal && goal.comingSoon;
                  const isIdentityGroup = goal.id === "identity-and-access";
                  const selected = isIdentityGroup
                    ? identityAndAccessSelected
                    : selectedGoalIds.includes(goal.id);
                  return (
                  <button
                    className={`choice-card goal-card ${selected ? "selected" : ""}`}
                    type="button"
                    key={goal.id}
                    aria-pressed={selected}
                    disabled={comingSoon}
                    onClick={() => {
                      if (!isIdentityGroup) {
                        chooseGoal(goal.id);
                        return;
                      }
                      setIdentityAndAccessSelected(!identityAndAccessSelected);
                      if (identityAndAccessSelected) {
                        setSelectedGoalIds((current) => current.filter((id) =>
                          !identityAndAccessGoalIds.includes(id),
                        ));
                        setSelectedOptionIds((current) => current.filter((id) =>
                          !identityAndAccessGoalIds.some((goalId) => id.startsWith(`${goalId}:`)),
                        ));
                      }
                    }}
                  >
                    <span className="choice-icon" aria-hidden="true">{translate(locale, String(index + 1).padStart(2, "0"))}</span>
                    <span className="choice-details">
                      <span className="choice-name">{translate(locale, goal.name)}</span>
                      <span className="goal-description">{translate(locale, goal.description)}</span>
                      {comingSoon && <span className="experience-badge coming-soon-badge">{translate(locale, "Coming")}</span>}
                      {"isNew" in goal && goal.isNew && <span className="experience-badge new-badge">{translate(locale, "New")}</span>}
                    </span>
                    <span className="choice-check" aria-hidden="true">{translate(locale, selected ? "\u2713" : "")}</span>
                  </button>
                  );
                })}
              </div>
              <div className="actions platform-actions">
                <div>
                  <button className="button secondary" type="button" onClick={() => setStep("license")}>{translate(locale, "← Back")}</button>
                  <button className="button text-button" type="button" onClick={startOver}>{translate(locale, "Start over")}</button>
                </div>
                <button
                  className="button primary"
                  type="button"
                  disabled={selectedGoals.length === 0 && !identityAndAccessSelected}
                  onClick={() => {
                    if (identityAndAccessSelected) {
                      setStep("identity-and-access");
                      return;
                    }
                    if (selectedGoals.length === 0) return;
                    setStep(
                      selectedGoals.every((goal) =>
                        goal.id === "attack-protection" || goal.options.every(isAutoSelectedOption),
                      )
                        ? "result"
                        : "focus",
                    );
                  }}
                >
                  {translate(locale, selectedGoals.length > 0 || identityAndAccessSelected
                    ? `Continue with ${selectedNavigationCount} security goal${selectedNavigationCount === 1 ? "" : "s"}`
                    : "Select at least one security goal")} &rarr;
                </button>
              </div>
            </section>
          )}

          {step === "identity-and-access" && (
            <section aria-labelledby="main-title">
              <div className="eyebrow">{translate(locale, "Identity and Access")}</div>
              <h1 id="main-title" tabIndex={-1}>{translate(locale, "Choose Identity and Access policies")}</h1>
              <p className="intro">{translate(locale, "Select Conditional Access, Administrator protection, or both. Their existing policy categories and recommendations are unchanged.")}</p>
              <div className="card-grid goal-grid" aria-label={translate(locale, "Identity and Access options")}>
                {identityAndAccessGoalIds.map((id, index) => {
                  const goal = securityGoals.find((item) => item.id === id)!;
                  const selected = selectedGoalIds.includes(id);
                  const experience = getSecurityGoalOptionExperience(
                    id, eligibleLicenseIds,
                    [...new Set(getSecurityGoalOptions(id).flatMap((option) => option.platformIds))],
                  );
                  return (
                    <button className={`choice-card goal-card ${selected ? "selected" : ""}`}
                      type="button" key={id} aria-pressed={selected} onClick={() => chooseGoal(id)}>
                      <span className="choice-icon" aria-hidden="true">{translate(locale, String(index + 1).padStart(2, "0"))}</span>
                      <span className="choice-details">
                        <span className="choice-name">{translate(locale, goal.name)}</span>
                        <span className="goal-description">{translate(locale, goal.description)}</span>
                        <span className={`experience-badge ${experience}`}>
                          {translate(locale, experience === "full" ? "Full experience" : "Limited experience")}
                        </span>
                      </span>
                      <span className="choice-check" aria-hidden="true">{translate(locale, selected ? "\u2713" : "")}</span>
                    </button>
                  );
                })}
              </div>
              <div className="actions platform-actions">
                <div>
                  <button className="button secondary" type="button" onClick={() => setStep("goal")}>{translate(locale, "← Back")}</button>
                  <button className="button text-button" type="button" onClick={startOver}>{translate(locale, "Start over")}</button>
                </div>
                <button className="button primary" type="button"
                  disabled={!selectedGoalIds.some((id) => identityAndAccessGoalIds.includes(id))}
                  onClick={() => setStep(selectedGoals.every((goal) =>
                    goal.id === "attack-protection" || goal.options.every(isAutoSelectedOption),
                  ) ? "result" : "focus")}>
                  {translate(locale, "Continue with selected policies →")}</button>
              </div>
            </section>
          )}

          {step === "focus" && selectedGoals.length > 0 && eligibleLicenses.length > 0 && (
            <section aria-labelledby="main-title">
              <div className="selection-pills" aria-label={translate(locale, "Selected eligible licenses")}>
                {eligibleLicenses.map((license) => (
                  <span className="selection-pill" key={license.id}>
                    <span aria-hidden="true">&#10003;</span>{translate(locale, license.name)}
                  </span>
                ))}
              </div>
              <div className="eyebrow">{translate(locale, "Your selected security goals")}</div>
              <h1 id="main-title" tabIndex={-1}>
                {translate(locale, selectedGoalIds.length === 1 &&
                selectedGoalIds[0] === "attack-protection"
                  ? "Attack prevention"
                  : selectedGoalIds.length === 1 &&
                selectedGoalIds[0] === "endpoint-protection"
                  ? "Choose endpoint platforms"
                  : selectedGoalIds.length === 1 &&
                    selectedGoalIds[0] === "data-protection"
                    ? "Choose Data Security categories"
                    : selectedGoalIds.length === 1 &&
                      selectedGoalIds[0] === "conditional-access"
                      ? "Choose Conditional Access policy categories"
                      : "Choose the scenarios and platforms to include")}
              </h1>
              <p className="intro">
                {translate(locale, selectedGoalIds.length === 1 &&
                selectedGoalIds[0] === "attack-protection"
                  ? "Explore the MITRE ATT&CK policy mapper using the licensing guidance for your selected Microsoft 365 plans."
                  : selectedGoalIds.length === 1 &&
                selectedGoalIds[0] === "endpoint-protection"
                  ? "Select the operating systems you want to protect, then choose policy categories for each."
                  : selectedGoalIds.length === 1 &&
                    selectedGoalIds[0] === "data-protection"
                    ? "Select the Purview policy categories to include in your recommendations."
                    : selectedGoalIds.length === 1 &&
                      selectedGoalIds[0] === "conditional-access"
                      ? "Select the policy categories to explore in the Conditional Access repository."
                      : "Select one or more options under each goal. Select an option again to remove it. Recommendations will be matched to the licenses selected above.")}
              </p>
              <div className="goal-option-sections">
                {selectedGoals.filter((goal) =>
                  goal.id !== "attack-protection" &&
                  goal.options.some((option) => !isAutoSelectedOption(option)),
                ).map((goal) => (
                  <section className="goal-option-section" key={goal.id} aria-labelledby={`${goal.id}-heading`}>
                    <h2 id={`${goal.id}-heading`}>{translate(locale, goal.name)}</h2>
                    <p>{translate(locale, goal.prompt)}</p>
                    <div className="card-grid goal-option-grid" aria-label={translateFormat(locale, "{name} options", { name: translate(locale, goal.name) })}>
                      {goal.options.filter((option) => !isAutoSelectedOption(option)).map((option, index) => {
                        return renderOptionCard(goal.id, option, index);
                      })}
                    </div>
                  </section>
                ))}
              </div>
              <div className="actions platform-actions">
                <div>
                  <button className="button secondary" type="button" onClick={() => setStep(identityAndAccessSelected ? "identity-and-access" : "goal")}>{translate(locale, "← Back")}</button>
                  <button className="button text-button" type="button" onClick={startOver}>{translate(locale, "Start over")}</button>
                </div>
                {selectedGoals.some((goal) => goal.id !== "attack-protection") && <button
                  className="button primary"
                  type="button"
                  disabled={
                    (selectedGoalIds.includes("endpoint-protection") &&
                      selectedEndpointPlatforms.length === 0) ||
                    unconfiguredGoalNames.length > 0 ||
                    (!selectedGoalIds.includes("endpoint-protection") &&
                      selectedOptions.length === 0)
                  }
                  onClick={continueFromFocus}
                >
                  {translate(locale, selectedGoalIds.includes("endpoint-protection")
                    ? selectedEndpointPlatforms.length === 0
                      ? "Select at least one endpoint platform"
                      : unconfiguredGoalNames.length > 0
                        ? `Choose options for ${unconfiguredGoalNames.join(", ")}`
                        : "Choose endpoint policy categories"
                    : unconfiguredGoalNames.length > 0
                      ? `Choose options for ${unconfiguredGoalNames.join(", ")}`
                      : "View recommendations")} &rarr;
                </button>}
              </div>
            </section>
          )}

          {step === "endpoint-categories" &&
            selectedEndpointPlatforms.length > 0 &&
            eligibleLicenses.length > 0 && (
              <section aria-labelledby="main-title">
                <div className="selection-pills" aria-label={translate(locale, "Selected eligible licenses")}>
                  {eligibleLicenses.map((license) => (
                    <span className="selection-pill" key={license.id}>
                      <span aria-hidden="true">&#10003;</span>{translate(locale, license.name)}
                    </span>
                  ))}
                </div>
                <div className="eyebrow">{translate(locale, "Endpoint protection")}</div>
                <h1 id="main-title" tabIndex={-1}>{translate(locale, "Choose policy categories")}</h1>
                <p className="intro">
                  {translate(locale, "Select categories for the endpoint platforms you chose. Each selection will lead to its matching ALSO repository.")}</p>
                <div className="goal-option-sections">
                  {selectedEndpointPlatforms.map((platformOption) => (
                    <section
                      className="goal-option-section"
                      key={platformOption.id}
                      aria-labelledby={`${platformOption.id}-categories-heading`}
                    >
                      <h2 id={`${platformOption.id}-categories-heading`}>
                        {translate(locale, platformOption.name)}
                      </h2>
                      <div className="card-grid endpoint-subcategory-grid">
                        {getSecurityGoalOptionChildren(platformOption).map((child, index) =>
                          renderOptionCard("endpoint-protection", child, index, true),
                        )}
                      </div>
                    </section>
                  ))}
                </div>
                {(missingEndpointCategories.length > 0 || unconfiguredGoalNames.length > 0) && (
                  <p className="selection-validation" role="status">
                    {missingEndpointCategories.length > 0 && (
                      <>{translate(locale, "Choose at least one category for each selected endpoint platform:")}{" "}{translate(locale, missingEndpointCategories.join(", "))}. </>
                    )}
                    {unconfiguredGoalNames.length > 0 && (
                      <>{translate(locale, "Choose at least one option for each selected goal:")}{" "}{translate(locale, unconfiguredGoalNames.join(", "))}.</>
                    )}
                  </p>
                )}
                <div className="actions platform-actions">
                  <div>
                    <button
                      className="button secondary"
                      type="button"
                      onClick={() => setStep("focus")}
                    >
                      {translate(locale, "← Back to platforms")}</button>
                    <button className="button text-button" type="button" onClick={startOver}>
                      {translate(locale, "Start over")}</button>
                  </div>
                  <button
                    className="button primary"
                    type="button"
                    disabled={
                      missingEndpointCategories.length > 0 ||
                      unconfiguredGoalNames.length > 0
                    }
                    onClick={continueFromEndpointCategories}
                  >
                    {translate(locale, missingEndpointCategories.length > 0
                      ? "Choose a category for each platform"
                      : unconfiguredGoalNames.length > 0
                        ? `Choose options for ${unconfiguredGoalNames.join(", ")}`
                        : "View recommendations")} &rarr;
                  </button>
                </div>
              </section>
            )}

          {step === "blocked" && selectedLicenses.length > 0 && (
            <section className="result-wrap" aria-labelledby="main-title">
              <div className="result-card blocked-card">
                <div className="result-icon blocked-icon" aria-hidden="true">!</div>
                <div className="eyebrow">{translate(locale, "License prerequisite")}</div>
                <h1 id="main-title" tabIndex={-1}>{translate(locale, "A higher license is needed")}</h1>
                <p>
                  {translate(locale, selectedLicenses.map((license) => license.name).join(" and "))}{" "}
                  {translate(locale, selectedLicenses.length === 1
                    ? "does not meet the minimum prerequisite for these security policy templates."
                    : "do not meet the minimum prerequisite for these security policy templates.")}
                </p>
                <p>{translate(locale, "The minimum supported license is")}{" "}<strong>Microsoft 365 Business Premium</strong>{translate(locale, ". No applicable templates are available for your selected licenses.")}</p>
                <BusinessLicensePrerequisites licenses={selectedLicenses} />
                <button className="button primary" type="button" onClick={startOver}>{translate(locale, "← Start over")}</button>
              </div>
            </section>
          )}

          {step === "result" && eligibleLicenses.length > 0 && selectedGoals.length > 0 && (selectedOptions.length > 0 || selectedGoals.some((goal) => goal.id === "attack-protection" || goal.options.length === 0)) && (
            <section className="result-wrap" aria-labelledby="main-title">
              <div className="result-heading">
                <div className="eyebrow">{translate(locale, selectedGoals.map((goal) => goal.name).join(" + "))}</div>
                <h1 id="main-title" tabIndex={-1}>{translate(locale, "Recommended security policy templates")}</h1>
                <p>{translate(locale, "Based on")}{" "}<strong>{eligibleLicenses.map((license) => license.name).join(", ")}</strong>{" "}{translate(locale, "and the needs you selected, explore these ALSO")}{" "}{translate(locale, selectedGoalIds.includes("attack-protection") ? "policy resources" : "repositories")}.</p>
                <div className="recommendation-context" aria-label={translate(locale, "Selected needs")}>
                  {selectedOptions.map((option) => (
                    <span className="selection-pill" key={option.selectionId}>{translate(locale, option.name)}</span>
                  ))}
                </div>
              </div>
              {eligibleLicenses.length > 1 && (
                <aside className="license-mix-notice" aria-label={translate(locale, "License mix coverage")}>
                  <strong>{translate(locale, "Mixed license coverage")}</strong>
                  <p>{translate(locale, "Selected plan quantities:")}{" "}{translate(locale, formatSelectedLicenseMix(eligibleLicenseIds, licenseQuantities))}{translate(locale, ". Recommendations and experience badges are evaluated for each selected plan; higher-tier licenses do not extend their entitlements to users covered by another plan. Counts do not show whether the same people have more than one plan assigned.")}</p>
                </aside>
              )}
              {recommendedRepositories.length > 0 || selectedGoals.some((goal) => goal.id === "attack-protection" || goal.options.length === 0) ? (
                <div className="result-recommendations-layout">
                  <div className="recommendation-grid result-recommendation-grid">
                  {selectedGoalIds.includes("attack-protection") && (
                    <AttackProtectionRecommendation
                      licenseIds={eligibleLicenseIds}
                      licenseQuantities={licenseQuantities}
                    />
                  )}
                  {selectedGoalIds.includes("security-fundamentals") && (
                    <ReadinessRecommendation goalId="security-fundamentals" licenseIds={eligibleLicenseIds} licenseQuantities={licenseQuantities} />
                  )}
                  {selectedGoalIds.includes("copilot-readiness") && (
                    <ReadinessRecommendation goalId="copilot-readiness" licenseIds={eligibleLicenseIds} licenseQuantities={licenseQuantities} />
                  )}
                  {recommendedRepositories.map(({ repository, sourcePlatform, sourcePlatformIds, solutionNames }) => {
                  const comingSoon = "comingSoon" in sourcePlatform && sourcePlatform.comingSoon;
                  const platformSelections = selectedOptions.filter((option) =>
                    option.platformIds.some((platformId) =>
                      sourcePlatformIds.includes(platformId),
                    ),
                  );
                  const limitedSelections = [...new Set(
                    sourcePlatformIds.flatMap((platformId) =>
                      getLimitedExperienceSelections(
                        platformSelections,
                        eligibleLicenseIds,
                        platformId,
                      ),
                    ),
                  )];
                  const licensingTitleFor = (
                    matches: (option: (typeof platformSelections)[number]) => boolean = () => true,
                  ) => getLicensingPrerequisiteTitle(
                    limitedSelections.filter(matches).map((option) => option.name),
                  );
                  const attackProtectionOnly =
                    platformSelections.length > 0 &&
                    platformSelections.every((option) =>
                      option.selectionId.startsWith("attack-protection:"),
                    );
                  const suppressAgent365Guidance = sourcePlatform.id === "conditional-access" &&
                    !platformSelections.some((option) =>
                      option.selectionId === "conditional-access:agent-policies",
                    );
                  const oauthAppsOnly =
                    sourcePlatform.id === "conditional-access" &&
                    platformSelections.length === 1 &&
                    platformSelections[0].selectionId === "app-protection:oauth-apps";
                  const cloudAppsOnly =
                    sourcePlatform.id === "conditional-access" &&
                    platformSelections.length === 1 &&
                    platformSelections[0].selectionId === "app-protection:cloud-apps";
                  const hasOnPremisesAppSelection = sourcePlatform.id === "conditional-access" &&
                    platformSelections.some((option) =>
                      option.selectionId === "app-protection:on-premises-apps",
                    );
                  const onPremisesAppsOnly = hasOnPremisesAppSelection &&
                    platformSelections.length === 1;
                  const onPremisesAppLicenseNote = hasOnPremisesAppSelection
                    ? getOnPremisesAppLicenseNote(eligibleLicenseIds, licenseQuantities)
                    : undefined;
                  const appProtectionOnly = platformSelections.length > 0 &&
                    platformSelections.every((option) =>
                      option.selectionId === "app-protection:mobile-apps" ||
                      option.selectionId === "app-protection:desktop-apps",
                    );
                  const administratorDeviceSelection =
                    (sourcePlatform.id === "windows-11" || sourcePlatform.id === "macos") &&
                    platformSelections.some((option) =>
                      option.selectionId.startsWith("administrator-protection:"),
                    );
                  const administratorDeviceOnly = administratorDeviceSelection &&
                    platformSelections.every((option) =>
                      option.selectionId.startsWith("administrator-protection:"),
                    );
                  const administratorLicenseNote = administratorDeviceSelection
                    ? getAdministratorProtectionLicenseNote(eligibleLicenseIds, sourcePlatform.id, licenseQuantities)
                    : undefined;
                  const cloudAppSelections = limitedSelections.filter((option) =>
                    option.selectionId === "app-protection:cloud-apps" ||
                    option.selectionId === "app-protection:oauth-apps",
                  );
                  const cloudAppLicenseNote = cloudAppSelections.length > 0
                    ? getCloudAppsConditionalAccessLicenseNote(eligibleLicenseIds, licenseQuantities)
                    : undefined;
                  const categorySpecificLicensingOnly =
                    platformSelections.length > 0 &&
                    platformSelections.every((option) =>
                      option.selectionId.startsWith("conditional-access:") ||
                      option.selectionId === "app-protection:on-premises-apps",
                    );
                  const conditionalAccessCategoryLicenseNote =
                    getConditionalAccessCategoryLicenseNote(
                      limitedSelections.filter((option) =>
                        option.selectionId.startsWith("conditional-access:"),
                      ).map((option) => option.id),
                      eligibleLicenseIds,
                      licenseQuantities,
                    );
                  const limitedExperienceNote = administratorDeviceOnly
                    ? administratorLicenseNote
                    : appProtectionOnly
                    ? undefined
                    : onPremisesAppsOnly
                    ? undefined
                    : categorySpecificLicensingOnly
                    ? conditionalAccessCategoryLicenseNote
                    : getLimitedExperienceNoteForLicenses(
                      eligibleLicenseIds,
                      sourcePlatform.id,
                      {
                        includeAgent365Guidance: !suppressAgent365Guidance,
                        includePimGuidance: platformSelections.some((option) =>
                          option.selectionId === "conditional-access:administrator-policies" ||
                          option.selectionId.startsWith("administrator-protection:"),
                        ),
                        includeConditionalAccessPolicyGuidance:
                          !oauthAppsOnly && !cloudAppsOnly && !attackProtectionOnly,
                        licenseQuantities,
                      },
                    );
                  const dataSecuritySelection = limitedSelections.some((option) =>
                    option.selectionId.startsWith("data-protection:") &&
                    option.platformIds.some((platformId) => platformId === "purview"),
                  );
                  const otherPurviewSelection = limitedSelections.some((option) =>
                    !option.selectionId.startsWith("data-protection:") &&
                    option.platformIds.some((platformId) => platformId === "purview"),
                  );
                  const dataSecurityLicenseNote =
                    sourcePlatform.id === "purview" && dataSecuritySelection
                      ? getDataSecurityLicenseNote(
                        eligibleLicenseIds,
                        limitedSelections.filter((option) =>
                          option.selectionId.startsWith("data-protection:"),
                        ).map((option) => option.id),
                        licenseQuantities,
                      )
                      : undefined;
                  const endpointNoteSelections = [
                    ...limitedSelections,
                    ...platformSelections.filter((option) =>
                      option.selectionId.startsWith("endpoint-protection:") &&
                      option.children?.length &&
                      option.platformIds.some((id) =>
                        id === "linux-desktop" || id === "linux-server" || id === "windows-servers",
                      ) &&
                      !platformSelections.some((selection) =>
                        selection.endpointFeature &&
                        selection.platformIds.some((id) => option.platformIds.includes(id)),
                      ),
                    ),
                  ];
                  const endpointNoteFor = (option: (typeof platformSelections)[number]) =>
                    getEndpointFeatureLicenseNote(
                      option.endpointFeature ?? (option.children?.length ? "defender" : undefined),
                      eligibleLicenseIds,
                      option.platformIds[0],
                      licenseQuantities,
                    );
                  const endpointFeatureNotes = sourcePlatform.id !== "purview"
                    ? [...new Set(
                      endpointNoteSelections
                      .filter((option) => option.selectionId.startsWith("endpoint-protection:"))
                        .filter((option) => !option.platformIds.some((id) =>
                          id === "windows-servers" || id === "linux-server",
                        ))
                        .map(endpointNoteFor)
                        .filter((note): note is string => note !== undefined),
                    )]
                    : [];
                  const oauthAppsPlansNeedingWorkloadId = eligibleLicenseIds.filter((licenseId) =>
                    requiresWorkloadIdPremiumForOAuthApps([licenseId]),
                  );
                  const needsOAuthAppsWorkloadIdLicense =
                    sourcePlatform.id === "conditional-access" &&
                    limitedSelections.some((option) =>
                      option.selectionId === "app-protection:oauth-apps",
                    ) &&
                    oauthAppsPlansNeedingWorkloadId.length > 0;
                  const serverPlatformId = sourcePlatformIds.includes("windows-servers")
                    ? "windows-servers"
                    : sourcePlatformIds.includes("linux-server")
                    ? "linux-server"
                    : undefined;
                  const windowsServerNotes =
                    (limitedSelections.length > 0 ||
                      platformSelections.some((option) => option.endpointFeature)) &&
                    serverPlatformId
                      ? getWindowsServerLicenseNotes(eligibleLicenseIds, serverPlatformId, licenseQuantities)
                      : [];
                  const visibleLimitedExperienceNote =
                    limitedSelections.length > 0 &&
                    endpointFeatureNotes.length === 0 &&
                    (!cloudAppLicenseNote ||
                      (sourcePlatform.id === "conditional-access" &&
                        platformSelections.some((option) =>
                          option.selectionId.startsWith("administrator-protection:"),
                        ))) &&
                    !(sourcePlatform.id === "purview" &&
                      dataSecuritySelection &&
                      !otherPurviewSelection &&
                      dataSecurityLicenseNote)
                      ? limitedExperienceNote
                      : undefined;
                  const endpointLicensingGuideUrl =
                    `${repository.url}#${endpointLicensingGuideAnchors[sourcePlatform.id]}`;
                  return (
                    <article
                      className="recommendation-card"
                      key={repository.url}
                    >
                      <div className="recommendation-card-main">
                        <span className="choice-icon" aria-hidden="true">{translate(locale, sourcePlatform.shortLabel)}</span>
                        <div className="platform-title">
                          <h2>{translate(locale, repository.name)}</h2>
                          {!comingSoon && (
                            <span className={`experience-badge ${limitedSelections.length > 0 ? "limited" : "full"}`}>
                              {translate(locale, limitedSelections.length > 0 ? "Limited experience" : "Full experience")}
                            </span>
                          )}
                          {comingSoon && <span className="experience-badge coming-soon-badge">{translate(locale, "Coming")}</span>}
                        </div>
                        <RepositoryDetails
                          repositories={[repository]}
                          metadata={repositoryMetadata.repositories}
                          comingSoon={comingSoon}
                        />
                        {sourcePlatform.id !== "conditional-access" && (
                          <p className="recommendation-reasons">
                            {translate(locale, "Recommended for:")}{" "}{translate(locale, solutionNames.join(", "))}
                          </p>
                        )}
                        {hasOnPremisesAppSelection && (
                          <p className="recommended-policy-note">
                            {translate(locale, "On-premises app protection templates are coming soon. Explore the Conditional Access repository for currently available policies.")}</p>
                        )}
                        {visibleLimitedExperienceNote && (
                          <aside className="license-requirement-note">
                            <strong>{translate(locale, licensingTitleFor())}</strong>
                            <p>{translate(locale, visibleLimitedExperienceNote.message)}</p>
                            {visibleLimitedExperienceNote.message.includes("Agent 365") && (
                              <p>
                                {translate(locale, "Learn more about Agent 365 licensing:")}{translate(locale, " ")}
                                <a
                                  href="https://www.microsoft.com/licensing/terms/productoffering/Agent365/MCA#ServiceSpecificTerms"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {translate(locale, "Microsoft Product Terms")}</a>
                                {translate(locale, " | ")}
                                <a
                                  href="https://www.microsoft.com/licensing/faqs/122"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {translate(locale, "Licensing Documents")}</a>
                                .
                              </p>
                            )}
                          </aside>
                        )}
                        {dataSecurityLicenseNote && (
                          <aside className="license-requirement-note">
                            <strong>{translate(locale, licensingTitleFor((option) =>
                              option.selectionId.startsWith("data-protection:"),
                            ))}</strong>
                            <p>{translate(locale, dataSecurityLicenseNote)}</p>
                            <p>
                              <a
                                href="https://github.com/CoC-MS/ALSO-Microsoft-Security-Purview#purview-licensing-guide"
                                target="_blank"
                                rel="noopener"
                                referrerPolicy="strict-origin-when-cross-origin"
                              >
                                {translate(locale, "Repository licensing guide")}</a>
                            </p>
                          </aside>
                        )}
                        {onPremisesAppLicenseNote && (
                          <aside className="license-requirement-note">
                            <strong>{translate(locale, licensingTitleFor((option) =>
                              option.selectionId === "app-protection:on-premises-apps",
                            ))}</strong>
                            <p>{translate(locale, onPremisesAppLicenseNote.message)}</p>
                          </aside>
                        )}
                        {!administratorDeviceOnly && administratorLicenseNote && (
                          <aside className="license-requirement-note">
                            <strong>{translate(locale, licensingTitleFor((option) =>
                              option.selectionId.startsWith("administrator-protection:"),
                            ))}</strong>
                            <p>{translate(locale, administratorLicenseNote.message)}</p>
                          </aside>
                        )}
                        {!categorySpecificLicensingOnly && conditionalAccessCategoryLicenseNote && (
                          <aside className="license-requirement-note">
                            <strong>{translate(locale, licensingTitleFor((option) =>
                              option.selectionId.startsWith("conditional-access:"),
                            ))}</strong>
                            <p>{translate(locale, conditionalAccessCategoryLicenseNote.message)}</p>
                          </aside>
                        )}
                        {endpointFeatureNotes.map((note) => (
                          <aside className="license-requirement-note" key={note}>
                            <strong>{translate(locale, getLicensingPrerequisiteTitle(
                              endpointNoteSelections.filter((option) =>
                                endpointNoteFor(option) === note,
                              ).map((option) => option.name),
                            ))}</strong>
                            <p>{translate(locale, note)}</p>
                            <p>
                              <a href={endpointLicensingGuideUrl}
                                target="_blank" rel="noopener"
                                referrerPolicy="strict-origin-when-cross-origin">
                                {translate(locale, "Repository licensing guide")}</a>
                            </p>
                          </aside>
                        ))}
                        {cloudAppLicenseNote && (
                          <aside className="license-requirement-note">
                            <strong>{translate(locale, licensingTitleFor((option) =>
                              option.selectionId === "app-protection:cloud-apps" ||
                              option.selectionId === "app-protection:oauth-apps",
                            ))}</strong>
                            <p>{translate(locale, cloudAppLicenseNote.message)}</p>
                          </aside>
                        )}
                        {needsOAuthAppsWorkloadIdLicense && (
                          <aside className="license-requirement-note">
                            <strong>{translate(locale, licensingTitleFor((option) =>
                              option.selectionId === "app-protection:oauth-apps",
                            ))}</strong>
                            <p>
                              {translate(locale, "Microsoft Entra Workload ID Premium is required to unlock the full OAuth apps experience for users assigned these plans:")}{" "}{translate(locale, formatSelectedLicenseMix(oauthAppsPlansNeedingWorkloadId, licenseQuantities))}.{" "}
                              <a
                                href="https://learn.microsoft.com/en-gb/entra/workload-id/workload-identities-faqs?WT.mc_id=Portal-Microsoft_Azure_Support#how-many-licenses-do-i-need-to-purchase-do-i-need-to-license-all-workload-identities-including-microsoft-and-managed-service-identities"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {translate(locale, "Learn more about Microsoft Entra Workload ID licensing")}</a>
                              .
                            </p>
                          </aside>
                        )}
                        {windowsServerNotes.map((note) => (
                          <aside className="license-requirement-note" key={note}>
                            <strong>{translate(locale, getLicensingPrerequisiteTitle(
                              platformSelections.filter((option) =>
                                !option.children?.length &&
                                serverPlatformId !== undefined &&
                                option.platformIds.includes(serverPlatformId),
                              ).map((option) => option.name),
                              limitedSelections.some((option) =>
                                serverPlatformId !== undefined &&
                                option.platformIds.includes(serverPlatformId),
                              ) ? "limited" : "full",
                            ))}</strong>
                            <p>{renderWindowsServerLicenseNote(note, locale)}</p>
                            <p>
                              <a href={endpointLicensingGuideUrl} target="_blank" rel="noopener"
                                referrerPolicy="strict-origin-when-cross-origin">
                                {translate(locale, "Repository licensing guide")}</a>
                            </p>
                          </aside>
                        ))}
                        <LicensingDisclaimer />
                        <div className="repository-links">
                          {comingSoon ? (
                            <button className="button primary repository-link" type="button" disabled>
                              {translate(locale, "AI Security macOS templates coming soon")}</button>
                          ) : (
                            <a
                              className="button primary repository-link"
                              href={repository.url}
                              target="_blank"
                              rel="noopener"
                              referrerPolicy="strict-origin-when-cross-origin"
                              key={repository.url}
                            >
                              {translateFormat(locale, "Open {name} repository", { name: translate(locale, repository.name) })}<ArrowIcon />
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                  })}
                  </div>
                  <ProfessionalServicesPanel />
                </div>
              ) : (
                <div className="result-card">
                  <h2>{translate(locale, "No matching repositories for these licenses")}</h2>
                  <p>{translate(locale, "The selected security goal does not currently have repositories available for the licenses selected. Review the license selection or choose another security goal.")}</p>
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
                          goal.id !== "attack-protection" &&
                          goal.options.some((option) => !isAutoSelectedOption(option)),
                      )
                        ? "focus"
                        : identityAndAccessSelected ? "identity-and-access" : "goal",
                    )
                  }
                >
                  {translate(locale, "← Back")}</button>
                <button className="button text-button" type="button" onClick={startOver}>{translate(locale, "Start over")}</button>
              </div>
            </section>
          )}
        </div>
      </main>

      <footer>
        <p>{translate(locale, "ALSO Microsoft Security Central Technical Team (c) 2026 All rights reserved")}</p>
      </footer>
    </div>
  );
}

export default App;
