import {
  makePairsFamilyState,
  reducePairsFamily,
  isPairsFamilyTerminal,
  type PairsFamilyAction,
  type PairsFamilyConfig,
  type PairsFamilyState,
} from "../_shared/solitaire-family-engine.js";

export const cfg: PairsFamilyConfig = {
  rows: 6,
  cols: 9,
  adjacency: "any"
};

export type TrefoilState = PairsFamilyState;
export type TrefoilAction = PairsFamilyAction;
export interface TrefoilSettings { _dummy?: undefined }

export function initialState(seed: number, _s: TrefoilSettings): TrefoilState {
  void _s;
  return makePairsFamilyState(seed, cfg);
}

export function reducer(s: TrefoilState, a: TrefoilAction): TrefoilState {
  return reducePairsFamily(s, a, cfg);
}

export function isTerminal(s: TrefoilState): { score: number } | null {
  return isPairsFamilyTerminal(s);
}
