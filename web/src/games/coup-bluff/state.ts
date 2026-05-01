import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const CoupBluff_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 2,
  "poolSize": 5,
  "allowRepeats": false,
  "maxGuesses": 8,
  "symbolLabels": [
    "Duke",
    "Captain",
    "Assassin",
    "Ambassador",
    "Contessa"
  ],
  "scenarioLabel": "Coup Court",
  "scenarioEmoji": "👑"
};

export interface CoupBluffSettings { dummy: boolean; }
export type CoupBluffState = DeductionState;
export type CoupBluffAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: CoupBluffSettings): CoupBluffState {
  return deductionInitial(seed, CoupBluff_CFG);
}

export function reducer(state: CoupBluffState, action: CoupBluffAction): CoupBluffState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, CoupBluff_CFG);
  return state;
}

export function isTerminal(state: CoupBluffState): { score: number } | null {
  const r = deductionScore(state, CoupBluff_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Two unknown influence cards.";
