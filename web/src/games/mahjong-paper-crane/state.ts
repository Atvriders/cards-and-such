import {
  makeInitialState,
  reducer as engineReducer,
  isTerminal as engineTerminal,
  type MahjongState,
  type MahjongAction,
  type TilePos,
} from "../_shared/mahjongEngine.js";

export type MahjongPaperCraneState = MahjongState;
export type MahjongPaperCraneAction = MahjongAction;

// Paper crane (origami) — symmetric body + outstretched wings + tail = 36
export const LAYOUT: TilePos[] = [
  // Body core (3x3)
  { row: 2, col: 4, layer: 0 },
  { row: 2, col: 5, layer: 0 },
  { row: 2, col: 6, layer: 0 },
  { row: 3, col: 4, layer: 0 },
  { row: 3, col: 5, layer: 0 },
  { row: 3, col: 6, layer: 0 },
  { row: 4, col: 4, layer: 0 },
  { row: 4, col: 5, layer: 0 },
  { row: 4, col: 6, layer: 0 },
  // Left wing (sweeping up-left)
  { row: 1, col: 3, layer: 0 },
  { row: 1, col: 2, layer: 0 },
  { row: 0, col: 2, layer: 0 },
  { row: 0, col: 1, layer: 0 },
  { row: 0, col: 0, layer: 0 },
  { row: 1, col: 1, layer: 0 },
  // Right wing (sweeping up-right)
  { row: 1, col: 7, layer: 0 },
  { row: 1, col: 8, layer: 0 },
  { row: 0, col: 8, layer: 0 },
  { row: 0, col: 9, layer: 0 },
  { row: 0, col: 10, layer: 0 },
  { row: 1, col: 9, layer: 0 },
  // Beak (left-extending)
  { row: 3, col: 3, layer: 0 },
  { row: 3, col: 2, layer: 0 },
  { row: 3, col: 1, layer: 0 },
  // Tail (right-extending fan)
  { row: 3, col: 7, layer: 0 },
  { row: 3, col: 8, layer: 0 },
  { row: 2, col: 8, layer: 0 },
  { row: 4, col: 8, layer: 0 },
  // Lower body / legs
  { row: 5, col: 4, layer: 0 },
  { row: 5, col: 5, layer: 0 },
  { row: 5, col: 6, layer: 0 },
  { row: 6, col: 4, layer: 0 },
  { row: 6, col: 6, layer: 0 },
  // Crest (layer 1) — origami fold accents
  { row: 2, col: 5, layer: 1 },
  { row: 3, col: 5, layer: 1 },
  { row: 4, col: 5, layer: 1 },
];

export function initialState(seed: number, _settings: Record<string, never> = {}): MahjongState {
  void _settings;
  return makeInitialState(LAYOUT, seed);
}

export const reducer = engineReducer;
export const isTerminal = engineTerminal;
