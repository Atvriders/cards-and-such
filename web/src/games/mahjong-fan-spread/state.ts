import {
  makeInitialState,
  reducer as engineReducer,
  isTerminal as engineTerminal,
  type MahjongState,
  type MahjongAction,
  type TilePos,
} from "../_shared/mahjongEngine.js";

export type LayoutState = MahjongState;
export type LayoutAction = MahjongAction;

export const LAYOUT: TilePos[] = [
  { row: 0, col: 2, layer: 0 },
  { row: 0, col: 3, layer: 0 },
  { row: 0, col: 4, layer: 0 },
  { row: 0, col: 5, layer: 0 },
  { row: 0, col: 6, layer: 0 },
  { row: 0, col: 7, layer: 0 },
  { row: 0, col: 8, layer: 0 },
  { row: 1, col: 1, layer: 0 },
  { row: 1, col: 2, layer: 0 },
  { row: 1, col: 3, layer: 0 },
  { row: 1, col: 4, layer: 0 },
  { row: 1, col: 5, layer: 0 },
  { row: 1, col: 6, layer: 0 },
  { row: 1, col: 7, layer: 0 },
  { row: 1, col: 8, layer: 0 },
  { row: 1, col: 9, layer: 0 },
  { row: 2, col: 0, layer: 0 },
  { row: 2, col: 1, layer: 0 },
  { row: 2, col: 2, layer: 0 },
  { row: 2, col: 3, layer: 0 },
  { row: 2, col: 4, layer: 0 },
  { row: 2, col: 5, layer: 0 },
  { row: 2, col: 6, layer: 0 },
  { row: 2, col: 7, layer: 0 },
  { row: 2, col: 8, layer: 0 },
  { row: 2, col: 9, layer: 0 },
  { row: 2, col: 10, layer: 0 },
  { row: 3, col: 0, layer: 0 },
  { row: 3, col: 1, layer: 0 },
  { row: 3, col: 2, layer: 0 },
  { row: 3, col: 3, layer: 0 },
  { row: 3, col: 4, layer: 0 },
  { row: 3, col: 5, layer: 0 },
  { row: 3, col: 6, layer: 0 },
  { row: 3, col: 7, layer: 0 },
  { row: 3, col: 8, layer: 0 },
  { row: 3, col: 9, layer: 0 },
  { row: 3, col: 10, layer: 0 },
  { row: 4, col: 5, layer: 0 },
  { row: 5, col: 5, layer: 0 },
  { row: 6, col: 5, layer: 0 },
  { row: 7, col: 5, layer: 0 },
  { row: 2, col: 2, layer: 1 },
  { row: 2, col: 3, layer: 1 },
  { row: 2, col: 4, layer: 1 },
  { row: 2, col: 5, layer: 1 },
  { row: 2, col: 6, layer: 1 },
  { row: 2, col: 7, layer: 1 }
];

export function initialState(seed: number, _settings: Record<string, never> = {}): MahjongState {
  void _settings;
  return makeInitialState(LAYOUT, seed);
}

export const reducer = engineReducer;
export const isTerminal = engineTerminal;
