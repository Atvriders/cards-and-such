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

export type ZodiacPatienceState = ClockFamilyState;
export type ZodiacPatienceAction = ClockFamilyAction;
export interface ZodiacPatienceSettings { _dummy?: undefined }

export function initialState(seed: number, _s: ZodiacPatienceSettings): ZodiacPatienceState {
  void _s;
  return makeClockFamilyState(seed, cfg);
}

export function reducer(s: ZodiacPatienceState, a: ZodiacPatienceAction): ZodiacPatienceState {
  return reduceClockFamily(s, a, cfg);
}

export function isTerminal(s: ZodiacPatienceState): { score: number } | null {
  return isClockFamilyTerminal(s);
}
