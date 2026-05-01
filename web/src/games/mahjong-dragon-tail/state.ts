import {
  makeInitialState,
  reducer as engineReducer,
  isTerminal as engineTerminal,
  type MahjongState,
  type MahjongAction,
  type TilePos,
} from "../_shared/mahjongEngine.js";

export type MahjongDragonTailState = MahjongState;
export type MahjongDragonTailAction = MahjongAction;

// Dragon's tail — sinuous double-curve, 32 base tiles + 4 spine humps = 36
export const LAYOUT: TilePos[] = [
  // Tail tip (upper-left)
  { row: 0, col: 0, layer: 0 },
  { row: 0, col: 1, layer: 0 },
  { row: 0, col: 2, layer: 0 },
  { row: 0, col: 3, layer: 0 },
  // Down-bend
  { row: 1, col: 3, layer: 0 },
  { row: 2, col: 3, layer: 0 },
  // Mid sweep right
  { row: 2, col: 4, layer: 0 },
  { row: 2, col: 5, layer: 0 },
  { row: 2, col: 6, layer: 0 },
  // Up-bend
  { row: 1, col: 6, layer: 0 },
  { row: 0, col: 6, layer: 0 },
  { row: 0, col: 7, layer: 0 },
  { row: 0, col: 8, layer: 0 },
  // Big descending body
  { row: 1, col: 8, layer: 0 },
  { row: 2, col: 8, layer: 0 },
  { row: 3, col: 8, layer: 0 },
  { row: 4, col: 8, layer: 0 },
  { row: 4, col: 7, layer: 0 },
  { row: 4, col: 6, layer: 0 },
  { row: 4, col: 5, layer: 0 },
  { row: 5, col: 5, layer: 0 },
  { row: 6, col: 5, layer: 0 },
  { row: 6, col: 6, layer: 0 },
  { row: 6, col: 7, layer: 0 },
  { row: 6, col: 8, layer: 0 },
  { row: 6, col: 9, layer: 0 },
  // Lower fins
  { row: 7, col: 9, layer: 0 },
  { row: 5, col: 9, layer: 0 },
  // Belly tiles
  { row: 3, col: 5, layer: 0 },
  { row: 3, col: 7, layer: 0 },
  { row: 5, col: 6, layer: 0 },
  { row: 5, col: 8, layer: 0 },
  // Spine humps (layer 1)
  { row: 0, col: 2, layer: 1 },
  { row: 2, col: 5, layer: 1 },
  { row: 4, col: 7, layer: 1 },
  { row: 6, col: 7, layer: 1 },
];

export function initialState(seed: number, _settings: Record<string, never> = {}): MahjongState {
  void _settings;
  return makeInitialState(LAYOUT, seed);
}

export const reducer = engineReducer;
export const isTerminal = engineTerminal;
