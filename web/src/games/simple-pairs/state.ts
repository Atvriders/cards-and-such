import {
  makePairsFamilyState,
  reducePairsFamily,
  isPairsFamilyTerminal,
  type PairsFamilyAction,
  type PairsFamilyConfig,
  type PairsFamilyState,
} from "../_shared/solitaire-family-engine.js";

export const cfg: PairsFamilyConfig = {
  rows: 5,
  cols: 6,
  adjacency: "any"
};

export type SimplePairsState = PairsFamilyState;
export type SimplePairsAction = PairsFamilyAction;
export interface SimplePairsSettings { _dummy?: undefined }

export function initialState(seed: number, _s: SimplePairsSettings): SimplePairsState {
  void _s;
  return makePairsFamilyState(seed, cfg);
}

export function reducer(s: SimplePairsState, a: SimplePairsAction): SimplePairsState {
  return reducePairsFamily(s, a, cfg);
}

export function isTerminal(s: SimplePairsState): { score: number } | null {
  return isPairsFamilyTerminal(s);
}
