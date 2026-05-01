import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const ThirteenClues_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 3,
  "poolSize": 6,
  "allowRepeats": false,
  "maxGuesses": 10,
  "symbolLabels": [
    "💀",
    "🗡️",
    "🪓",
    "🧪",
    "🔫",
    "🪢"
  ],
  "scenarioLabel": "Murder Solved",
  "scenarioEmoji": "🕵️"
};

export interface ThirteenCluesSettings { dummy: boolean; }
export type ThirteenCluesState = DeductionState;
export type ThirteenCluesAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: ThirteenCluesSettings): ThirteenCluesState {
  return deductionInitial(seed, ThirteenClues_CFG);
}

export function reducer(state: ThirteenCluesState, action: ThirteenCluesAction): ThirteenCluesState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, ThirteenClues_CFG);
  return state;
}

export function isTerminal(state: ThirteenCluesState): { score: number } | null {
  const r = deductionScore(state, ThirteenClues_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Suspect / weapon / location.";
