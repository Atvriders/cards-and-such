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
  redeals: 0
};

export type PyramidNoRedealState = PyramidFamilyState;
export type PyramidNoRedealAction = PyramidFamilyAction;
export interface PyramidNoRedealSettings { _dummy?: undefined }

export function initialState(seed: number, _s: PyramidNoRedealSettings): PyramidNoRedealState {
  void _s;
  return makePyramidFamilyState(seed, cfg);
}

export function reducer(s: PyramidNoRedealState, a: PyramidNoRedealAction): PyramidNoRedealState {
  return reducePyramidFamily(s, a, cfg);
}

export function isTerminal(s: PyramidNoRedealState): { score: number } | null {
  return isPyramidFamilyTerminal(s);
}
