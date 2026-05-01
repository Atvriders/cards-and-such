import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const AwkwardGuests_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 3,
  "poolSize": 6,
  "allowRepeats": false,
  "maxGuesses": 10,
  "symbolLabels": [
    "🤵",
    "💃",
    "🎩",
    "👮",
    "🧑‍🍳",
    "🕵️"
  ],
  "scenarioLabel": "Mansion Murder",
  "scenarioEmoji": "🍷"
};

export interface AwkwardGuestsSettings { dummy: boolean; }
export type AwkwardGuestsState = DeductionState;
export type AwkwardGuestsAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: AwkwardGuestsSettings): AwkwardGuestsState {
  return deductionInitial(seed, AwkwardGuests_CFG);
}

export function reducer(state: AwkwardGuestsState, action: AwkwardGuestsAction): AwkwardGuestsState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, AwkwardGuests_CFG);
  return state;
}

export function isTerminal(state: AwkwardGuestsState): { score: number } | null {
  const r = deductionScore(state, AwkwardGuests_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Suspect, weapon, room.";
