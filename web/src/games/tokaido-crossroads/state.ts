import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import type { TileState, TileAction, TileConfig } from "../_shared/tile-engine.js";
import {
  initialTileState,
  tileReducer,
  tileIsTerminal,
} from "../_shared/tile-engine.js";

export const TYPE_NAMES = ["Path","Shrine","River","Grove","Bridge"] as const;
export const GRID_SIZE = 5;
export const CELL_COUNT = 25;
export const TOTAL_TILES = 16;
export const NUM_TYPES = 5;

export const CONFIG: TileConfig = {
  gridSize: GRID_SIZE,
  totalTiles: TOTAL_TILES,
  numTypes: NUM_TYPES,
  adjacencyPts: 2,
  clusterBonus: [{ size: 3, pts: 4 }, { size: 5, pts: 8 }],
  completionBonus: 0,
};

export type TokaidoCrossroadsState = TileState;
export type TokaidoCrossroadsAction = TileAction;
export interface TokaidoCrossroadsSettings { dummy: boolean }

export function typeName(t: number): string { return TYPE_NAMES[t] ?? "?"; }

export function initialState(seed: number, _s: TokaidoCrossroadsSettings): TokaidoCrossroadsState {
  void mulberry32;
  return initialTileState(seed, CONFIG);
}

export function reducer(state: TokaidoCrossroadsState, action: TokaidoCrossroadsAction): TokaidoCrossroadsState {
  return tileReducer(state, action);
}

export function isTerminal(state: TokaidoCrossroadsState): { score: number } | null {
  return tileIsTerminal(state);
}
