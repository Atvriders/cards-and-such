import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const ChameleonBluff_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 1,
  "poolSize": 8,
  "allowRepeats": false,
  "maxGuesses": 5,
  "symbolLabels": [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H"
  ],
  "scenarioLabel": "Chameleon Hunt",
  "scenarioEmoji": "🦎"
};

export interface ChameleonBluffSettings { dummy: boolean; }
export type ChameleonBluffState = DeductionState;
export type ChameleonBluffAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: ChameleonBluffSettings): ChameleonBluffState {
  return deductionInitial(seed, ChameleonBluff_CFG);
}

export function reducer(state: ChameleonBluffState, action: ChameleonBluffAction): ChameleonBluffState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, ChameleonBluff_CFG);
  return state;
}

export function isTerminal(state: ChameleonBluffState): { score: number } | null {
  const r = deductionScore(state, ChameleonBluff_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Spot the odd one out.";
