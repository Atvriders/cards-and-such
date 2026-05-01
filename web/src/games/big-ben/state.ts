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
  copies: 2
};

export type BigBenState = ClockFamilyState;
export type BigBenAction = ClockFamilyAction;
export interface BigBenSettings { _dummy?: undefined }

export function initialState(seed: number, _s: BigBenSettings): BigBenState {
  void _s;
  return makeClockFamilyState(seed, cfg);
}

export function reducer(s: BigBenState, a: BigBenAction): BigBenState {
  return reduceClockFamily(s, a, cfg);
}

export function isTerminal(s: BigBenState): { score: number } | null {
  return isClockFamilyTerminal(s);
}
