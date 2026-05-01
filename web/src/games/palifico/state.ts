import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const Palifico_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 2,
  "poolSize": 6,
  "allowRepeats": true,
  "maxGuesses": 8,
  "symbolLabels": [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6"
  ],
  "scenarioLabel": "Palifico",
  "scenarioEmoji": "🎲"
};

export interface PalificoSettings { dummy: boolean; }
export type PalificoState = DeductionState;
export type PalificoAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: PalificoSettings): PalificoState {
  return deductionInitial(seed, Palifico_CFG);
}

export function reducer(state: PalificoState, action: PalificoAction): PalificoState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, Palifico_CFG);
  return state;
}

export function isTerminal(state: PalificoState): { score: number } | null {
  const r = deductionScore(state, Palifico_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Liar's dice round.";
