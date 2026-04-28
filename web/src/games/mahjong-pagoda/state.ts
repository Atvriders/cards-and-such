import {
  makeInitialState,
  reducer as engineReducer,
  isTerminal as engineTerminal,
  type MahjongState,
  type MahjongAction,
  type TilePos,
} from "../_shared/mahjongEngine.js";

export type MahjongPagodaState = MahjongState;
export type MahjongPagodaAction = MahjongAction;

export const LAYOUT: TilePos[] = [
  { row: 0, col: 0, layer: 0 },
  { row: 0, col: 1, layer: 0 },
  { row: 0, col: 2, layer: 0 },
  { row: 0, col: 3, layer: 0 },
  { row: 0, col: 4, layer: 0 },
  { row: 0, col: 5, layer: 0 },
  { row: 0, col: 6, layer: 0 },
  { row: 0, col: 7, layer: 0 },
  { row: 0, col: 8, layer: 0 },
  { row: 0, col: 9, layer: 0 },
  { row: 1, col: 1, layer: 0 },
  { row: 1, col: 2, layer: 0 },
  { row: 1, col: 3, layer: 0 },
  { row: 1, col: 4, layer: 0 },
  { row: 1, col: 5, layer: 0 },
  { row: 1, col: 6, layer: 0 },
  { row: 1, col: 7, layer: 0 },
  { row: 1, col: 8, layer: 0 },
  { row: 2, col: 2, layer: 0 },
  { row: 2, col: 3, layer: 0 },
  { row: 2, col: 4, layer: 0 },
  { row: 2, col: 5, layer: 0 },
  { row: 2, col: 6, layer: 0 },
  { row: 2, col: 7, layer: 0 },
  { row: 3, col: 3, layer: 0 },
  { row: 3, col: 4, layer: 0 },
  { row: 3, col: 5, layer: 0 },
  { row: 3, col: 6, layer: 0 },
  { row: 1, col: 2, layer: 1 },
  { row: 1, col: 3, layer: 1 },
  { row: 1, col: 4, layer: 1 },
  { row: 1, col: 5, layer: 1 },
  { row: 1, col: 6, layer: 1 },
  { row: 1, col: 7, layer: 1 },
  { row: 2, col: 3, layer: 1 },
  { row: 2, col: 4, layer: 1 },
  { row: 2, col: 5, layer: 1 },
  { row: 2, col: 6, layer: 1 },
  { row: 3, col: 4, layer: 1 },
  { row: 3, col: 5, layer: 1 },
  { row: 2, col: 4, layer: 2 },
  { row: 2, col: 5, layer: 2 }
];

export function initialState(seed: number, _settings: Record<string, never> = {}): MahjongState {
  void _settings;
  return makeInitialState(LAYOUT, seed);
}

export const reducer = engineReducer;
export const isTerminal = engineTerminal;
