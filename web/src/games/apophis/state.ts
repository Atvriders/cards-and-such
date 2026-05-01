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
  redeals: 2
};

export type ApophisState = PyramidFamilyState;
export type ApophisAction = PyramidFamilyAction;
export interface ApophisSettings { _dummy?: undefined }

export function initialState(seed: number, _s: ApophisSettings): ApophisState {
  void _s;
  return makePyramidFamilyState(seed, cfg);
}

export function reducer(s: ApophisState, a: ApophisAction): ApophisState {
  return reducePyramidFamily(s, a, cfg);
}

export function isTerminal(s: ApophisState): { score: number } | null {
  return isPyramidFamilyTerminal(s);
}
