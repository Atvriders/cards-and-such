import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const ConceptDeduction_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 3,
  "poolSize": 6,
  "allowRepeats": false,
  "maxGuesses": 9,
  "symbolLabels": [
    "🎬",
    "📚",
    "🌍",
    "🦁",
    "⚔️",
    "💡"
  ],
  "scenarioLabel": "Concept",
  "scenarioEmoji": "💡"
};

export interface ConceptDeductionSettings { dummy: boolean; }
export type ConceptDeductionState = DeductionState;
export type ConceptDeductionAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: ConceptDeductionSettings): ConceptDeductionState {
  return deductionInitial(seed, ConceptDeduction_CFG);
}

export function reducer(state: ConceptDeductionState, action: ConceptDeductionAction): ConceptDeductionState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, ConceptDeduction_CFG);
  return state;
}

export function isTerminal(state: ConceptDeductionState): { score: number } | null {
  const r = deductionScore(state, ConceptDeduction_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Three icon hints; deduce three answer keys.";
