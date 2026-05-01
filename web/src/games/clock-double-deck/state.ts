import {
  makeClockFamilyState,
  reduceClockFamily,
  isClockFamilyTerminal,
  type ClockFamilyAction,
  type ClockFamilyConfig,
  type ClockFamilyState,
} from "../_shared/solitaire-family-engine.js";

export const cfg: ClockFamilyConfig = {
  rings: 13,
  perRing: 8,
  copies: 2
};

export type ClockDoubleDeckState = ClockFamilyState;
export type ClockDoubleDeckAction = ClockFamilyAction;
export interface ClockDoubleDeckSettings { _dummy?: undefined }

export function initialState(seed: number, _s: ClockDoubleDeckSettings): ClockDoubleDeckState {
  void _s;
  return makeClockFamilyState(seed, cfg);
}

export function reducer(s: ClockDoubleDeckState, a: ClockDoubleDeckAction): ClockDoubleDeckState {
  return reduceClockFamily(s, a, cfg);
}

export function isTerminal(s: ClockDoubleDeckState): { score: number } | null {
  return isClockFamilyTerminal(s);
}
