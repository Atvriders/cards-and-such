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

export type TutsTombState = PyramidFamilyState;
export type TutsTombAction = PyramidFamilyAction;
export interface TutsTombSettings { _dummy?: undefined }

export function initialState(seed: number, _s: TutsTombSettings): TutsTombState {
  void _s;
  return makePyramidFamilyState(seed, cfg);
}

export function reducer(s: TutsTombState, a: TutsTombAction): TutsTombState {
  return reducePyramidFamily(s, a, cfg);
}

export function isTerminal(s: TutsTombState): { score: number } | null {
  return isPyramidFamilyTerminal(s);
}
