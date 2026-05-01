import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const SleuthMini_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 3,
  "poolSize": 8,
  "allowRepeats": false,
  "maxGuesses": 8,
  "symbolLabels": [
    "💎",
    "💍",
    "🔱",
    "🔮",
    "🗝️",
    "🪙",
    "🎯",
    "🪞"
  ],
  "scenarioLabel": "Stolen Gems",
  "scenarioEmoji": "🔍"
};

export interface SleuthMiniSettings { dummy: boolean; }
export type SleuthMiniState = DeductionState;
export type SleuthMiniAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: SleuthMiniSettings): SleuthMiniState {
  return deductionInitial(seed, SleuthMini_CFG);
}

export function reducer(state: SleuthMiniState, action: SleuthMiniAction): SleuthMiniState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, SleuthMini_CFG);
  return state;
}

export function isTerminal(state: SleuthMiniState): { score: number } | null {
  const r = deductionScore(state, SleuthMini_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Three gems, eight possibilities.";
