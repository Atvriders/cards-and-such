import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const DeadlyDowagers_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 3,
  "poolSize": 6,
  "allowRepeats": false,
  "maxGuesses": 10,
  "symbolLabels": [
    "👵",
    "🍵",
    "🎭",
    "💎",
    "🪞",
    "🕯️"
  ],
  "scenarioLabel": "Edwardian Murder",
  "scenarioEmoji": "🥀"
};

export interface DeadlyDowagersSettings { dummy: boolean; }
export type DeadlyDowagersState = DeductionState;
export type DeadlyDowagersAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: DeadlyDowagersSettings): DeadlyDowagersState {
  return deductionInitial(seed, DeadlyDowagers_CFG);
}

export function reducer(state: DeadlyDowagersState, action: DeadlyDowagersAction): DeadlyDowagersState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, DeadlyDowagers_CFG);
  return state;
}

export function isTerminal(state: DeadlyDowagersState): { score: number } | null {
  const r = deductionScore(state, DeadlyDowagers_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Pin down dowager / weapon / clue.";
