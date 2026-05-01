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

export type GizaPyramidState = PyramidFamilyState;
export type GizaPyramidAction = PyramidFamilyAction;
export interface GizaPyramidSettings { _dummy?: undefined }

export function initialState(seed: number, _s: GizaPyramidSettings): GizaPyramidState {
  void _s;
  return makePyramidFamilyState(seed, cfg);
}

export function reducer(s: GizaPyramidState, a: GizaPyramidAction): GizaPyramidState {
  return reducePyramidFamily(s, a, cfg);
}

export function isTerminal(s: GizaPyramidState): { score: number } | null {
  return isPyramidFamilyTerminal(s);
}
