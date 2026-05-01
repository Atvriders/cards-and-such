import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const ClueSuspect_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 3,
  "poolSize": 6,
  "allowRepeats": false,
  "maxGuesses": 9,
  "symbolLabels": [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F"
  ],
  "scenarioLabel": "Suspect",
  "scenarioEmoji": "🃏"
};

export interface ClueSuspectSettings { dummy: boolean; }
export type ClueSuspectState = DeductionState;
export type ClueSuspectAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: ClueSuspectSettings): ClueSuspectState {
  return deductionInitial(seed, ClueSuspect_CFG);
}

export function reducer(state: ClueSuspectState, action: ClueSuspectAction): ClueSuspectState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, ClueSuspect_CFG);
  return state;
}

export function isTerminal(state: ClueSuspectState): { score: number } | null {
  const r = deductionScore(state, ClueSuspect_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Only one combo solves it.";
