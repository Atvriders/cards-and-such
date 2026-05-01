import {
  makeInitialState,
  reducer as engineReducer,
  isTerminal as engineTerminal,
  type MahjongState,
  type MahjongAction,
  type TilePos,
} from "../_shared/mahjongEngine.js";

export type MahjongTigerClawState = MahjongState;
export type MahjongTigerClawAction = MahjongAction;

// Tiger claw — palm pad + 4 extending claws with knuckle stacks
export const LAYOUT: TilePos[] = [
  // Palm pad (4x3)
  { row: 4, col: 1, layer: 0 },
  { row: 4, col: 2, layer: 0 },
  { row: 4, col: 3, layer: 0 },
  { row: 4, col: 4, layer: 0 },
  { row: 5, col: 1, layer: 0 },
  { row: 5, col: 2, layer: 0 },
  { row: 5, col: 3, layer: 0 },
  { row: 5, col: 4, layer: 0 },
  { row: 6, col: 1, layer: 0 },
  { row: 6, col: 2, layer: 0 },
  { row: 6, col: 3, layer: 0 },
  { row: 6, col: 4, layer: 0 },
  // Claw 1 (leftmost)
  { row: 3, col: 1, layer: 0 },
  { row: 2, col: 0, layer: 0 },
  { row: 1, col: 0, layer: 0 },
  // Claw 2
  { row: 3, col: 2, layer: 0 },
  { row: 2, col: 2, layer: 0 },
  { row: 1, col: 2, layer: 0 },
  { row: 0, col: 2, layer: 0 },
  // Claw 3
  { row: 3, col: 3, layer: 0 },
  { row: 2, col: 3, layer: 0 },
  { row: 1, col: 3, layer: 0 },
  { row: 0, col: 3, layer: 0 },
  // Claw 4 (rightmost)
  { row: 3, col: 4, layer: 0 },
  { row: 2, col: 5, layer: 0 },
  { row: 1, col: 5, layer: 0 },
  // Wrist
  { row: 7, col: 2, layer: 0 },
  { row: 7, col: 3, layer: 0 },
  // Knuckle stack (layer 1)
  { row: 4, col: 2, layer: 1 },
  { row: 4, col: 3, layer: 1 },
  { row: 5, col: 2, layer: 1 },
  { row: 5, col: 3, layer: 1 },
  // Center pad apex
  { row: 5, col: 2, layer: 2 },
  { row: 5, col: 3, layer: 2 },
];

export function initialState(seed: number, _settings: Record<string, never> = {}): MahjongState {
  void _settings;
  return makeInitialState(LAYOUT, seed);
}

export const reducer = engineReducer;
export const isTerminal = engineTerminal;
