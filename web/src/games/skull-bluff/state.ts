import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const SkullBluff_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 2,
  "poolSize": 4,
  "allowRepeats": false,
  "maxGuesses": 6,
  "symbolLabels": [
    "🌹",
    "💀",
    "🌹",
    "💀"
  ],
  "scenarioLabel": "Skull Standoff",
  "scenarioEmoji": "💀"
};

export interface SkullBluffSettings { dummy: boolean; }
export type SkullBluffState = DeductionState;
export type SkullBluffAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: SkullBluffSettings): SkullBluffState {
  return deductionInitial(seed, SkullBluff_CFG);
}

export function reducer(state: SkullBluffState, action: SkullBluffAction): SkullBluffState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, SkullBluff_CFG);
  return state;
}

export function isTerminal(state: SkullBluffState): { score: number } | null {
  const r = deductionScore(state, SkullBluff_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Pick two coasters; flowers only.";
