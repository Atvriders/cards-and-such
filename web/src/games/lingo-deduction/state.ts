import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const LingoDeduction_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 5,
  "poolSize": 10,
  "allowRepeats": false,
  "maxGuesses": 6,
  "symbolLabels": [
    "A",
    "E",
    "I",
    "O",
    "U",
    "R",
    "S",
    "T",
    "L",
    "N"
  ],
  "scenarioLabel": "Lingo",
  "scenarioEmoji": "🎯"
};

export interface LingoDeductionSettings { dummy: boolean; }
export type LingoDeductionState = DeductionState;
export type LingoDeductionAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: LingoDeductionSettings): LingoDeductionState {
  return deductionInitial(seed, LingoDeduction_CFG);
}

export function reducer(state: LingoDeductionState, action: LingoDeductionAction): LingoDeductionState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, LingoDeduction_CFG);
  return state;
}

export function isTerminal(state: LingoDeductionState): { score: number } | null {
  const r = deductionScore(state, LingoDeduction_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Six tries to find the 5-letter word.";
