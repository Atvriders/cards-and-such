import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const CockroachBluff_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 2,
  "poolSize": 4,
  "allowRepeats": false,
  "maxGuesses": 6,
  "symbolLabels": [
    "🪲",
    "🪳",
    "🐀",
    "🦟"
  ],
  "scenarioLabel": "Bluff or Truth",
  "scenarioEmoji": "🪳"
};

export interface CockroachBluffSettings { dummy: boolean; }
export type CockroachBluffState = DeductionState;
export type CockroachBluffAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: CockroachBluffSettings): CockroachBluffState {
  return deductionInitial(seed, CockroachBluff_CFG);
}

export function reducer(state: CockroachBluffState, action: CockroachBluffAction): CockroachBluffState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, CockroachBluff_CFG);
  return state;
}

export function isTerminal(state: CockroachBluffState): { score: number } | null {
  const r = deductionScore(state, CockroachBluff_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Pick whether opponent is bluffing on each card.";
