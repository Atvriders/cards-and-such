import {
  makeInitialState,
  reducer as engineReducer,
  isTerminal as engineTerminal,
  type MahjongState,
  type MahjongAction,
  type TilePos,
} from "../_shared/mahjongEngine.js";

export type MahjongGalaxySpiralState = MahjongState;
export type MahjongGalaxySpiralAction = MahjongAction;

// Galaxy spiral: 4x4 dense core (16) + two outward spiral arms (16) + 4-tile center stack
// = 36 tiles, all unique {row,col,layer}.
export const LAYOUT: TilePos[] = [
  // Core 4x4 (layer 0)
  { row: 3, col: 3, layer: 0 },
  { row: 3, col: 4, layer: 0 },
  { row: 3, col: 5, layer: 0 },
  { row: 3, col: 6, layer: 0 },
  { row: 4, col: 3, layer: 0 },
  { row: 4, col: 4, layer: 0 },
  { row: 4, col: 5, layer: 0 },
  { row: 4, col: 6, layer: 0 },
  { row: 5, col: 3, layer: 0 },
  { row: 5, col: 4, layer: 0 },
  { row: 5, col: 5, layer: 0 },
  { row: 5, col: 6, layer: 0 },
  { row: 6, col: 3, layer: 0 },
  { row: 6, col: 4, layer: 0 },
  { row: 6, col: 5, layer: 0 },
  { row: 6, col: 6, layer: 0 },
  // Spiral arm A (north-east, sweeping out)
  { row: 2, col: 5, layer: 0 },
  { row: 2, col: 6, layer: 0 },
  { row: 1, col: 6, layer: 0 },
  { row: 1, col: 7, layer: 0 },
  { row: 0, col: 7, layer: 0 },
  { row: 0, col: 8, layer: 0 },
  { row: 2, col: 7, layer: 0 },
  { row: 1, col: 8, layer: 0 },
  // Spiral arm B (south-west, sweeping out)
  { row: 7, col: 4, layer: 0 },
  { row: 7, col: 3, layer: 0 },
  { row: 8, col: 3, layer: 0 },
  { row: 8, col: 2, layer: 0 },
  { row: 9, col: 2, layer: 0 },
  { row: 9, col: 1, layer: 0 },
  { row: 7, col: 2, layer: 0 },
  { row: 8, col: 1, layer: 0 },
  // Center 2x2 stack — depth toward galactic core
  { row: 4, col: 4, layer: 1 },
  { row: 4, col: 5, layer: 1 },
  { row: 5, col: 4, layer: 1 },
  { row: 5, col: 5, layer: 1 },
];

export function initialState(seed: number, _settings: Record<string, never> = {}): MahjongState {
  void _settings;
  return makeInitialState(LAYOUT, seed);
}

export const reducer = engineReducer;
export const isTerminal = engineTerminal;
