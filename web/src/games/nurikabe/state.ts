import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface NurikabePuzzle {
  rows: number;
  cols: number;
  /** clues[r*cols+c] = island size, 0 = no clue */
  clues: number[];
  /** solution: true = shaded (sea), false = unshaded (island) */
  solution: boolean[];
}

export interface NurikabeSettings {
  difficulty: "easy" | "medium" | "hard";
}

export type CellState = "unknown" | "shaded" | "unshaded";

export interface NurikabeState {
  puzzle: NurikabePuzzle;
  cells: CellState[];
  won: boolean;
  moves: number;
  rngSeed: number;
  settings: NurikabeSettings;
}

export type NurikabeAction = { type: "toggleCell"; idx: number };

// ---------- Pre-designed puzzles ----------
// Easy 6×6 — verified valid nurikabe solutions using striped island pattern
// Islands at alternating checkerboard positions, each size 1.
const EASY_PUZZLES: NurikabePuzzle[] = [
  {
    rows: 6, cols: 6,
    // Pattern A: islands at even rows × even cols, odd rows × odd cols
    clues: [
      1, 0, 1, 0, 1, 0,
      0, 0, 0, 0, 0, 0,
      0, 1, 0, 1, 0, 1,
      0, 0, 0, 0, 0, 0,
      1, 0, 1, 0, 1, 0,
      0, 0, 0, 0, 0, 0,
    ],
    solution: [
      false, true,  false, true,  false, true,
      true,  true,  true,  true,  true,  true,
      true,  false, true,  false, true,  false,
      true,  true,  true,  true,  true,  true,
      false, true,  false, true,  false, true,
      true,  true,  true,  true,  true,  true,
    ],
  },
  {
    rows: 6, cols: 6,
    // Pattern B: islands at even rows × odd cols, odd rows × even cols
    clues: [
      0, 1, 0, 1, 0, 1,
      0, 0, 0, 0, 0, 0,
      1, 0, 1, 0, 1, 0,
      0, 0, 0, 0, 0, 0,
      0, 1, 0, 1, 0, 1,
      0, 0, 0, 0, 0, 0,
    ],
    solution: [
      true,  false, true,  false, true,  false,
      true,  true,  true,  true,  true,  true,
      false, true,  false, true,  false, true,
      true,  true,  true,  true,  true,  true,
      true,  false, true,  false, true,  false,
      true,  true,  true,  true,  true,  true,
    ],
  },
];

// Medium 8×8 — striped island pattern
const MEDIUM_PUZZLES: NurikabePuzzle[] = [
  {
    rows: 8, cols: 8,
    clues: [
      1, 0, 1, 0, 1, 0, 1, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 1, 0, 1, 0, 1, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0,
      1, 0, 1, 0, 1, 0, 1, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 1, 0, 1, 0, 1, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0,
    ],
    solution: [
      false, true,  false, true,  false, true,  false, true,
      true,  true,  true,  true,  true,  true,  true,  true,
      true,  false, true,  false, true,  false, true,  false,
      true,  true,  true,  true,  true,  true,  true,  true,
      false, true,  false, true,  false, true,  false, true,
      true,  true,  true,  true,  true,  true,  true,  true,
      true,  false, true,  false, true,  false, true,  false,
      true,  true,  true,  true,  true,  true,  true,  true,
    ],
  },
];

// Hard 9×9 — striped island pattern
const HARD_PUZZLES: NurikabePuzzle[] = [
  {
    rows: 9, cols: 9,
    clues: [
      1, 0, 1, 0, 1, 0, 1, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 1, 0, 1, 0, 1, 0, 1, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      1, 0, 1, 0, 1, 0, 1, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 1, 0, 1, 0, 1, 0, 1, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      1, 0, 1, 0, 1, 0, 1, 0, 1,
    ],
    solution: [
      false, true,  false, true,  false, true,  false, true,  false,
      true,  true,  true,  true,  true,  true,  true,  true,  true,
      true,  false, true,  false, true,  false, true,  false, true,
      true,  true,  true,  true,  true,  true,  true,  true,  true,
      false, true,  false, true,  false, true,  false, true,  false,
      true,  true,  true,  true,  true,  true,  true,  true,  true,
      true,  false, true,  false, true,  false, true,  false, true,
      true,  true,  true,  true,  true,  true,  true,  true,  true,
      false, true,  false, true,  false, true,  false, true,  false,
    ],
  },
];

function allPuzzles(difficulty: string): NurikabePuzzle[] {
  if (difficulty === "hard") return HARD_PUZZLES;
  if (difficulty === "medium") return MEDIUM_PUZZLES;
  return EASY_PUZZLES;
}

function checkWin(puzzle: NurikabePuzzle, cells: CellState[]): boolean {
  // All cells must be decided
  if (cells.some((c) => c === "unknown")) return false;
  const { rows, cols } = puzzle;
  const shaded = cells.map((c) => c === "shaded");
  // 1. No 2×2 fully shaded block
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      if (shaded[r * cols + c] && shaded[r * cols + c + 1] && shaded[(r + 1) * cols + c] && shaded[(r + 1) * cols + c + 1]) {
        return false;
      }
    }
  }
  // 2. Sea (shaded) must be a single connected region
  const seaCells = shaded.map((s, i) => s ? i : -1).filter((i) => i >= 0);
  if (seaCells.length > 0) {
    const visited = new Set<number>();
    const q = [seaCells[0]!];
    while (q.length) {
      const idx = q.shift()!;
      if (visited.has(idx)) continue;
      visited.add(idx);
      const r = Math.floor(idx / cols);
      const c = idx % cols;
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as [number, number][]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          const ni = nr * cols + nc;
          if (shaded[ni] && !visited.has(ni)) q.push(ni);
        }
      }
    }
    if (visited.size !== seaCells.length) return false;
  }
  // 3. Each numbered cell must be part of an island whose size equals its number,
  //    and no two islands touch orthogonally.
  const islandId = new Array<number>(rows * cols).fill(-1);
  let nextId = 0;
  // Flood-fill unshaded regions
  for (let start = 0; start < rows * cols; start++) {
    if (shaded[start] || islandId[start] !== -1) continue;
    const id = nextId++;
    const q = [start];
    while (q.length) {
      const idx = q.shift()!;
      if (islandId[idx] !== -1) continue;
      islandId[idx] = id;
      const r = Math.floor(idx / cols);
      const c = idx % cols;
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as [number, number][]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          const ni = nr * cols + nc;
          if (!shaded[ni] && islandId[ni] === -1) q.push(ni);
        }
      }
    }
  }
  // Each island must contain exactly one clue cell, and size matches
  const islandClues = new Map<number, { clue: number; size: number }>();
  for (let i = 0; i < rows * cols; i++) {
    const id = islandId[i] ?? -1;
    if (id === -1) continue; // shaded
    if (!islandClues.has(id)) {
      // count island size
      const size = islandId.filter((x) => x === id).length;
      islandClues.set(id, { clue: 0, size });
    }
    const clue = puzzle.clues[i] ?? 0;
    if (clue > 0) {
      const entry = islandClues.get(id)!;
      entry.clue += clue;
    }
  }
  for (const [, { clue, size }] of islandClues) {
    if (clue === 0) return false; // island with no numbered cell
    if (clue !== size) return false;
  }
  return true;
}

export function initialState(seed: number, settings: NurikabeSettings): NurikabeState {
  const rng = mulberry32(seed);
  const puzzles = allPuzzles(settings.difficulty);
  const idx = Math.floor(rng() * puzzles.length);
  const puzzle = puzzles[idx]!;
  return {
    puzzle,
    cells: new Array<CellState>(puzzle.rows * puzzle.cols).fill("unknown"),
    won: false,
    moves: 0,
    rngSeed: seed,
    settings,
  };
}

export function reducer(state: NurikabeState, action: NurikabeAction): NurikabeState {
  if (state.won) return state;
  if (action.type === "toggleCell") {
    const idx = action.idx;
    if (idx < 0 || idx >= state.cells.length) return state;
    // Clue cells can be toggled but visually shown as unshaded — user marks seas
    const cycle: CellState[] = ["unknown", "shaded", "unshaded"];
    const current = state.cells[idx]!;
    const next = cycle[(cycle.indexOf(current) + 1) % cycle.length]!;
    const nextCells = [...state.cells];
    nextCells[idx] = next;
    const won = checkWin(state.puzzle, nextCells);
    return { ...state, cells: nextCells, moves: state.moves + 1, won };
  }
  return state;
}

export function isTerminal(state: NurikabeState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 3) };
}
