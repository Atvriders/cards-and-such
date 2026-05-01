import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import type { TileState, TileAction, TileConfig } from "../_shared/tile-engine.js";
import {
  initialTileState,
  tileReducer,
  tileIsTerminal,
} from "../_shared/tile-engine.js";

export const TYPE_NAMES = ["Wood","Stone","Wheat","Brick","Glass"] as const;
export const GRID_SIZE = 4;
export const CELL_COUNT = 16;
export const TOTAL_TILES = 12;
export const NUM_TYPES = 5;

export const CONFIG: TileConfig = {
  gridSize: GRID_SIZE,
  totalTiles: TOTAL_TILES,
  numTypes: NUM_TYPES,
  adjacencyPts: 2,
  clusterBonus: [{ size: 3, pts: 4 }, { size: 5, pts: 8 }],
  completionBonus: 0,
};

export type TinyTownsState = TileState;
export type TinyTownsAction = TileAction;
export interface TinyTownsSettings { dummy: boolean }

export function typeName(t: number): string { return TYPE_NAMES[t] ?? "?"; }

export function initialState(seed: number, _s: TinyTownsSettings): TinyTownsState {
  void mulberry32;
  return initialTileState(seed, CONFIG);
}

export function reducer(state: TinyTownsState, action: TinyTownsAction): TinyTownsState {
  return tileReducer(state, action);
}

export function isTerminal(state: TinyTownsState): { score: number } | null {
  return tileIsTerminal(state);
}
