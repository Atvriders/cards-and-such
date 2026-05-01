import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const DeceptionHk_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 3,
  "poolSize": 6,
  "allowRepeats": false,
  "maxGuesses": 10,
  "symbolLabels": [
    "🔪",
    "💊",
    "🪢",
    "🔫",
    "🗡️",
    "🪤"
  ],
  "scenarioLabel": "HK Investigation",
  "scenarioEmoji": "🏙️"
};

export interface DeceptionHkSettings { dummy: boolean; }
export type DeceptionHkState = DeductionState;
export type DeceptionHkAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: DeceptionHkSettings): DeceptionHkState {
  return deductionInitial(seed, DeceptionHk_CFG);
}

export function reducer(state: DeceptionHkState, action: DeceptionHkAction): DeceptionHkState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, DeceptionHk_CFG);
  return state;
}

export function isTerminal(state: DeceptionHkState): { score: number } | null {
  const r = deductionScore(state, DeceptionHk_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Identify weapon, evidence, scene.";
