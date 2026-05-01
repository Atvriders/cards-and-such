import {
  makeGapsFamilyState,
  reduceGapsFamily,
  isGapsFamilyTerminal,
  type GapsFamilyAction,
  type GapsFamilyConfig,
  type GapsFamilyState,
} from "../_shared/solitaire-family-engine.js";

export const cfg: GapsFamilyConfig = {
  redeals: 2,
  copies: 1
};

export type MontanaGapsState = GapsFamilyState;
export type MontanaGapsAction = GapsFamilyAction;
export interface MontanaGapsSettings { _dummy?: undefined }

export function initialState(seed: number, _s: MontanaGapsSettings): MontanaGapsState {
  void _s;
  return makeGapsFamilyState(seed, cfg);
}

export function reducer(s: MontanaGapsState, a: MontanaGapsAction): MontanaGapsState {
  return reduceGapsFamily(s, a, cfg);
}

export function isTerminal(s: MontanaGapsState): { score: number } | null {
  return isGapsFamilyTerminal(s);
}
