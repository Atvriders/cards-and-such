import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const KakerlakenPoker_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 2,
  "poolSize": 4,
  "allowRepeats": false,
  "maxGuesses": 6,
  "symbolLabels": [
    "🪲",
    "🪳",
    "🐀",
    "🦟"
  ],
  "scenarioLabel": "Käfer Bluff",
  "scenarioEmoji": "🪲"
};

export interface KakerlakenPokerSettings { dummy: boolean; }
export type KakerlakenPokerState = DeductionState;
export type KakerlakenPokerAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: KakerlakenPokerSettings): KakerlakenPokerState {
  return deductionInitial(seed, KakerlakenPoker_CFG);
}

export function reducer(state: KakerlakenPokerState, action: KakerlakenPokerAction): KakerlakenPokerState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, KakerlakenPoker_CFG);
  return state;
}

export function isTerminal(state: KakerlakenPokerState): { score: number } | null {
  const r = deductionScore(state, KakerlakenPoker_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Bluff guess on two cards.";
