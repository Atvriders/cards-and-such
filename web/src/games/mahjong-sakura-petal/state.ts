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

// Sakura petal — single elongated petal shape with rounded tip and stem
export const LAYOUT: TilePos[] = [
  // Petal tip (top, rounded)
  { row: 0, col: 4, layer: 0 },
  { row: 0, col: 5, layer: 0 },
  { row: 1, col: 3, layer: 0 },
  { row: 1, col: 4, layer: 0 },
  { row: 1, col: 5, layer: 0 },
  { row: 1, col: 6, layer: 0 },
  // Petal body (widest)
  { row: 2, col: 2, layer: 0 },
  { row: 2, col: 3, layer: 0 },
  { row: 2, col: 4, layer: 0 },
  { row: 2, col: 5, layer: 0 },
  { row: 2, col: 6, layer: 0 },
  { row: 2, col: 7, layer: 0 },
  { row: 3, col: 2, layer: 0 },
  { row: 3, col: 3, layer: 0 },
  { row: 3, col: 4, layer: 0 },
  { row: 3, col: 5, layer: 0 },
  { row: 3, col: 6, layer: 0 },
  { row: 3, col: 7, layer: 0 },
  // Tapering
  { row: 4, col: 3, layer: 0 },
  { row: 4, col: 4, layer: 0 },
  { row: 4, col: 5, layer: 0 },
  { row: 4, col: 6, layer: 0 },
  { row: 5, col: 4, layer: 0 },
  { row: 5, col: 5, layer: 0 },
  // Stem
  { row: 6, col: 4, layer: 0 },
  { row: 6, col: 5, layer: 0 },
  { row: 7, col: 4, layer: 0 },
  { row: 7, col: 5, layer: 0 },
  // Veins (layer 1) — running down center
  { row: 2, col: 4, layer: 1 },
  { row: 2, col: 5, layer: 1 },
  { row: 3, col: 4, layer: 1 },
  { row: 3, col: 5, layer: 1 },
  { row: 4, col: 4, layer: 1 },
  { row: 4, col: 5, layer: 1 },
  // Top accent
  { row: 3, col: 4, layer: 2 },
  { row: 3, col: 5, layer: 2 },
];

export function initialState(seed: number, _settings: Record<string, never> = {}): MahjongState {
  void _settings;
  return makeInitialState(LAYOUT, seed);
}

export const reducer = engineReducer;
export const isTerminal = engineTerminal;
