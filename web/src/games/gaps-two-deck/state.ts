import {
  makeGapsFamilyState,
  reduceGapsFamily,
  isGapsFamilyTerminal,
  type GapsFamilyAction,
  type GapsFamilyConfig,
  type GapsFamilyState,
} from "../_shared/solitaire-family-engine.js";

// Two-deck Gaps traditionally uses two decks with an 8×13 grid; our compact
// engine works on 4×13 so the variant collapses to a single-deck game with
// an extra redeal as compensation.
export const cfg: GapsFamilyConfig = {
  redeals: 3,
  copies: 1
};

export type GapsTwoDeckState = GapsFamilyState;
export type GapsTwoDeckAction = GapsFamilyAction;
export interface GapsTwoDeckSettings { _dummy?: undefined }

export function initialState(seed: number, _s: GapsTwoDeckSettings): GapsTwoDeckState {
  void _s;
  return makeGapsFamilyState(seed, cfg);
}

export function reducer(s: GapsTwoDeckState, a: GapsTwoDeckAction): GapsTwoDeckState {
  return reduceGapsFamily(s, a, cfg);
}

export function isTerminal(s: GapsTwoDeckState): { score: number } | null {
  return isGapsFamilyTerminal(s);
}
