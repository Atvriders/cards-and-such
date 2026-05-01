import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const CodenamesPictures_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 4,
  "poolSize": 8,
  "allowRepeats": false,
  "maxGuesses": 8,
  "symbolLabels": [
    "🐶",
    "🐱",
    "🦁",
    "🐧",
    "🦋",
    "🐢",
    "🦊",
    "🐯"
  ],
  "scenarioLabel": "Spymaster's Clue",
  "scenarioEmoji": "🕵️"
};

export interface CodenamesPicturesSettings { dummy: boolean; }
export type CodenamesPicturesState = DeductionState;
export type CodenamesPicturesAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: CodenamesPicturesSettings): CodenamesPicturesState {
  return deductionInitial(seed, CodenamesPictures_CFG);
}

export function reducer(state: CodenamesPicturesState, action: CodenamesPicturesAction): CodenamesPicturesState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, CodenamesPictures_CFG);
  return state;
}

export function isTerminal(state: CodenamesPicturesState): { score: number } | null {
  const r = deductionScore(state, CodenamesPictures_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Pick the four agents matching your spymaster's clue.";
