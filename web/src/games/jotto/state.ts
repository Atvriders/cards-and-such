import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const Jotto_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 5,
  "poolSize": 10,
  "allowRepeats": false,
  "maxGuesses": 12,
  "symbolLabels": [
    "A",
    "E",
    "I",
    "O",
    "U",
    "R",
    "S",
    "T",
    "L",
    "N"
  ],
  "scenarioLabel": "Letter Hunt",
  "scenarioEmoji": "🔡"
};

export interface JottoSettings { dummy: boolean; }
export type JottoState = DeductionState;
export type JottoAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: JottoSettings): JottoState {
  return deductionInitial(seed, Jotto_CFG);
}

export function reducer(state: JottoState, action: JottoAction): JottoState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, Jotto_CFG);
  return state;
}

export function isTerminal(state: JottoState): { score: number } | null {
  const r = deductionScore(state, Jotto_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Match each position to a letter.";
