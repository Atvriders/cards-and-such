import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const ClueMini_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 3,
  "poolSize": 6,
  "allowRepeats": false,
  "maxGuesses": 8,
  "symbolLabels": [
    "Plum",
    "Green",
    "Mustard",
    "Scarlet",
    "Peacock",
    "White"
  ],
  "scenarioLabel": "Clue",
  "scenarioEmoji": "🕵️"
};

export interface ClueMiniSettings { dummy: boolean; }
export type ClueMiniState = DeductionState;
export type ClueMiniAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: ClueMiniSettings): ClueMiniState {
  return deductionInitial(seed, ClueMini_CFG);
}

export function reducer(state: ClueMiniState, action: ClueMiniAction): ClueMiniState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, ClueMini_CFG);
  return state;
}

export function isTerminal(state: ClueMiniState): { score: number } | null {
  const r = deductionScore(state, ClueMini_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Suspect / weapon / room.";
