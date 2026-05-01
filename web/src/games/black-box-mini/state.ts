import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const BlackBoxMini_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 4,
  "poolSize": 8,
  "allowRepeats": false,
  "maxGuesses": 10,
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
  "scenarioLabel": "Black Box",
  "scenarioEmoji": "📦"
};

export interface BlackBoxMiniSettings { dummy: boolean; }
export type BlackBoxMiniState = DeductionState;
export type BlackBoxMiniAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: BlackBoxMiniSettings): BlackBoxMiniState {
  return deductionInitial(seed, BlackBoxMini_CFG);
}

export function reducer(state: BlackBoxMiniState, action: BlackBoxMiniAction): BlackBoxMiniState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, BlackBoxMini_CFG);
  return state;
}

export function isTerminal(state: BlackBoxMiniState): { score: number } | null {
  const r = deductionScore(state, BlackBoxMini_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Locate hidden atoms by sequence.";
