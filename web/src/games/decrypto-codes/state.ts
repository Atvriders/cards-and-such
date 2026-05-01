import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const DecryptoCodes_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 3,
  "poolSize": 4,
  "allowRepeats": false,
  "maxGuesses": 8,
  "symbolLabels": [
    "1",
    "2",
    "3",
    "4"
  ],
  "scenarioLabel": "Cipher Hunt",
  "scenarioEmoji": "📡"
};

export interface DecryptoCodesSettings { dummy: boolean; }
export type DecryptoCodesState = DeductionState;
export type DecryptoCodesAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: DecryptoCodesSettings): DecryptoCodesState {
  return deductionInitial(seed, DecryptoCodes_CFG);
}

export function reducer(state: DecryptoCodesState, action: DecryptoCodesAction): DecryptoCodesState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, DecryptoCodes_CFG);
  return state;
}

export function isTerminal(state: DecryptoCodesState): { score: number } | null {
  const r = deductionScore(state, DecryptoCodes_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Three digits from {1,2,3,4}, no repeats.";
