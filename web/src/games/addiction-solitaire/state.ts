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

export type AddictionSolitaireState = GapsFamilyState;
export type AddictionSolitaireAction = GapsFamilyAction;
export interface AddictionSolitaireSettings { _dummy?: undefined }

export function initialState(seed: number, _s: AddictionSolitaireSettings): AddictionSolitaireState {
  void _s;
  return makeGapsFamilyState(seed, cfg);
}

export function reducer(s: AddictionSolitaireState, a: AddictionSolitaireAction): AddictionSolitaireState {
  return reduceGapsFamily(s, a, cfg);
}

export function isTerminal(s: AddictionSolitaireState): { score: number } | null {
  return isGapsFamilyTerminal(s);
}
