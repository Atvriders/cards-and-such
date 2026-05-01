import {
  makePairsFamilyState,
  reducePairsFamily,
  isPairsFamilyTerminal,
  type PairsFamilyAction,
  type PairsFamilyConfig,
  type PairsFamilyState,
} from "../_shared/solitaire-family-engine.js";

export const cfg: PairsFamilyConfig = {
  rows: 4,
  cols: 4,
  adjacency: "neighbour"
};

export type MiniPokerSquareState = PairsFamilyState;
export type MiniPokerSquareAction = PairsFamilyAction;
export interface MiniPokerSquareSettings { _dummy?: undefined }

export function initialState(seed: number, _s: MiniPokerSquareSettings): MiniPokerSquareState {
  void _s;
  return makePairsFamilyState(seed, cfg);
}

export function reducer(s: MiniPokerSquareState, a: MiniPokerSquareAction): MiniPokerSquareState {
  return reducePairsFamily(s, a, cfg);
}

export function isTerminal(s: MiniPokerSquareState): { score: number } | null {
  return isPairsFamilyTerminal(s);
}
