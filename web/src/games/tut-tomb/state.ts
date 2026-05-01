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

export type TutTombState = PyramidFamilyState;
export type TutTombAction = PyramidFamilyAction;
export interface TutTombSettings { _dummy?: undefined }

export function initialState(seed: number, _s: TutTombSettings): TutTombState {
  void _s;
  return makePyramidFamilyState(seed, cfg);
}

export function reducer(s: TutTombState, a: TutTombAction): TutTombState {
  return reducePyramidFamily(s, a, cfg);
}

export function isTerminal(s: TutTombState): { score: number } | null {
  return isPyramidFamilyTerminal(s);
}
