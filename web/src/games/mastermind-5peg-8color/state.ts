import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const Mastermind5peg8color_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 5,
  "poolSize": 8,
  "allowRepeats": true,
  "maxGuesses": 12,
  "symbolLabels": [
    "R",
    "O",
    "Y",
    "G",
    "B",
    "V",
    "P",
    "K"
  ],
  "scenarioLabel": "5×8 Code",
  "scenarioEmoji": "🔢"
};

export interface Mastermind5peg8colorSettings { dummy: boolean; }
export type Mastermind5peg8colorState = DeductionState;
export type Mastermind5peg8colorAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: Mastermind5peg8colorSettings): Mastermind5peg8colorState {
  return deductionInitial(seed, Mastermind5peg8color_CFG);
}

export function reducer(state: Mastermind5peg8colorState, action: Mastermind5peg8colorAction): Mastermind5peg8colorState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, Mastermind5peg8color_CFG);
  return state;
}

export function isTerminal(state: Mastermind5peg8colorState): { score: number } | null {
  const r = deductionScore(state, Mastermind5peg8color_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Standard Mastermind 5/8.";
