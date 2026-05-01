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

export type AddictionSoliState = GapsFamilyState;
export type AddictionSoliAction = GapsFamilyAction;
export interface AddictionSoliSettings { _dummy?: undefined }

export function initialState(seed: number, _s: AddictionSoliSettings): AddictionSoliState {
  void _s;
  return makeGapsFamilyState(seed, cfg);
}

export function reducer(s: AddictionSoliState, a: AddictionSoliAction): AddictionSoliState {
  return reduceGapsFamily(s, a, cfg);
}

export function isTerminal(s: AddictionSoliState): { score: number } | null {
  return isGapsFamilyTerminal(s);
}
