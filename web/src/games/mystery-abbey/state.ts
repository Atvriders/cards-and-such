import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const MysteryAbbey_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 3,
  "poolSize": 6,
  "allowRepeats": false,
  "maxGuesses": 10,
  "symbolLabels": [
    "🍞",
    "🍇",
    "📜",
    "🔔",
    "🕯️",
    "🪤"
  ],
  "scenarioLabel": "Abbey Mystery",
  "scenarioEmoji": "⛪"
};

export interface MysteryAbbeySettings { dummy: boolean; }
export type MysteryAbbeyState = DeductionState;
export type MysteryAbbeyAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: MysteryAbbeySettings): MysteryAbbeyState {
  return deductionInitial(seed, MysteryAbbey_CFG);
}

export function reducer(state: MysteryAbbeyState, action: MysteryAbbeyAction): MysteryAbbeyState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, MysteryAbbey_CFG);
  return state;
}

export function isTerminal(state: MysteryAbbeyState): { score: number } | null {
  const r = deductionScore(state, MysteryAbbey_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Three traits of the missing monk.";
