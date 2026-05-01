import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const MastermindNoRepeats_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 4,
  "poolSize": 8,
  "allowRepeats": false,
  "maxGuesses": 10,
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
  "scenarioLabel": "No-Repeat Code",
  "scenarioEmoji": "🚫"
};

export interface MastermindNoRepeatsSettings { dummy: boolean; }
export type MastermindNoRepeatsState = DeductionState;
export type MastermindNoRepeatsAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: MastermindNoRepeatsSettings): MastermindNoRepeatsState {
  return deductionInitial(seed, MastermindNoRepeats_CFG);
}

export function reducer(state: MastermindNoRepeatsState, action: MastermindNoRepeatsAction): MastermindNoRepeatsState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, MastermindNoRepeats_CFG);
  return state;
}

export function isTerminal(state: MastermindNoRepeatsState): { score: number } | null {
  const r = deductionScore(state, MastermindNoRepeats_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "All four pegs are different.";
