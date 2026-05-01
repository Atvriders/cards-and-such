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
  perRing: 4,
  copies: 1
};

export type ClockPatienceState = ClockFamilyState;
export type ClockPatienceAction = ClockFamilyAction;
export interface ClockPatienceSettings { _dummy?: undefined }

export function initialState(seed: number, _s: ClockPatienceSettings): ClockPatienceState {
  void _s;
  return makeClockFamilyState(seed, cfg);
}

export function reducer(s: ClockPatienceState, a: ClockPatienceAction): ClockPatienceState {
  return reduceClockFamily(s, a, cfg);
}

export function isTerminal(s: ClockPatienceState): { score: number } | null {
  return isClockFamilyTerminal(s);
}
