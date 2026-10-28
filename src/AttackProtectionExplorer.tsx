import { useEffect, useState } from "react";
import {
  attackScenarios,
  getScenarioPolicyLinks,
  parseAttackCoverageIndex,
  type AttackCoverageIndex,
  type AttackScenarioId,
} from "./attackCoverage";

export function AttackProtectionExplorer() {
  const [index, setIndex] = useState<AttackCoverageIndex | null>(null);
  const [error, setError] = useState("");
  const [scenarioId, setScenarioId] = useState<AttackScenarioId>("aitm-phishing");

  useEffect(() => {
    const controller = new AbortController();
    async function loadIndex() {
      try {
        const response = await fetch(
          `${import.meta.env.BASE_URL}attack-policy-coverage.v1.json`,
          { cache: "no-store", signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error(`Policy overview request failed (${response.status}).`);
        }
        const parsed = parseAttackCoverageIndex(await response.json());
        if (!controller.signal.aborted) setIndex(parsed);
      } catch (cause) {
        if (controller.signal.aborted) return;
        console.error("Unable to load attack policy overview.", cause);
        setError("The policy overview is currently unavailable. Please try again later.");
      }
    }
    void loadIndex();
    return () => controller.abort();
  }, []);

  const policies = index ? getScenarioPolicyLinks(index, scenarioId) : [];

  return (
    <section className="coverage-explorer" aria-labelledby="coverage-heading">
      <h2 id="coverage-heading">Overview</h2>
      <label className="coverage-scenario">
        Attack scenario
        <select value={scenarioId} onChange={(event) => {
          const scenario = attackScenarios.find((item) => item.id === event.target.value);
          if (scenario) setScenarioId(scenario.id);
        }}>
          {attackScenarios.map((scenario) => (
            <option value={scenario.id} key={scenario.id}>{scenario.name}</option>
          ))}
        </select>
      </label>
      {error ? <p role="alert">{error}</p> : !index ? (
        <p role="status">Loading policies...</p>
      ) : policies.length > 0 ? (
        <ul className="coverage-policy-list">
          {policies.map((policy) => (
            <li key={policy.url}>
              <a href={policy.url} target="_blank" rel="noopener"
                referrerPolicy="strict-origin-when-cross-origin">{policy.name}</a>
            </li>
          ))}
        </ul>
      ) : (
        <p role="status">No matching policies have been mapped yet.</p>
      )}
    </section>
  );
}
