import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const Mastermind_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 4,
  "poolSize": 6,
  "allowRepeats": true,
  "maxGuesses": 10,
  "symbolLabels": [
    "R",
    "O",
    "Y",
    "G",
    "B",
    "V"
  ],
  "scenarioLabel": "Code Cracker",
  "scenarioEmoji": "🔓"
};

export interface MastermindSettings { dummy: boolean; }
export type MastermindState = DeductionState;
export type MastermindAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: MastermindSettings): MastermindState {
  return deductionInitial(seed, Mastermind_CFG);
}

export function reducer(state: MastermindState, action: MastermindAction): MastermindState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, Mastermind_CFG);
  return state;
}

export function isTerminal(state: MastermindState): { score: number } | null {
  const r = deductionScore(state, Mastermind_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Click a slot to cycle colours; submit to read pegs. ● exact · ○ misplaced.";
