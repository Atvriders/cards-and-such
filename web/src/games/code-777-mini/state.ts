import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const Code777Mini_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 3,
  "poolSize": 7,
  "allowRepeats": true,
  "maxGuesses": 10,
  "symbolLabels": [
    "●",
    "■",
    "▲",
    "◆",
    "★",
    "✚",
    "♣"
  ],
  "scenarioLabel": "Code 777",
  "scenarioEmoji": "🎯"
};

export interface Code777MiniSettings { dummy: boolean; }
export type Code777MiniState = DeductionState;
export type Code777MiniAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: Code777MiniSettings): Code777MiniState {
  return deductionInitial(seed, Code777Mini_CFG);
}

export function reducer(state: Code777MiniState, action: Code777MiniAction): Code777MiniState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, Code777Mini_CFG);
  return state;
}

export function isTerminal(state: Code777MiniState): { score: number } | null {
  const r = deductionScore(state, Code777Mini_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Three slots, seven symbols (repeats allowed).";
