import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const SaboteurMini_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 1,
  "poolSize": 6,
  "allowRepeats": false,
  "maxGuesses": 5,
  "symbolLabels": [
    "⛏️1",
    "⛏️2",
    "⛏️3",
    "⛏️4",
    "⛏️5",
    "⛏️6"
  ],
  "scenarioLabel": "Mine Saboteur",
  "scenarioEmoji": "💎"
};

export interface SaboteurMiniSettings { dummy: boolean; }
export type SaboteurMiniState = DeductionState;
export type SaboteurMiniAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: SaboteurMiniSettings): SaboteurMiniState {
  return deductionInitial(seed, SaboteurMini_CFG);
}

export function reducer(state: SaboteurMiniState, action: SaboteurMiniAction): SaboteurMiniState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, SaboteurMini_CFG);
  return state;
}

export function isTerminal(state: SaboteurMiniState): { score: number } | null {
  const r = deductionScore(state, SaboteurMini_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "One miner is sabotaging.";
