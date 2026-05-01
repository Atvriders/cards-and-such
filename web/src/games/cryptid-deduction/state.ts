import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const CryptidDeduction_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 3,
  "poolSize": 6,
  "allowRepeats": false,
  "maxGuesses": 9,
  "symbolLabels": [
    "🌲",
    "🏔️",
    "🏜️",
    "💧",
    "🐾",
    "🌫️"
  ],
  "scenarioLabel": "Find the Cryptid",
  "scenarioEmoji": "👣"
};

export interface CryptidDeductionSettings { dummy: boolean; }
export type CryptidDeductionState = DeductionState;
export type CryptidDeductionAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: CryptidDeductionSettings): CryptidDeductionState {
  return deductionInitial(seed, CryptidDeduction_CFG);
}

export function reducer(state: CryptidDeductionState, action: CryptidDeductionAction): CryptidDeductionState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, CryptidDeduction_CFG);
  return state;
}

export function isTerminal(state: CryptidDeductionState): { score: number } | null {
  const r = deductionScore(state, CryptidDeduction_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Cross-reference clues to find the lair.";
