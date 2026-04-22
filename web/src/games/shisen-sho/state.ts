import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Shisen-Sho: 12×8 flat grid = 96 tiles = 48 pairs
// 24 distinct tile faces × 4 copies each = 96 tiles

export const SHISEN_FACES: string[] = [
  "🀐","🀑","🀒","🀓","🀔","🀕","🀖","🀗","🀘",
  "🀙","🀚","🀛","🀜","🀝","🀞","🀟","🀠","🀡",
  "🀇","🀈","🀉","🀊","🀋","🀌",
];
// 24 faces × 4 copies = 96 tiles

const COLS = 12;
const ROWS = 8;
const TOTAL = COLS * ROWS; // 96

export interface ShisenShoState {
  grid: (string | null)[]; // length ROWS*COLS, null = empty
  selectedIdx: number | null;
  removed: number;
  total: number;
  won: boolean;
  gameOver: boolean;
  moves: number;
  lastPath: [number, number][] | null; // for animation hints
}

export type ShisenAction =
  | { type: "select"; idx: number }
  | { type: "clear-path" };

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i]!; a[i] = a[j]!; a[j] = tmp;
  }
  return a;
}

function rc(idx: number): [number, number] {
  return [Math.floor(idx / COLS), idx % COLS];
}

function idx(row: number, col: number): number {
  return row * COLS + col;
}

/** Can we travel from (r1,c1) to (r2,c2) in the grid passing only empty cells,
 *  with at most 2 turns? The two endpoints themselves may be occupied (they're the tiles to match).
 *  We treat the grid as having an empty "border" one cell wide around it.
 */
function findPath(
  grid: (string | null)[],
  fromIdx: number,
  toIdx: number,
): [number, number][] | null {
  if (fromIdx === toIdx) return null;
  const [r1, c1] = rc(fromIdx);
  const [r2, c2] = rc(toIdx);

  // Treat grid as extended by 1 cell border (row -1, ROWS, col -1, COLS)
  const minR = -1, maxR = ROWS, minC = -1, maxC = COLS;

  function isEmpty(r: number, c: number): boolean {
    // Border cells are always empty
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return true;
    const i = idx(r, c);
    return grid[i] === null || i === fromIdx || i === toIdx;
  }

  // Try all horizontal/vertical lines through pivot points
  // A path with ≤2 turns has at most 3 segments.
  // Enumerate all possible pivot columns (for H-V-H paths) and pivot rows (for V-H-V paths).

  // 0 turns: direct straight line
  function straightLine(r1: number, c1: number, r2: number, c2: number): [number, number][] | null {
    if (r1 !== r2 && c1 !== c2) return null;
    if (r1 === r2) {
      const minC2 = Math.min(c1, c2), maxC2 = Math.max(c1, c2);
      for (let c = minC2 + 1; c < maxC2; c++) {
        if (!isEmpty(r1, c)) return null;
      }
      return [[r1, minC2], [r1, maxC2]];
    } else {
      const minR2 = Math.min(r1, r2), maxR2 = Math.max(r1, r2);
      for (let r = minR2 + 1; r < maxR2; r++) {
        if (!isEmpty(r, c1)) return null;
      }
      return [[minR2, c1], [maxR2, c1]];
    }
  }

  // Check if a column is clear between two rows (exclusive endpoints)
  function colClear(c: number, rA: number, rB: number): boolean {
    const minR2 = Math.min(rA, rB), maxR2 = Math.max(rA, rB);
    for (let r = minR2 + 1; r < maxR2; r++) {
      if (!isEmpty(r, c)) return false;
    }
    return true;
  }

  // Check if a row is clear between two cols (exclusive endpoints)
  function rowClear(r: number, cA: number, cB: number): boolean {
    const minC2 = Math.min(cA, cB), maxC2 = Math.max(cA, cB);
    for (let c = minC2 + 1; c < maxC2; c++) {
      if (!isEmpty(r, c)) return false;
    }
    return true;
  }

  // 0 turns
  const straight = straightLine(r1, c1, r2, c2);
  if (straight) return [[r1, c1], [r2, c2]];

  // 1 turn: L-shape via pivot (r1, c2) or (r2, c1)
  // Pivot (r1, c2): go right/left from c1 to c2, then up/down from r1 to r2
  if (isEmpty(r1, c2) && rowClear(r1, c1, c2) && colClear(c2, r1, r2)) {
    return [[r1, c1], [r1, c2], [r2, c2]];
  }
  // Pivot (r2, c1): go up/down from r1 to r2, then right/left from c1 to c2
  if (isEmpty(r2, c1) && colClear(c1, r1, r2) && rowClear(r2, c1, c2)) {
    return [[r1, c1], [r2, c1], [r2, c2]];
  }

  // 2 turns: S/Z or U-shape via two pivots
  // Try all pivot rows
  for (let pr = minR; pr <= maxR; pr++) {
    // Path: (r1,c1) -> (r1,c1) via row r1... actually:
    // Segment 1: go vertically from (r1,c1) to (pr,c1)
    // Segment 2: go horizontally from (pr,c1) to (pr,c2)
    // Segment 3: go vertically from (pr,c2) to (r2,c2)
    if (
      isEmpty(pr, c1) &&
      isEmpty(pr, c2) &&
      colClear(c1, r1, pr) &&
      rowClear(pr, c1, c2) &&
      colClear(c2, pr, r2)
    ) {
      return [[r1, c1], [pr, c1], [pr, c2], [r2, c2]];
    }
  }

  // Try all pivot cols
  for (let pc = minC; pc <= maxC; pc++) {
    // Segment 1: go horizontally from (r1,c1) to (r1,pc)
    // Segment 2: go vertically from (r1,pc) to (r2,pc)
    // Segment 3: go horizontally from (r2,pc) to (r2,c2)
    if (
      isEmpty(r1, pc) &&
      isEmpty(r2, pc) &&
      rowClear(r1, c1, pc) &&
      colClear(pc, r1, r2) &&
      rowClear(r2, pc, c2)
    ) {
      return [[r1, c1], [r1, pc], [r2, pc], [r2, c2]];
    }
  }

  return null;
}

export function canConnect(grid: (string | null)[], a: number, b: number): [number, number][] | null {
  if (grid[a] === null || grid[b] === null) return null;
  if (grid[a] !== grid[b]) return null;
  return findPath(grid, a, b);
}

export function hasAnyMove(grid: (string | null)[]): boolean {
  const occupied = grid.map((v, i) => (v !== null ? i : -1)).filter((i) => i >= 0);
  for (let i = 0; i < occupied.length; i++) {
    for (let j = i + 1; j < occupied.length; j++) {
      if (canConnect(grid, occupied[i]!, occupied[j]!)) return true;
    }
  }
  return false;
}

export function initialState(seed: number): ShisenShoState {
  const rng = mulberry32(seed);
  const faces: string[] = [];
  for (const f of SHISEN_FACES) {
    faces.push(f, f, f, f);
  }
  const shuffled = seededShuffle(faces, rng);
  const grid: (string | null)[] = shuffled.slice(0, TOTAL);

  return {
    grid,
    selectedIdx: null,
    removed: 0,
    total: TOTAL,
    won: false,
    gameOver: false,
    moves: 0,
    lastPath: null,
  };
}

export function reducer(state: ShisenShoState, action: ShisenAction): ShisenShoState {
  if (state.won || state.gameOver) return state;

  switch (action.type) {
    case "clear-path":
      return { ...state, lastPath: null };

    case "select": {
      const { idx: _idx } = action as { type: "select"; idx: number };
      const clickedIdx = _idx;
      if (state.grid[clickedIdx] === null) return state;

      // Deselect if clicking same
      if (state.selectedIdx === clickedIdx) {
        return { ...state, selectedIdx: null, lastPath: null };
      }

      if (state.selectedIdx === null) {
        return { ...state, selectedIdx: clickedIdx, lastPath: null };
      }

      // Try to connect
      const path = canConnect(state.grid, state.selectedIdx, clickedIdx);
      if (path) {
        const newGrid = state.grid.slice();
        newGrid[state.selectedIdx] = null;
        newGrid[clickedIdx] = null;
        const newRemoved = state.removed + 2;
        const won = newRemoved === state.total;
        const newState: ShisenShoState = {
          ...state,
          grid: newGrid,
          selectedIdx: null,
          removed: newRemoved,
          won,
          moves: state.moves + 1,
          lastPath: path,
          gameOver: won ? false : !hasAnyMove(newGrid),
        };
        return newState;
      } else if (state.grid[clickedIdx] !== null) {
        // Switch selection
        return { ...state, selectedIdx: clickedIdx, lastPath: null };
      }
      return state;
    }

    default:
      return state;
  }
}

export function isTerminal(state: ShisenShoState): { score: number } | null {
  if (state.won) {
    return { score: Math.max(100, 5000 - state.moves * 30) };
  }
  if (state.gameOver) {
    return { score: Math.floor((state.removed / state.total) * 2000) };
  }
  return null;
}

export const SHISEN_COLS = COLS;
export const SHISEN_ROWS = ROWS;
