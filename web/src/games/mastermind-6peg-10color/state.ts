import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const Mastermind6peg10color_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 6,
  "poolSize": 10,
  "allowRepeats": true,
  "maxGuesses": 14,
  "symbolLabels": [
    "R",
    "O",
    "Y",
    "G",
    "C",
    "B",
    "V",
    "M",
    "P",
    "K"
  ],
  "scenarioLabel": "6×10 Code",
  "scenarioEmoji": "🧮"
};

export interface Mastermind6peg10colorSettings { dummy: boolean; }
export type Mastermind6peg10colorState = DeductionState;
export type Mastermind6peg10colorAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: Mastermind6peg10colorSettings): Mastermind6peg10colorState {
  return deductionInitial(seed, Mastermind6peg10color_CFG);
}

export function reducer(state: Mastermind6peg10colorState, action: Mastermind6peg10colorAction): Mastermind6peg10colorState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, Mastermind6peg10color_CFG);
  return state;
}

export function isTerminal(state: Mastermind6peg10colorState): { score: number } | null {
  const r = deductionScore(state, Mastermind6peg10color_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "6 pegs, 10 colors, 14 attempts.";
