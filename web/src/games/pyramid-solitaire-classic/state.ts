import {
  makePyramidFamilyState,
  reducePyramidFamily,
  isPyramidFamilyTerminal,
  type PyramidFamilyAction,
  type PyramidFamilyConfig,
  type PyramidFamilyState,
} from "../_shared/solitaire-family-engine.js";

export const cfg: PyramidFamilyConfig = {
  rows: 7,
  sumTarget: 13,
  kingValue: 13,
  redeals: 3
};

export type PyramidSolitaireClassicState = PyramidFamilyState;
export type PyramidSolitaireClassicAction = PyramidFamilyAction;
export interface PyramidSolitaireClassicSettings { _dummy?: undefined }

export function initialState(seed: number, _s: PyramidSolitaireClassicSettings): PyramidSolitaireClassicState {
  void _s;
  return makePyramidFamilyState(seed, cfg);
}

export function reducer(s: PyramidSolitaireClassicState, a: PyramidSolitaireClassicAction): PyramidSolitaireClassicState {
  return reducePyramidFamily(s, a, cfg);
}

export function isTerminal(s: PyramidSolitaireClassicState): { score: number } | null {
  return isPyramidFamilyTerminal(s);
}
