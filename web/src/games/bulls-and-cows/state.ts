import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const BullsAndCows_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 4,
  "poolSize": 10,
  "allowRepeats": false,
  "maxGuesses": 10,
  "symbolLabels": [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0"
  ],
  "scenarioLabel": "Bulls & Cows",
  "scenarioEmoji": "🐂"
};

export interface BullsAndCowsSettings { dummy: boolean; }
export type BullsAndCowsState = DeductionState;
export type BullsAndCowsAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: BullsAndCowsSettings): BullsAndCowsState {
  return deductionInitial(seed, BullsAndCows_CFG);
}

export function reducer(state: BullsAndCowsState, action: BullsAndCowsAction): BullsAndCowsState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, BullsAndCows_CFG);
  return state;
}

export function isTerminal(state: BullsAndCowsState): { score: number } | null {
  const r = deductionScore(state, BullsAndCows_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Find the secret 4-digit number.";
