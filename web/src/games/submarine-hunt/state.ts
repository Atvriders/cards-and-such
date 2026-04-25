import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SubmarineSettings {
  gridSize: "8" | "10" | "12";
  submarines: "3" | "4" | "5";
}

export type CellState = "unknown" | "miss" | "hit" | "sunk";

export interface SubmarineHuntState {
  settings: SubmarineSettings;
  gridSize: number;
  grid: CellState[][];
  submarines: number[][]; // each sub is list of [row,col] cells
  subSunk: boolean[];
  shots: number;
  hits: number;
  score: number;
  over: boolean;
  rngSeed: number;
}

export type SubmarineHuntAction =
  | { type: "fire"; row: number; col: number };

function placeSubmarines(gridSize: number, count: number, seed: number): { subs: number[][][]; nextSeed: number } {
  const rng = mulberry32(seed);
  let nextSeed = seed;
  const occupied = new Set<string>();
  const subs: number[][][] = [];
  let attempts = 0;

  while (subs.length < count && attempts < 10000) {
    attempts++;
    const len = 2 + Math.floor(rng() * 2); // length 2 or 3
    const horiz = rng() < 0.5;
    const maxR = horiz ? gridSize - 1 : gridSize - len;
    const maxC = horiz ? gridSize - len : gridSize - 1;
    const r = Math.floor(rng() * (maxR + 1));
    const c = Math.floor(rng() * (maxC + 1));
    nextSeed = Math.floor(rng() * 2 ** 31);

    const cells: number[][] = [];
    for (let i = 0; i < len; i++) {
      cells.push(horiz ? [r, c + i] : [r + i, c]);
    }

    // Check overlap
    const keys = cells.map(([row, col]) => `${row},${col}`);
    if (keys.some((k) => occupied.has(k))) continue;

    keys.forEach((k) => occupied.add(k));
    subs.push(cells);
  }

  return { subs, nextSeed };
}

export function initialState(seed: number, settings: SubmarineSettings): SubmarineHuntState {
  const gridSize = parseInt(settings.gridSize, 10);
  const count = parseInt(settings.submarines, 10);
  const grid: CellState[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill("unknown"));
  const { subs, nextSeed } = placeSubmarines(gridSize, count, seed);
  return {
    settings,
    gridSize,
    grid,
    submarines: subs.map((sub) => sub.flat()),
    subSunk: Array(subs.length).fill(false),
    shots: 0,
    hits: 0,
    score: 0,
    over: false,
    rngSeed: nextSeed,
  };
}

export function reducer(state: SubmarineHuntState, action: SubmarineHuntAction): SubmarineHuntState {
  if (state.over) return state;

  switch (action.type) {
    case "fire": {
      const { row, col } = action;
      if (state.grid[row]?.[col] !== "unknown") return state;

      // Check hit
      let isHit = false;
      let hitSubIdx = -1;
      const subCells = state.submarines;

      for (let i = 0; i < subCells.length; i++) {
        const cells = subCells[i]!;
        // cells is flat array: [r0, c0, r1, c1, ...]
        for (let j = 0; j < cells.length; j += 2) {
          if (cells[j] === row && cells[j + 1] === col) {
            isHit = true;
            hitSubIdx = i;
            break;
          }
        }
        if (isHit) break;
      }

      // Update grid
      const newGrid = state.grid.map((r, ri) =>
        r.map((c, ci) => (ri === row && ci === col ? (isHit ? "hit" : "miss") : c))
      );

      // Check if sub sunk
      const newSubSunk = [...state.subSunk];
      if (isHit && hitSubIdx >= 0) {
        const subCellList = state.submarines[hitSubIdx]!;
        const allHit = (() => {
          for (let j = 0; j < subCellList.length; j += 2) {
            const r = subCellList[j]!;
            const c = subCellList[j + 1]!;
            if (r === row && c === col) continue; // just hit
            if (newGrid[r]?.[c] !== "hit") return false;
          }
          return true;
        })();

        if (allHit) {
          newSubSunk[hitSubIdx] = true;
          // Mark all cells as sunk
          for (let j = 0; j < subCellList.length; j += 2) {
            const r = subCellList[j]!;
            const c = subCellList[j + 1]!;
            if (newGrid[r]) newGrid[r]![c] = "sunk";
          }
        }
      }

      const shots = state.shots + 1;
      const hits = state.hits + (isHit ? 1 : 0);
      const sunkenCount = newSubSunk.filter(Boolean).length;
      const score = sunkenCount * 100 - (shots - hits) * 5;
      const over = newSubSunk.every(Boolean);

      return {
        ...state,
        grid: newGrid,
        subSunk: newSubSunk,
        shots,
        hits,
        score: Math.max(0, score),
        over,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: SubmarineHuntState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
