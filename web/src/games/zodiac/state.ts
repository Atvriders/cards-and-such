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

export type ZodiacState = ClockFamilyState;
export type ZodiacAction = ClockFamilyAction;
export interface ZodiacSettings { _dummy?: undefined }

export function initialState(seed: number, _s: ZodiacSettings): ZodiacState {
  void _s;
  return makeClockFamilyState(seed, cfg);
}

export function reducer(s: ZodiacState, a: ZodiacAction): ZodiacState {
  return reduceClockFamily(s, a, cfg);
}

export function isTerminal(s: ZodiacState): { score: number } | null {
  return isClockFamilyTerminal(s);
}
