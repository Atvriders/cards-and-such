import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const SuperMastermind_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 5,
  "poolSize": 8,
  "allowRepeats": true,
  "maxGuesses": 12,
  "symbolLabels": [
    "R",
    "O",
    "Y",
    "G",
    "B",
    "V",
    "P",
    "K"
  ],
  "scenarioLabel": "Super Code",
  "scenarioEmoji": "🧠"
};

export interface SuperMastermindSettings { dummy: boolean; }
export type SuperMastermindState = DeductionState;
export type SuperMastermindAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: SuperMastermindSettings): SuperMastermindState {
  return deductionInitial(seed, SuperMastermind_CFG);
}

export function reducer(state: SuperMastermindState, action: SuperMastermindAction): SuperMastermindState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, SuperMastermind_CFG);
  return state;
}

export function isTerminal(state: SuperMastermindState): { score: number } | null {
  const r = deductionScore(state, SuperMastermind_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Five slots, eight colors. 12 attempts.";
