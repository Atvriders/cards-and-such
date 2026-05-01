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

export type ApophisSoliState = PyramidFamilyState;
export type ApophisSoliAction = PyramidFamilyAction;
export interface ApophisSoliSettings { _dummy?: undefined }

export function initialState(seed: number, _s: ApophisSoliSettings): ApophisSoliState {
  void _s;
  return makePyramidFamilyState(seed, cfg);
}

export function reducer(s: ApophisSoliState, a: ApophisSoliAction): ApophisSoliState {
  return reducePyramidFamily(s, a, cfg);
}

export function isTerminal(s: ApophisSoliState): { score: number } | null {
  return isPyramidFamilyTerminal(s);
}
