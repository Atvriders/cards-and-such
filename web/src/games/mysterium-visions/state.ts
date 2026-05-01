import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const MysteriumVisions_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 3,
  "poolSize": 6,
  "allowRepeats": false,
  "maxGuesses": 9,
  "symbolLabels": [
    "👤",
    "🏠",
    "🔪",
    "🩸",
    "🕯️",
    "🧥"
  ],
  "scenarioLabel": "Séance",
  "scenarioEmoji": "👻"
};

export interface MysteriumVisionsSettings { dummy: boolean; }
export type MysteriumVisionsState = DeductionState;
export type MysteriumVisionsAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: MysteriumVisionsSettings): MysteriumVisionsState {
  return deductionInitial(seed, MysteriumVisions_CFG);
}

export function reducer(state: MysteriumVisionsState, action: MysteriumVisionsAction): MysteriumVisionsState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, MysteriumVisions_CFG);
  return state;
}

export function isTerminal(state: MysteriumVisionsState): { score: number } | null {
  const r = deductionScore(state, MysteriumVisions_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Suspect / location / weapon.";
