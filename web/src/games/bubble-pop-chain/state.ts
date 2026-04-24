import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type BubbleColor = "red" | "blue" | "green" | "yellow" | "purple";
export const BUBBLE_COLORS: BubbleColor[] = ["red", "blue", "green", "yellow", "purple"];

export interface Bubble {
  id: number;
  color: BubbleColor;
  row: number;
  col: number;
  alive: boolean;
}

export interface BubblePopState {
  settings: { colors: "3" | "4" | "5" };
  grid: Bubble[][];  // [row][col]
  rows: number;
  cols: number;
  score: number;
  over: boolean;
  rng: () => number;
  rngSeed: number;
  nextId: number;
  moveTimer: number;
  moveInterval: number; // seconds between rows shifting down
}

export type BubblePopAction =
  | { type: "tick"; dt: number }
  | { type: "pop"; row: number; col: number };

const ROWS = 10;
const COLS = 8;

function randomColor(rng: () => number, numColors: number): BubbleColor {
  return BUBBLE_COLORS[Math.floor(rng() * numColors)]!;
}

function makeGrid(rng: () => number, rows: number, cols: number, numColors: number): Bubble[][] {
  let id = 0;
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      id: id++,
      color: randomColor(rng, numColors),
      row: r,
      col: c,
      alive: true,
    }))
  );
}

export function initialState(seed: number, s: { colors: "3" | "4" | "5" }): BubblePopState {
  const rng = mulberry32(seed);
  const numColors = Number(s.colors);
  // Start with 5 rows filled (rows 5..9, leaving top empty)
  const grid: Bubble[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ id: 0, color: "red" as BubbleColor, row: 0, col: 0, alive: false }))
  );
  let id = 0;
  for (let r = ROWS - 5; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      grid[r]![c] = { id: id++, color: randomColor(rng, numColors), row: r, col: c, alive: true };
    }
  }
  return {
    settings: s,
    grid,
    rows: ROWS,
    cols: COLS,
    score: 0,
    over: false,
    rng,
    rngSeed: seed,
    nextId: id,
    moveTimer: 0,
    moveInterval: 8,
  };
}

// BFS flood-fill to find connected same-color bubbles
function findChain(grid: Bubble[][], row: number, col: number): Array<[number, number]> {
  const target = grid[row]?.[col];
  if (!target || !target.alive) return [];
  const color = target.color;
  const visited = new Set<string>();
  const queue: Array<[number, number]> = [[row, col]];
  const chain: Array<[number, number]> = [];
  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    const key = `${r},${c}`;
    if (visited.has(key)) continue;
    visited.add(key);
    const b = grid[r]?.[c];
    if (!b || !b.alive || b.color !== color) continue;
    chain.push([r, c]);
    queue.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
  }
  return chain;
}

export function reducer(state: BubblePopState, action: BubblePopAction): BubblePopState {
  switch (action.type) {
    case "pop": {
      if (state.over) return state;
      const { row, col } = action;
      const chain = findChain(state.grid, row, col);
      if (chain.length < 2) return state; // need at least 2 to pop

      const newGrid = state.grid.map((r) => r.map((b) => ({ ...b })));
      for (const [r, c] of chain) {
        newGrid[r]![c]!.alive = false;
      }

      const bonus = chain.length >= 5 ? chain.length * 3 : chain.length >= 3 ? chain.length * 2 : chain.length;
      const score = state.score + bonus * 10;

      // Check if grid is clear
      const anyAlive = newGrid.some((r) => r.some((b) => b.alive));
      // Win = all cleared? Just keep playing, no win condition — just avoid overflow
      const over = state.over; // overflow checked in tick

      return { ...state, grid: newGrid, score, over };
    }

    case "tick": {
      if (state.over) return state;
      const { dt } = action;
      let { moveTimer } = state;
      moveTimer += dt;

      if (moveTimer < state.moveInterval) {
        return { ...state, moveTimer };
      }
      moveTimer -= state.moveInterval;

      // Shift all rows down by one
      const newGrid: Bubble[][] = Array.from({ length: state.rows }, () =>
        Array.from({ length: state.cols }, () => ({ id: 0, color: "red" as BubbleColor, row: 0, col: 0, alive: false }))
      );

      // Move existing rows down
      for (let r = state.rows - 1; r > 0; r--) {
        for (let c = 0; c < state.cols; c++) {
          newGrid[r]![c] = { ...state.grid[r - 1]![c]!, row: r };
        }
      }

      // Add new row at top
      const numColors = Number(state.settings.colors);
      let nextId = state.nextId;
      for (let c = 0; c < state.cols; c++) {
        newGrid[0]![c] = {
          id: nextId++,
          color: randomColor(state.rng, numColors),
          row: 0,
          col: c,
          alive: true,
        };
      }

      // Check overflow: if bottom row has alive bubbles
      const over = newGrid[state.rows - 1]!.some((b) => b.alive);

      return { ...state, grid: newGrid, moveTimer, nextId, over };
    }

    default:
      return state;
  }
}

export function isTerminal(state: BubblePopState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

export { ROWS, COLS };
