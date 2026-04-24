import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Treasure Hunt — dig cells on a grid to find hidden treasure

export interface TreasureSettings {
  size: "4" | "5" | "6";
}

export type CellState = "hidden" | "empty" | "warm" | "hot" | "treasure";

export interface TreasureState {
  settings: TreasureSettings;
  rngSeed: number;
  size: number;
  grid: CellState[];
  treasureIndex: number;
  digs: number;
  found: boolean;
  message: string;
}

export type TreasureAction = { type: "dig"; index: number };

function dist(a: number, b: number, size: number): number {
  const ax = a % size, ay = Math.floor(a / size);
  const bx = b % size, by = Math.floor(b / size);
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

export function initialState(seed: number, settings: TreasureSettings): TreasureState {
  const size = parseInt(settings.size);
  const rng = mulberry32(seed);
  const treasureIndex = Math.floor(rng() * (size * size));
  return {
    settings,
    rngSeed: seed,
    size,
    grid: new Array(size * size).fill("hidden"),
    treasureIndex,
    digs: 0,
    found: false,
    message: "Dig a cell to search for treasure!",
  };
}

export function reducer(state: TreasureState, action: TreasureAction): TreasureState {
  if (state.found) return state;
  if (action.type !== "dig") return state;
  if (state.grid[action.index] !== "hidden") return { ...state, message: "Already dug there! Try another spot." };

  const d = dist(action.index, state.treasureIndex, state.size);
  const newGrid = [...state.grid];
  const digs = state.digs + 1;

  if (d === 0) {
    newGrid[action.index] = "treasure";
    return { ...state, grid: newGrid, digs, found: true, message: `You found the treasure in ${digs} digs! Amazing!` };
  }

  newGrid[action.index] = d === 1 ? "hot" : d <= 2 ? "warm" : "empty";
  const hint = d === 1 ? "Very hot! Treasure is right next to this!" : d <= 2 ? "Warm! Getting closer!" : "Cold... keep searching.";
  return { ...state, grid: newGrid, digs, message: `Dig #${digs}: ${hint}` };
}

export function isTerminal(state: TreasureState): { score: number } | null {
  if (!state.found) return null;
  const perfect = 1;
  const maxDigs = state.size * state.size;
  const score = Math.max(10, Math.round(100 - ((state.digs - perfect) / maxDigs) * 90));
  return { score };
}
