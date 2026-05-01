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
  redeals: 1
};

export type PharaohsPyramidState = PyramidFamilyState;
export type PharaohsPyramidAction = PyramidFamilyAction;
export interface PharaohsPyramidSettings { _dummy?: undefined }

export function initialState(seed: number, _s: PharaohsPyramidSettings): PharaohsPyramidState {
  void _s;
  return makePyramidFamilyState(seed, cfg);
}

export function reducer(s: PharaohsPyramidState, a: PharaohsPyramidAction): PharaohsPyramidState {
  return reducePyramidFamily(s, a, cfg);
}

export function isTerminal(s: PharaohsPyramidState): { score: number } | null {
  return isPyramidFamilyTerminal(s);
}
