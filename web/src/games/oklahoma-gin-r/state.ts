import type { RummyState, RummyAction, RummyConfig } from "../_shared/rummy-engine.js";
import { rummyInitial, rummyReducer, rummyTerminal, DEFAULT_RUMMY } from "../_shared/rummy-engine.js";

export interface OklahomaGinRSettings { difficulty: "easy" | "hard"; }
export type OklahomaGinRState = RummyState;
export type OklahomaGinRAction = RummyAction;

export const CONFIG: RummyConfig = {
  ...DEFAULT_RUMMY,
  handSize: 10,
  deckCopies: 1,
  withJokers: false,
  knockLimit: 10,
  twosWild: false,
};

export function initialState(seed: number, _settings: OklahomaGinRSettings): OklahomaGinRState {
  return rummyInitial(seed, CONFIG);
}

export function reducer(state: OklahomaGinRState, action: OklahomaGinRAction): OklahomaGinRState {
  return rummyReducer(state, action);
}

export function isTerminal(state: OklahomaGinRState): { score: number } | null {
  return rummyTerminal(state);
}
