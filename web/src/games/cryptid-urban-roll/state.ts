import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const CryptidUrbanRoll_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 3,
  "poolSize": 6,
  "allowRepeats": false,
  "maxGuesses": 9,
  "symbolLabels": [
    "🏙️",
    "🚇",
    "🌉",
    "🏟️",
    "🏬",
    "🛣️"
  ],
  "scenarioLabel": "Cryptid in the City",
  "scenarioEmoji": "🌆"
};

export interface CryptidUrbanRollSettings { dummy: boolean; }
export type CryptidUrbanRollState = DeductionState;
export type CryptidUrbanRollAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: CryptidUrbanRollSettings): CryptidUrbanRollState {
  return deductionInitial(seed, CryptidUrbanRoll_CFG);
}

export function reducer(state: CryptidUrbanRollState, action: CryptidUrbanRollAction): CryptidUrbanRollState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, CryptidUrbanRoll_CFG);
  return state;
}

export function isTerminal(state: CryptidUrbanRollState): { score: number } | null {
  const r = deductionScore(state, CryptidUrbanRoll_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Track cryptid through urban tiles.";
