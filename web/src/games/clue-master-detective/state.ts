import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const ClueMasterDetective_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 3,
  "poolSize": 8,
  "allowRepeats": false,
  "maxGuesses": 10,
  "symbolLabels": [
    "Plum",
    "Green",
    "Mustard",
    "Scarlet",
    "Peacock",
    "White",
    "Rose",
    "Brunette"
  ],
  "scenarioLabel": "Master Detective",
  "scenarioEmoji": "🔎"
};

export interface ClueMasterDetectiveSettings { dummy: boolean; }
export type ClueMasterDetectiveState = DeductionState;
export type ClueMasterDetectiveAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: ClueMasterDetectiveSettings): ClueMasterDetectiveState {
  return deductionInitial(seed, ClueMasterDetective_CFG);
}

export function reducer(state: ClueMasterDetectiveState, action: ClueMasterDetectiveAction): ClueMasterDetectiveState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, ClueMasterDetective_CFG);
  return state;
}

export function isTerminal(state: ClueMasterDetectiveState): { score: number } | null {
  const r = deductionScore(state, ClueMasterDetective_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "8 suspects, 8 rooms, 8 weapons.";
