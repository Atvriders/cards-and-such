import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import type { TileState, TileAction, TileConfig } from "../_shared/tile-engine.js";
import {
  initialTileState,
  tileReducer,
  tileIsTerminal,
} from "../_shared/tile-engine.js";

export const TYPE_NAMES = ["Path","Jungle","Temple","Treasure","Crystal"] as const;
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

export type KarubaExplorerState = TileState;
export type KarubaExplorerAction = TileAction;
export interface KarubaExplorerSettings { dummy: boolean }

export function typeName(t: number): string { return TYPE_NAMES[t] ?? "?"; }

export function initialState(seed: number, _s: KarubaExplorerSettings): KarubaExplorerState {
  void mulberry32;
  return initialTileState(seed, CONFIG);
}

export function reducer(state: KarubaExplorerState, action: KarubaExplorerAction): KarubaExplorerState {
  return tileReducer(state, action);
}

export function isTerminal(state: KarubaExplorerState): { score: number } | null {
  return tileIsTerminal(state);
}
