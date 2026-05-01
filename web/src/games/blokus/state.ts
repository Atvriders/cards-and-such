import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import type { TileState, TileAction, TileConfig } from "../_shared/tile-engine.js";
import {
  initialTileState,
  tileReducer,
  tileIsTerminal,
} from "../_shared/tile-engine.js";

export const TYPE_NAMES = ["Red","Blue","Yellow","Green"] as const;
export const GRID_SIZE = 6;
export const CELL_COUNT = 36;
export const TOTAL_TILES = 20;
export const NUM_TYPES = 4;

export const CONFIG: TileConfig = {
  gridSize: GRID_SIZE,
  totalTiles: TOTAL_TILES,
  numTypes: NUM_TYPES,
  adjacencyPts: 2,
  clusterBonus: [{ size: 3, pts: 4 }, { size: 5, pts: 8 }],
  completionBonus: 0,
};

export type BlokusState = TileState;
export type BlokusAction = TileAction;
export interface BlokusSettings { dummy: boolean }

export function typeName(t: number): string { return TYPE_NAMES[t] ?? "?"; }

export function initialState(seed: number, _s: BlokusSettings): BlokusState {
  void mulberry32;
  return initialTileState(seed, CONFIG);
}

export function reducer(state: BlokusState, action: BlokusAction): BlokusState {
  return tileReducer(state, action);
}

export function isTerminal(state: BlokusState): { score: number } | null {
  return tileIsTerminal(state);
}
