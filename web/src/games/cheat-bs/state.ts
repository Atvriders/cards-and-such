import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const CheatBs_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 2,
  "poolSize": 4,
  "allowRepeats": false,
  "maxGuesses": 6,
  "symbolLabels": [
    "A",
    "2",
    "3",
    "4"
  ],
  "scenarioLabel": "Cheat!",
  "scenarioEmoji": "🎴"
};

export interface CheatBsSettings { dummy: boolean; }
export type CheatBsState = DeductionState;
export type CheatBsAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: CheatBsSettings): CheatBsState {
  return deductionInitial(seed, CheatBs_CFG);
}

export function reducer(state: CheatBsState, action: CheatBsAction): CheatBsState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, CheatBs_CFG);
  return state;
}

export function isTerminal(state: CheatBsState): { score: number } | null {
  const r = deductionScore(state, CheatBs_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Catch which two cards are bluffs.";
