import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const CryptidMini_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 2,
  "poolSize": 6,
  "allowRepeats": false,
  "maxGuesses": 8,
  "symbolLabels": [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F"
  ],
  "scenarioLabel": "Cryptid",
  "scenarioEmoji": "🦄"
};

export interface CryptidMiniSettings { dummy: boolean; }
export type CryptidMiniState = DeductionState;
export type CryptidMiniAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: CryptidMiniSettings): CryptidMiniState {
  return deductionInitial(seed, CryptidMini_CFG);
}

export function reducer(state: CryptidMiniState, action: CryptidMiniAction): CryptidMiniState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, CryptidMini_CFG);
  return state;
}

export function isTerminal(state: CryptidMiniState): { score: number } | null {
  const r = deductionScore(state, CryptidMini_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Two coordinates of the lair.";
