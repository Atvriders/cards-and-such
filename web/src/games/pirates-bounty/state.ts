import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const GRID_COLS = 5;
export const GRID_ROWS = 5;
export const MAX_FUEL = 20;
export const FUEL_PER_SAIL = 1;

export interface Island {
  row: number;
  col: number;
  name: string;
  treasureProbability: number; // 0-1
  dug: boolean;
  hasTreasure: boolean; // revealed after dig
  treasureValue: number; // gold value if treasure found
}

export interface PirateState {
  rngSeed: number;
  turn: number;
  fuel: number;
  gold: number;
  pirateRow: number;
  pirateCol: number;
  islands: readonly Island[];
  phase: "sail" | "done";
  lastResult: string;
  log: readonly string[];
}

export type PirateAction =
  | { type: "sail"; row: number; col: number }
  | { type: "dig" };

const ISLAND_NAMES = [
  "Skull Cove", "Rum Bay", "Dead Man's Reef", "Tortuga", "Black Sand",
  "Serpent Isle", "Kraken Rock", "Mermaid Shoal", "Phantom Isle", "Storm Peak",
  "Bone Atoll", "Silver Sand", "Red Cliffs", "Jade Lagoon", "Crow Nest",
  "Shark Fin", "Anchor Bay", "Ember Isle", "Ghost Reef", "Twin Peaks",
  "Devil's Den", "Whalers Rest", "Cape Fear", "Fury Rock", "Lost Harbor",
];

export function initialState(seed: number): PirateState {
  const rng = mulberry32(seed);
  const islands: Island[] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const prob = 0.2 + rng() * 0.6;
      const value = 20 + Math.round(rng() * 80);
      islands.push({
        row: r, col: c,
        name: ISLAND_NAMES[r * GRID_COLS + c] ?? `Isle ${r * GRID_COLS + c}`,
        treasureProbability: prob,
        dug: false,
        hasTreasure: false,
        treasureValue: value,
      });
    }
  }
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    turn: 1,
    fuel: MAX_FUEL,
    gold: 0,
    pirateRow: 0,
    pirateCol: 0,
    islands,
    phase: "sail",
    lastResult: "⚓ You set sail from port!",
    log: [],
  };
}

export function reducer(state: PirateState, action: PirateAction): PirateState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "sail": {
      const { row, col } = action;
      if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return state;
      if (row === state.pirateRow && col === state.pirateCol) return state;
      const dist = Math.abs(row - state.pirateRow) + Math.abs(col - state.pirateCol);
      const fuelCost = dist * FUEL_PER_SAIL;
      if (fuelCost > state.fuel) return state;
      const newFuel = state.fuel - fuelCost;
      const done = newFuel <= 0;
      return {
        ...state,
        fuel: newFuel,
        pirateRow: row,
        pirateCol: col,
        turn: state.turn + 1,
        phase: done ? "done" : "sail",
        lastResult: `⛵ Sailed to ${state.islands[row * GRID_COLS + col]?.name ?? "island"}. Fuel left: ${newFuel}`,
        log: [...state.log, `Sailed to (${row},${col}) — fuel ${newFuel}`],
      };
    }

    case "dig": {
      const idx = state.pirateRow * GRID_COLS + state.pirateCol;
      const island = state.islands[idx];
      if (!island || island.dug) return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const roll = rng();
      const found = roll < island.treasureProbability;
      const newIslands = [...state.islands] as Island[];
      newIslands[idx] = { ...island, dug: true, hasTreasure: found };
      const goldGained = found ? island.treasureValue : 0;
      const result = found
        ? `💰 Found treasure worth ${goldGained} gold at ${island.name}!`
        : `🪨 Dug at ${island.name} — nothing but sand!`;
      const newFuel = state.fuel - 1; // digging costs 1 fuel
      return {
        ...state,
        rngSeed: nextSeed,
        islands: newIslands,
        gold: state.gold + goldGained,
        fuel: newFuel,
        turn: state.turn + 1,
        phase: newFuel <= 0 ? "done" : "sail",
        lastResult: result,
        log: [...state.log, result],
      };
    }
  }
}

export function isTerminal(state: PirateState): { score: number } | null {
  if (state.phase !== "done") return null;
  // Score: 0-100 based on gold, target 300
  return { score: Math.max(0, Math.min(100, Math.round((state.gold / 300) * 100))) };
}
