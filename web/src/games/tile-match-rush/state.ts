import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Tile Match Rush: timed Shisen-Sho style game with combo multiplier
// Grid sizes: small=8×6(48), medium=10×8(80), large=12×10(120)
// Duration: 60, 120, or 180 seconds

const FACES: string[] = [
  "🀐","🀑","🀒","🀓","🀔","🀕","🀖","🀗","🀘",
  "🀙","🀚","🀛","🀜","🀝","🀞","🀟","🀠","🀡",
  "🀇","🀈","🀉","🀊","🀋","🀌","🀍","🀎","🀏",
  "🀀","🀁","🀂","🀃","🀄","🀅","🀆",
  "🌸","🌺","🍀","🎑","🌿","🍂","🌱","🌙","⭐","🌊",
  "🎵","🎸","🎹","🎺","🎻","🥁","🎷","🎯","🎲","🎮",
];

type GridKey = "small" | "medium" | "large";
const GRID_DIMS: Record<GridKey, { rows: number; cols: number }> = {
  small:  { rows: 6,  cols: 8  },
  medium: { rows: 8,  cols: 10 },
  large:  { rows: 10, cols: 12 },
};

export interface TileMatchRushState {
  settings: { duration: "60" | "120" | "180"; gridSize: "small" | "medium" | "large" };
  rows: number;
  cols: number;
  grid: (string | null)[];
  selectedIdx: number | null;
  removed: number;
  total: number;
  score: number;
  combo: number;
  /** Timestamp (ms) of last match, used to compute combo; -1 if none yet */
  lastMatchTime: number;
  /** Elapsed seconds (updated by tick actions) */
  elapsed: number;
  /** Duration in seconds */
  duration: number;
  won: boolean;
  gameOver: boolean;
}

export type TileMatchRushAction =
  | { type: "select"; idx: number }
  | { type: "tick"; elapsed: number };

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i]!; a[i] = a[j]!; a[j] = tmp;
  }
  return a;
}

function rc(cols: number, i: number): [number, number] {
  return [Math.floor(i / cols), i % cols];
}

function canConnect(
  grid: (string | null)[],
  rows: number,
  cols: number,
  fromIdx: number,
  toIdx: number,
): boolean {
  if (fromIdx === toIdx) return false;
  if (grid[fromIdx] === null || grid[toIdx] === null) return false;
  if (grid[fromIdx] !== grid[toIdx]) return false;

  const [r1, c1] = rc(cols, fromIdx);
  const [r2, c2] = rc(cols, toIdx);
  const minR = -1, maxR = rows, minC = -1, maxC = cols;

  function isEmpty(r: number, c: number): boolean {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return true;
    const i = r * cols + c;
    return grid[i] === null || i === fromIdx || i === toIdx;
  }

  function rowClear(r: number, cA: number, cB: number): boolean {
    const lo = Math.min(cA, cB), hi = Math.max(cA, cB);
    for (let c = lo + 1; c < hi; c++) { if (!isEmpty(r, c)) return false; }
    return true;
  }

  function colClear(c: number, rA: number, rB: number): boolean {
    const lo = Math.min(rA, rB), hi = Math.max(rA, rB);
    for (let r = lo + 1; r < hi; r++) { if (!isEmpty(r, c)) return false; }
    return true;
  }

  // 0 turns
  if (r1 === r2 && rowClear(r1, c1, c2)) return true;
  if (c1 === c2 && colClear(c1, r1, r2)) return true;

  // 1 turn
  if (isEmpty(r1, c2) && rowClear(r1, c1, c2) && colClear(c2, r1, r2)) return true;
  if (isEmpty(r2, c1) && colClear(c1, r1, r2) && rowClear(r2, c1, c2)) return true;

  // 2 turns — pivot row
  for (let pr = minR; pr <= maxR; pr++) {
    if (
      isEmpty(pr, c1) && isEmpty(pr, c2) &&
      colClear(c1, r1, pr) && rowClear(pr, c1, c2) && colClear(c2, pr, r2)
    ) return true;
  }

  // 2 turns — pivot col
  for (let pc = minC; pc <= maxC; pc++) {
    if (
      isEmpty(r1, pc) && isEmpty(r2, pc) &&
      rowClear(r1, c1, pc) && colClear(pc, r1, r2) && rowClear(r2, pc, c2)
    ) return true;
  }

  return false;
}

function hasAnyMove(grid: (string | null)[], rows: number, cols: number): boolean {
  const occ = grid.map((v, i) => (v !== null ? i : -1)).filter((i) => i >= 0);
  for (let i = 0; i < occ.length; i++) {
    for (let j = i + 1; j < occ.length; j++) {
      if (canConnect(grid, rows, cols, occ[i]!, occ[j]!)) return true;
    }
  }
  return false;
}

export function initialState(
  seed: number,
  settings: { duration: "60" | "120" | "180"; gridSize: "small" | "medium" | "large" },
): TileMatchRushState {
  const rng = mulberry32(seed);
  const { rows, cols } = GRID_DIMS[settings.gridSize];
  const total = rows * cols;
  const pairs = total / 2;
  const pairsNeeded = Math.min(pairs, FACES.length);

  const chosen = seededShuffle([...FACES], rng).slice(0, pairsNeeded);
  // If pairs > FACES.length, cycle through faces again
  const faces: string[] = [];
  for (let i = 0; i < pairs; i++) {
    faces.push(chosen[i % chosen.length]!);
  }
  const grid = seededShuffle([...faces, ...faces].slice(0, total), rng) as (string | null)[];

  return {
    settings,
    rows,
    cols,
    grid,
    selectedIdx: null,
    removed: 0,
    total,
    score: 0,
    combo: 0,
    lastMatchTime: -1,
    elapsed: 0,
    duration: parseInt(settings.duration, 10),
    won: false,
    gameOver: false,
  };
}

export function reducer(state: TileMatchRushState, action: TileMatchRushAction): TileMatchRushState {
  if (state.won || state.gameOver) return state;

  switch (action.type) {
    case "tick": {
      const { elapsed } = action;
      if (elapsed >= state.duration) {
        return { ...state, elapsed: state.duration, gameOver: true };
      }
      return { ...state, elapsed };
    }

    case "select": {
      const { idx } = action;
      if (state.grid[idx] === null) return state;

      if (state.selectedIdx === idx) {
        return { ...state, selectedIdx: null };
      }

      if (state.selectedIdx === null) {
        return { ...state, selectedIdx: idx };
      }

      // Try to connect
      const connected = canConnect(state.grid, state.rows, state.cols, state.selectedIdx, idx);
      if (connected) {
        const now = state.elapsed * 1000; // use elapsed as proxy for time
        const timeSinceLast = state.lastMatchTime >= 0 ? now - state.lastMatchTime : Infinity;
        const newCombo = timeSinceLast <= 2000 ? state.combo + 1 : 1;
        const basePoints = 100;
        const earned = basePoints * newCombo;

        const newGrid = state.grid.slice() as (string | null)[];
        newGrid[state.selectedIdx] = null;
        newGrid[idx] = null;
        const newRemoved = state.removed + 2;
        const won = newRemoved === state.total;

        return {
          ...state,
          grid: newGrid,
          selectedIdx: null,
          removed: newRemoved,
          score: state.score + earned,
          combo: newCombo,
          lastMatchTime: now,
          won,
          gameOver: won ? false : !hasAnyMove(newGrid, state.rows, state.cols),
        };
      } else if (state.grid[idx] !== null) {
        return { ...state, selectedIdx: idx };
      }
      return state;
    }

    default:
      return state;
  }
}

export function isTerminal(state: TileMatchRushState): { score: number } | null {
  if (state.won || state.gameOver) return { score: state.score };
  return null;
}

export { canConnect as _canConnect, hasAnyMove as _hasAnyMove };
