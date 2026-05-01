import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const InsiderQuiz_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 1,
  "poolSize": 6,
  "allowRepeats": false,
  "maxGuesses": 5,
  "symbolLabels": [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6"
  ],
  "scenarioLabel": "Find Insider",
  "scenarioEmoji": "🔎"
};

export interface InsiderQuizSettings { dummy: boolean; }
export type InsiderQuizState = DeductionState;
export type InsiderQuizAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: InsiderQuizSettings): InsiderQuizState {
  return deductionInitial(seed, InsiderQuiz_CFG);
}

export function reducer(state: InsiderQuizState, action: InsiderQuizAction): InsiderQuizState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, InsiderQuiz_CFG);
  return state;
}

export function isTerminal(state: InsiderQuizState): { score: number } | null {
  const r = deductionScore(state, InsiderQuiz_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "One of six knows the answer in advance.";
