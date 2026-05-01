import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import type { TileState, TileAction, TileConfig } from "../_shared/tile-engine.js";
import {
  initialTileState,
  tileReducer,
  tileIsTerminal,
} from "../_shared/tile-engine.js";

export const TYPE_NAMES = ["Lion","Elephant","Zebra","Giraffe","Acacia"] as const;
export const GRID_SIZE = 6;
export const CELL_COUNT = 36;
export const TOTAL_TILES = 18;
export const NUM_TYPES = 5;

export const CONFIG: TileConfig = {
  gridSize: GRID_SIZE,
  totalTiles: TOTAL_TILES,
  numTypes: NUM_TYPES,
  adjacencyPts: 2,
  clusterBonus: [{ size: 3, pts: 4 }, { size: 5, pts: 8 }],
  completionBonus: 0,
};

export type CarcassonneSafariState = TileState;
export type CarcassonneSafariAction = TileAction;
export interface CarcassonneSafariSettings { dummy: boolean }

export function typeName(t: number): string { return TYPE_NAMES[t] ?? "?"; }

export function initialState(seed: number, _s: CarcassonneSafariSettings): CarcassonneSafariState {
  void mulberry32;
  return initialTileState(seed, CONFIG);
}

export function reducer(state: CarcassonneSafariState, action: CarcassonneSafariAction): CarcassonneSafariState {
  return tileReducer(state, action);
}

export function isTerminal(state: CarcassonneSafariState): { score: number } | null {
  return tileIsTerminal(state);
}
