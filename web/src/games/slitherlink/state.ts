import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// A Slitherlink puzzle: dots at grid intersections, numbers in cells.
// A cols×rows grid of cells has (cols+1)×(rows+1) dots.
// Horizontal edges: rows+1 rows of cols edges each.
// Vertical edges: rows rows of cols+1 edges each.
// hEdges[r][c] = edge between dot(r,c) and dot(r,c+1)
// vEdges[r][c] = edge between dot(r,c) and dot(r+1,c)

export interface SlitherlinkPuzzle {
  rows: number;
  cols: number;
  /** clues[r*cols+c], null = no clue */
  clues: (0 | 1 | 2 | 3 | null)[];
  /** solution: hEdges length = (rows+1)*cols, vEdges length = rows*(cols+1) */
  solutionH: boolean[];
  solutionV: boolean[];
}

export interface SlitherlinkSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface SlitherlinkState {
  puzzle: SlitherlinkPuzzle;
  /** Player's edge toggles: hEdges and vEdges same shape as solution */
  hEdges: boolean[];
  vEdges: boolean[];
  won: boolean;
  moves: number;
  rngSeed: number;
  settings: SlitherlinkSettings;
}

export type SlitherlinkAction =
  | { type: "toggleH"; idx: number }
  | { type: "toggleV"; idx: number };

// ---------- Pre-designed puzzles ----------
// Easy 5×5 puzzles — verified valid loop: rectangle (r1=1,c1=1) to (r2=4,c2=4)
const EASY_PUZZLES: SlitherlinkPuzzle[] = [
  {
    rows: 5, cols: 5,
    clues: [
      null, 1, 1, 1, null,
      1, 2, 1, 2, 1,
      1, 1, null, 1, 1,
      1, 2, 1, 2, 1,
      null, 1, 1, 1, null,
    ],
    solutionH: [
      false, false, false, false, false,
      false, true,  true,  true,  false,
      false, false, false, false, false,
      false, false, false, false, false,
      false, true,  true,  true,  false,
      false, false, false, false, false,
    ],
    solutionV: [
      false, false, false, false, false, false,
      false, true,  false, false, true,  false,
      false, true,  false, false, true,  false,
      false, true,  false, false, true,  false,
      false, false, false, false, false, false,
    ],
  },
];

// Medium 6×6 — verified valid loop: rectangle (r1=1,c1=1) to (r2=5,c2=5)
const MEDIUM_PUZZLES: SlitherlinkPuzzle[] = [
  {
    rows: 6, cols: 6,
    clues: [
      null, 1, 1, 1, 1, null,
      1, 2, 1, 1, 2, 1,
      1, 1, null, null, 1, 1,
      1, 1, null, null, 1, 1,
      1, 2, 1, 1, 2, 1,
      null, 1, 1, 1, 1, null,
    ],
    solutionH: [
      false, false, false, false, false, false,
      false, true,  true,  true,  true,  false,
      false, false, false, false, false, false,
      false, false, false, false, false, false,
      false, false, false, false, false, false,
      false, true,  true,  true,  true,  false,
      false, false, false, false, false, false,
    ],
    solutionV: [
      false, false, false, false, false, false, false,
      false, true,  false, false, false, true,  false,
      false, true,  false, false, false, true,  false,
      false, true,  false, false, false, true,  false,
      false, true,  false, false, false, true,  false,
      false, false, false, false, false, false, false,
    ],
  },
];

// Hard 7×7 — verified valid loop: outer border rectangle (r1=0,c1=0) to (r2=7,c2=7)
const HARD_PUZZLES: SlitherlinkPuzzle[] = [
  {
    rows: 7, cols: 7,
    clues: [
      2, 1, 1, 1, 1, 1, 2,
      1, null, null, null, null, null, 1,
      1, null, null, null, null, null, 1,
      1, null, null, null, null, null, 1,
      1, null, null, null, null, null, 1,
      1, null, null, null, null, null, 1,
      2, 1, 1, 1, 1, 1, 2,
    ],
    solutionH: [
      true,  true,  true,  true,  true,  true,  true,
      false, false, false, false, false, false, false,
      false, false, false, false, false, false, false,
      false, false, false, false, false, false, false,
      false, false, false, false, false, false, false,
      false, false, false, false, false, false, false,
      false, false, false, false, false, false, false,
      true,  true,  true,  true,  true,  true,  true,
    ],
    solutionV: [
      true,  false, false, false, false, false, false, true,
      true,  false, false, false, false, false, false, true,
      true,  false, false, false, false, false, false, true,
      true,  false, false, false, false, false, false, true,
      true,  false, false, false, false, false, false, true,
      true,  false, false, false, false, false, false, true,
      true,  false, false, false, false, false, false, true,
    ],
  },
];

function allPuzzles(difficulty: string): SlitherlinkPuzzle[] {
  if (difficulty === "hard") return HARD_PUZZLES;
  if (difficulty === "medium") return MEDIUM_PUZZLES;
  return EASY_PUZZLES;
}

function checkWin(puzzle: SlitherlinkPuzzle, hEdges: boolean[], vEdges: boolean[]): boolean {
  const { rows, cols } = puzzle;
  // Check all clues satisfied
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const clue = puzzle.clues[r * cols + c];
      if (clue === null) continue;
      let count = 0;
      // top h edge
      if (hEdges[r * cols + c]) count++;
      // bottom h edge
      if (hEdges[(r + 1) * cols + c]) count++;
      // left v edge
      if (vEdges[r * (cols + 1) + c]) count++;
      // right v edge
      if (vEdges[r * (cols + 1) + c + 1]) count++;
      if (count !== clue) return false;
    }
  }
  // Check it forms a single closed loop (all used edges have degree 2, connected)
  const degree = new Array((rows + 1) * (cols + 1)).fill(0);
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (hEdges[r * cols + c]) {
        degree[r * (cols + 1) + c]++;
        degree[r * (cols + 1) + c + 1]++;
      }
    }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c <= cols; c++) {
      if (vEdges[r * (cols + 1) + c]) {
        degree[r * (cols + 1) + c]++;
        degree[(r + 1) * (cols + 1) + c]++;
      }
    }
  }
  // Every used dot must have degree exactly 2; unused dots degree 0
  for (let i = 0; i < degree.length; i++) {
    if (degree[i] !== 0 && degree[i] !== 2) return false;
  }
  // Must have at least one edge
  if (!hEdges.some(Boolean) && !vEdges.some(Boolean)) return false;
  // Connectivity check: BFS from first active edge's dot
  const startDot = (() => {
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (hEdges[r * cols + c]) return r * (cols + 1) + c;
      }
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c <= cols; c++) {
        if (vEdges[r * (cols + 1) + c]) return r * (cols + 1) + c;
      }
    }
    return -1;
  })();
  if (startDot < 0) return false;
  const visited = new Set<number>();
  const queue = [startDot];
  while (queue.length > 0) {
    const dot = queue.shift()!;
    if (visited.has(dot)) continue;
    visited.add(dot);
    const dr = Math.floor(dot / (cols + 1));
    const dc = dot % (cols + 1);
    // right h edge
    if (dc < cols && hEdges[dr * cols + dc] && !visited.has(dr * (cols + 1) + dc + 1))
      queue.push(dr * (cols + 1) + dc + 1);
    // left h edge
    if (dc > 0 && hEdges[dr * cols + dc - 1] && !visited.has(dr * (cols + 1) + dc - 1))
      queue.push(dr * (cols + 1) + dc - 1);
    // down v edge
    if (dr < rows && vEdges[dr * (cols + 1) + dc] && !visited.has((dr + 1) * (cols + 1) + dc))
      queue.push((dr + 1) * (cols + 1) + dc);
    // up v edge
    if (dr > 0 && vEdges[(dr - 1) * (cols + 1) + dc] && !visited.has((dr - 1) * (cols + 1) + dc))
      queue.push((dr - 1) * (cols + 1) + dc);
  }
  // All dots with degree>0 must be visited
  for (let i = 0; i < degree.length; i++) {
    if (degree[i] > 0 && !visited.has(i)) return false;
  }
  return true;
}

export function initialState(seed: number, settings: SlitherlinkSettings): SlitherlinkState {
  const rng = mulberry32(seed);
  const puzzles = allPuzzles(settings.difficulty);
  const idx = Math.floor(rng() * puzzles.length);
  const puzzle = puzzles[idx]!;
  const hEdges = new Array<boolean>(puzzle.solutionH.length).fill(false);
  const vEdges = new Array<boolean>(puzzle.solutionV.length).fill(false);
  return {
    puzzle,
    hEdges,
    vEdges,
    won: false,
    moves: 0,
    rngSeed: seed,
    settings,
  };
}

export function reducer(state: SlitherlinkState, action: SlitherlinkAction): SlitherlinkState {
  if (state.won) return state;
  if (action.type === "toggleH") {
    const idx = action.idx;
    if (idx < 0 || idx >= state.hEdges.length) return state;
    const next = [...state.hEdges];
    next[idx] = !next[idx];
    const won = checkWin(state.puzzle, next, state.vEdges);
    return { ...state, hEdges: next, moves: state.moves + 1, won };
  }
  if (action.type === "toggleV") {
    const idx = action.idx;
    if (idx < 0 || idx >= state.vEdges.length) return state;
    const next = [...state.vEdges];
    next[idx] = !next[idx];
    const won = checkWin(state.puzzle, state.hEdges, next);
    return { ...state, vEdges: next, moves: state.moves + 1, won };
  }
  return state;
}

export function isTerminal(state: SlitherlinkState): { score: number } | null {
  if (!state.won) return null;
  const score = Math.max(100, 1000 - state.moves * 5);
  return { score };
}
