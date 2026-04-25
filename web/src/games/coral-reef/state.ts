import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CoralReefSettings {
  size: "4" | "5" | "6";
}

export type ReefCell = "empty" | "coral" | "fish" | "seaweed" | "pearl";

export interface CoralReefState {
  settings: CoralReefSettings;
  grid: ReefCell[];
  cols: number;
  selected: number | null;
  collected: number;
  pearls: number;
  moves: number;
  gameOver: boolean;
  message: string;
}

export type CoralReefAction =
  | { type: "select"; idx: number }
  | { type: "restart" };

function buildReef(seed: number, cols: number): ReefCell[] {
  const rng = mulberry32(seed);
  const total = cols * cols;
  return Array.from({ length: total }, () => {
    const r = rng();
    if (r < 0.12) return "pearl";
    if (r < 0.30) return "fish";
    if (r < 0.50) return "coral";
    if (r < 0.65) return "seaweed";
    return "empty";
  });
}

function adjacentTo(idx: number, cols: number): number[] {
  const row = Math.floor(idx / cols);
  const col = idx % cols;
  const adj: number[] = [];
  if (row > 0) adj.push(idx - cols);
  if (row < cols - 1) adj.push(idx + cols);
  if (col > 0) adj.push(idx - 1);
  if (col < cols - 1) adj.push(idx + 1);
  return adj;
}

function flood(grid: ReefCell[], startIdx: number, cols: number): number[] {
  const target = grid[startIdx];
  if (!target || target === "empty") return [];
  const visited = new Set<number>();
  const queue = [startIdx];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (visited.has(curr)) continue;
    visited.add(curr);
    for (const n of adjacentTo(curr, cols)) {
      if (!visited.has(n) && grid[n] === target) queue.push(n);
    }
  }
  return visited.size >= 2 ? [...visited] : [];
}

export function initialState(seed: number, settings: CoralReefSettings): CoralReefState {
  const cols = parseInt(settings.size, 10);
  const grid = buildReef(seed, cols);
  return {
    settings,
    grid,
    cols,
    selected: null,
    collected: 0,
    pearls: 0,
    moves: 0,
    gameOver: false,
    message: "Match adjacent tiles of the same type!",
  };
}

export function reducer(state: CoralReefState, action: CoralReefAction): CoralReefState {
  if (action.type === "restart") {
    return initialState(Math.floor(Math.random() * 99999), state.settings);
  }
  if (action.type === "select" && !state.gameOver) {
    const { grid, cols } = state;
    const tile = grid[action.idx];
    if (!tile || tile === "empty") return state;

    const group = flood(grid, action.idx, cols);
    if (group.length === 0) return { ...state, message: "Need at least 2 adjacent tiles!" };

    const isPearl = tile === "pearl";
    const newGrid = grid.map((c, i) => group.includes(i) ? "empty" : c) as ReefCell[];
    const newCollected = state.collected + group.length;
    const newPearls = state.pearls + (isPearl ? group.length : 0);
    const allEmpty = newGrid.every(c => c === "empty");
    return {
      ...state,
      grid: newGrid,
      selected: null,
      collected: newCollected,
      pearls: newPearls,
      moves: state.moves + 1,
      gameOver: allEmpty,
      message: allEmpty ? `Reef cleared! Collected ${newCollected}` : `Cleared ${group.length} ${tile}s!`,
    };
  }
  return state;
}

export function isTerminal(state: CoralReefState): { score: number } | null {
  if (!state.gameOver) return null;
  const base = state.collected * 10;
  const pearlBonus = state.pearls * 20;
  const moveBonus = Math.max(0, 200 - state.moves * 5);
  return { score: Math.min(1000, base + pearlBonus + moveBonus) };
}
