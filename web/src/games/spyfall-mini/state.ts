import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const SpyfallMini_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 1,
  "poolSize": 8,
  "allowRepeats": false,
  "maxGuesses": 5,
  "symbolLabels": [
    "🏝️",
    "🚀",
    "🏥",
    "🎬",
    "✈️",
    "🏰",
    "🚂",
    "🏟️"
  ],
  "scenarioLabel": "Identify Location",
  "scenarioEmoji": "🕵️"
};

export interface SpyfallMiniSettings { dummy: boolean; }
export type SpyfallMiniState = DeductionState;
export type SpyfallMiniAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: SpyfallMiniSettings): SpyfallMiniState {
  return deductionInitial(seed, SpyfallMini_CFG);
}

export function reducer(state: SpyfallMiniState, action: SpyfallMiniAction): SpyfallMiniState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, SpyfallMini_CFG);
  return state;
}

export function isTerminal(state: SpyfallMiniState): { score: number } | null {
  const r = deductionScore(state, SpyfallMini_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Only one is the spy's location.";
