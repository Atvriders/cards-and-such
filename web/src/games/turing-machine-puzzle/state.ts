import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const TuringMachinePuzzle_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 3,
  "poolSize": 5,
  "allowRepeats": true,
  "maxGuesses": 10,
  "symbolLabels": [
    "1",
    "2",
    "3",
    "4",
    "5"
  ],
  "scenarioLabel": "Turing Test",
  "scenarioEmoji": "🤖"
};

export interface TuringMachinePuzzleSettings { dummy: boolean; }
export type TuringMachinePuzzleState = DeductionState;
export type TuringMachinePuzzleAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: TuringMachinePuzzleSettings): TuringMachinePuzzleState {
  return deductionInitial(seed, TuringMachinePuzzle_CFG);
}

export function reducer(state: TuringMachinePuzzleState, action: TuringMachinePuzzleAction): TuringMachinePuzzleState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, TuringMachinePuzzle_CFG);
  return state;
}

export function isTerminal(state: TuringMachinePuzzleState): { score: number } | null {
  const r = deductionScore(state, TuringMachinePuzzle_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Verify against silicon checkers.";
