import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const CodenamesXxl_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 5,
  "poolSize": 8,
  "allowRepeats": false,
  "maxGuesses": 8,
  "symbolLabels": [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H"
  ],
  "scenarioLabel": "Big Spymaster",
  "scenarioEmoji": "🎯"
};

export interface CodenamesXxlSettings { dummy: boolean; }
export type CodenamesXxlState = DeductionState;
export type CodenamesXxlAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: CodenamesXxlSettings): CodenamesXxlState {
  return deductionInitial(seed, CodenamesXxl_CFG);
}

export function reducer(state: CodenamesXxlState, action: CodenamesXxlAction): CodenamesXxlState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, CodenamesXxl_CFG);
  return state;
}

export function isTerminal(state: CodenamesXxlState): { score: number } | null {
  const r = deductionScore(state, CodenamesXxl_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Five agents from a larger pool.";
