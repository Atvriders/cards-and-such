import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const TempelDeduction_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 3,
  "poolSize": 6,
  "allowRepeats": false,
  "maxGuesses": 8,
  "symbolLabels": [
    "💎",
    "🏺",
    "📿",
    "🗝️",
    "🪨",
    "🪙"
  ],
  "scenarioLabel": "Temple Run",
  "scenarioEmoji": "🏛️"
};

export interface TempelDeductionSettings { dummy: boolean; }
export type TempelDeductionState = DeductionState;
export type TempelDeductionAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: TempelDeductionSettings): TempelDeductionState {
  return deductionInitial(seed, TempelDeduction_CFG);
}

export function reducer(state: TempelDeductionState, action: TempelDeductionAction): TempelDeductionState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, TempelDeduction_CFG);
  return state;
}

export function isTerminal(state: TempelDeductionState): { score: number } | null {
  const r = deductionScore(state, TempelDeduction_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Pick three treasure tiles.";
