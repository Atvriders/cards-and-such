import {
  makeClockFamilyState,
  reduceClockFamily,
  isClockFamilyTerminal,
  type ClockFamilyAction,
  type ClockFamilyConfig,
  type ClockFamilyState,
} from "../_shared/solitaire-family-engine.js";

export const cfg: ClockFamilyConfig = {
  rings: 12,
  perRing: 4,
  copies: 1
};

export type SundialState = ClockFamilyState;
export type SundialAction = ClockFamilyAction;
export interface SundialSettings { _dummy?: undefined }

export function initialState(seed: number, _s: SundialSettings): SundialState {
  void _s;
  return makeClockFamilyState(seed, cfg);
}

export function reducer(s: SundialState, a: SundialAction): SundialState {
  return reduceClockFamily(s, a, cfg);
}

export function isTerminal(s: SundialState): { score: number } | null {
  return isClockFamilyTerminal(s);
}
