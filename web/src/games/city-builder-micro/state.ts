import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const GRID_SIZE = 8;
export const TOTAL_TURNS = 20;
export const STARTING_BUDGET = 50;

export type BuildingType = "empty" | "house" | "shop" | "park" | "factory";

export interface Cell {
  building: BuildingType;
}

export interface CityBuilderState {
  rngSeed: number;
  turn: number; // 1..20
  budget: number;
  happiness: number;
  grid: readonly Cell[];  // 8x8 = 64 cells, row-major
  selectedBuilding: BuildingType;
  phase: "building" | "done";
  log: readonly string[];
}

export type CityBuilderAction =
  | { type: "selectBuilding"; building: BuildingType }
  | { type: "place"; cellIndex: number }
  | { type: "endTurn" };

export const BUILDING_INFO: Record<BuildingType, { label: string; cost: number; emoji: string; happinessBase: number }> = {
  empty:   { label: "Empty",   cost: 0,  emoji: "⬜", happinessBase: 0 },
  house:   { label: "House",   cost: 5,  emoji: "🏠", happinessBase: 2 },
  shop:    { label: "Shop",    cost: 8,  emoji: "🏪", happinessBase: 3 },
  park:    { label: "Park",    cost: 6,  emoji: "🌳", happinessBase: 5 },
  factory: { label: "Factory", cost: 4,  emoji: "🏭", happinessBase: -2 },
};

function adjacentIndices(idx: number): number[] {
  const row = Math.floor(idx / GRID_SIZE);
  const col = idx % GRID_SIZE;
  const adj: number[] = [];
  if (row > 0) adj.push((row - 1) * GRID_SIZE + col);
  if (row < GRID_SIZE - 1) adj.push((row + 1) * GRID_SIZE + col);
  if (col > 0) adj.push(row * GRID_SIZE + (col - 1));
  if (col < GRID_SIZE - 1) adj.push(row * GRID_SIZE + (col + 1));
  return adj;
}

export function calcHappiness(grid: readonly Cell[]): number {
  let total = 0;
  grid.forEach((cell, i) => {
    if (cell.building === "empty") return;
    const base = BUILDING_INFO[cell.building].happinessBase;
    const adj = adjacentIndices(i);
    let bonus = 0;
    adj.forEach(ai => {
      const nb = grid[ai]?.building;
      if (!nb) return;
      // Parks boost neighbors, factories hurt neighbors
      if (nb === "park") bonus += 2;
      if (nb === "factory") bonus -= 1;
      // Houses next to shops get bonus
      if (cell.building === "house" && nb === "shop") bonus += 1;
    });
    total += base + bonus;
  });
  return total;
}

export function initialState(seed: number): CityBuilderState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const grid: Cell[] = Array.from({ length: GRID_SIZE * GRID_SIZE }, () => ({ building: "empty" }));
  return {
    rngSeed: nextSeed,
    turn: 1,
    budget: STARTING_BUDGET,
    happiness: 0,
    grid,
    selectedBuilding: "house",
    phase: "building",
    log: [],
  };
}

export function reducer(state: CityBuilderState, action: CityBuilderAction): CityBuilderState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "selectBuilding": {
      if (action.building === "empty") return state;
      return { ...state, selectedBuilding: action.building };
    }

    case "place": {
      const { cellIndex } = action;
      if (cellIndex < 0 || cellIndex >= GRID_SIZE * GRID_SIZE) return state;
      const cell = state.grid[cellIndex];
      if (!cell || cell.building !== "empty") return state;
      const info = BUILDING_INFO[state.selectedBuilding];
      if (state.budget < info.cost) return state;
      const newGrid = [...state.grid];
      newGrid[cellIndex] = { building: state.selectedBuilding };
      const newHappiness = calcHappiness(newGrid);
      return {
        ...state,
        grid: newGrid,
        budget: state.budget - info.cost,
        happiness: newHappiness,
      };
    }

    case "endTurn": {
      const nextTurn = state.turn + 1;
      const log = [...state.log, `Turn ${state.turn}: Happiness ${state.happiness}`];
      if (nextTurn > TOTAL_TURNS) {
        return { ...state, phase: "done", log };
      }
      // Each turn generates some budget from shops and houses
      const income = state.grid.filter(c => c.building === "shop").length * 3
        + state.grid.filter(c => c.building === "house").length * 1;
      return {
        ...state,
        turn: nextTurn,
        budget: state.budget + income,
        log,
      };
    }
  }
}

export function isTerminal(state: CityBuilderState): { score: number } | null {
  if (state.phase !== "done") return null;
  // Score 0-100 based on happiness, target 100+
  return { score: Math.max(0, Math.min(100, state.happiness)) };
}
