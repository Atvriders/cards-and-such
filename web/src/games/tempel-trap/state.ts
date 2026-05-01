import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const TempelTrap_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 4,
  "poolSize": 6,
  "allowRepeats": false,
  "maxGuesses": 9,
  "symbolLabels": [
    "🪤",
    "🗡️",
    "🔥",
    "💀",
    "🪨",
    "🐍"
  ],
  "scenarioLabel": "Trap Maze",
  "scenarioEmoji": "🪤"
};

export interface TempelTrapSettings { dummy: boolean; }
export type TempelTrapState = DeductionState;
export type TempelTrapAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: TempelTrapSettings): TempelTrapState {
  return deductionInitial(seed, TempelTrap_CFG);
}

export function reducer(state: TempelTrapState, action: TempelTrapAction): TempelTrapState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, TempelTrap_CFG);
  return state;
}

export function isTerminal(state: TempelTrapState): { score: number } | null {
  const r = deductionScore(state, TempelTrap_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Pick the safe path of four.";
