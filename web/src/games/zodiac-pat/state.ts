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

export type ZodiacPatState = ClockFamilyState;
export type ZodiacPatAction = ClockFamilyAction;
export interface ZodiacPatSettings { _dummy?: undefined }

export function initialState(seed: number, _s: ZodiacPatSettings): ZodiacPatState {
  void _s;
  return makeClockFamilyState(seed, cfg);
}

export function reducer(s: ZodiacPatState, a: ZodiacPatAction): ZodiacPatState {
  return reduceClockFamily(s, a, cfg);
}

export function isTerminal(s: ZodiacPatState): { score: number } | null {
  return isClockFamilyTerminal(s);
}
