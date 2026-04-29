import {
  makeInitialState,
  reducer as engineReducer,
  isTerminal as engineTerminal,
  type MahjongState,
  type MahjongAction,
  type TilePos,
} from "../_shared/mahjongEngine.js";

export type MahjongMtFujiState = MahjongState;
export type MahjongMtFujiAction = MahjongAction;

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
  { row: 0, col: 1, layer: 1 },
  { row: 0, col: 2, layer: 1 },
  { row: 0, col: 3, layer: 1 },
  { row: 0, col: 4, layer: 1 },
  { row: 0, col: 5, layer: 1 },
  { row: 0, col: 6, layer: 1 },
  { row: 0, col: 7, layer: 1 },
  { row: 0, col: 2, layer: 2 },
  { row: 0, col: 3, layer: 2 },
  { row: 0, col: 4, layer: 2 },
  { row: 0, col: 5, layer: 2 },
  { row: 0, col: 6, layer: 2 },
  { row: 0, col: 3, layer: 3 },
  { row: 0, col: 4, layer: 3 },
  { row: 0, col: 5, layer: 3 },
  { row: 0, col: 4, layer: 4 },
  { row: 1, col: 0, layer: 0 },
  { row: 1, col: 8, layer: 0 },
  { row: 2, col: 0, layer: 0 },
  { row: 2, col: 8, layer: 0 },
  { row: 3, col: 0, layer: 0 },
];

export function initialState(seed: number, _settings: Record<string, never> = {}): MahjongState {
  void _settings;
  return makeInitialState(LAYOUT, seed);
}

export const reducer = engineReducer;
export const isTerminal = engineTerminal;
