// ─── Classic Maze ─────────────────────────────────────────────────────────────
// Procedurally generated maze using recursive backtracker (DFS). Navigate from
// top-left to bottom-right.

export interface ClassicMazeSettings {
  size: "small" | "medium" | "large";
}

export type Dir = "up" | "down" | "left" | "right";

export interface ClassicMazeState {
  rows: number;
  cols: number;
  /** Flat array: true = wall, false = open */
  hWalls: boolean[]; // horizontal walls: hWalls[r*cols+c] = wall below cell (r,c)
  vWalls: boolean[]; // vertical walls:   vWalls[r*cols+c] = wall right of cell (r,c)
  playerRow: number;
  playerCol: number;
  moves: number;
  won: boolean;
}

export type ClassicMazeAction = { type: "move"; dir: Dir };

// ─── RNG ──────────────────────────────────────────────────────────────────────
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

// ─── Maze generation (recursive backtracker) ─────────────────────────────────
function generateMaze(rows: number, cols: number, seed: number) {
  const rng = mulberry32(seed);
  const visited = new Array(rows * cols).fill(false);
  // All walls start closed
  const hWalls = new Array(rows * cols).fill(true); // below
  const vWalls = new Array(rows * cols).fill(true); // right

  function idx(r: number, c: number) { return r * cols + c; }

  function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j]!, arr[i]!];
    }
    return arr;
  }

  function carve(r: number, c: number) {
    visited[idx(r, c)] = true;
    const dirs: Dir[] = shuffle(["up", "down", "left", "right"]);
    for (const d of dirs) {
      const nr = d === "up" ? r - 1 : d === "down" ? r + 1 : r;
      const nc = d === "left" ? c - 1 : d === "right" ? c + 1 : c;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (visited[idx(nr, nc)]) continue;
      // Remove wall between (r,c) and (nr,nc)
      if (d === "down") hWalls[idx(r, c)] = false;
      else if (d === "up") hWalls[idx(nr, nc)] = false;
      else if (d === "right") vWalls[idx(r, c)] = false;
      else if (d === "left") vWalls[idx(nr, nc)] = false;
      carve(nr, nc);
    }
  }

  carve(0, 0);
  return { hWalls, vWalls };
}

// ─── Initial state ────────────────────────────────────────────────────────────
export function initialState(seed: number, settings: ClassicMazeSettings): ClassicMazeState {
  const sizeMap = { small: 9, medium: 13, large: 17 };
  const dim = sizeMap[settings.size];
  const rows = dim;
  const cols = dim;
  const { hWalls, vWalls } = generateMaze(rows, cols, seed);
  return {
    rows,
    cols,
    hWalls,
    vWalls,
    playerRow: 0,
    playerCol: 0,
    moves: 0,
    won: false,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function canMove(state: ClassicMazeState, dir: Dir): boolean {
  const { playerRow: r, playerCol: c, rows, cols, hWalls, vWalls } = state;
  const idx = (row: number, col: number) => row * cols + col;
  if (dir === "up") return r > 0 && !hWalls[idx(r - 1, c)];
  if (dir === "down") return r < rows - 1 && !hWalls[idx(r, c)];
  if (dir === "left") return c > 0 && !vWalls[idx(r, c - 1)];
  if (dir === "right") return c < cols - 1 && !vWalls[idx(r, c)];
  return false;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function reducer(state: ClassicMazeState, action: ClassicMazeAction): ClassicMazeState {
  if (state.won) return state;
  if (action.type === "move") {
    if (!canMove(state, action.dir)) return state;
    const dr = action.dir === "up" ? -1 : action.dir === "down" ? 1 : 0;
    const dc = action.dir === "left" ? -1 : action.dir === "right" ? 1 : 0;
    const nr = state.playerRow + dr;
    const nc = state.playerCol + dc;
    const won = nr === state.rows - 1 && nc === state.cols - 1;
    return { ...state, playerRow: nr, playerCol: nc, moves: state.moves + 1, won };
  }
  return state;
}

export function isTerminal(state: ClassicMazeState): { score: number } | null {
  if (state.won) {
    // Score based on efficiency: fewer moves = higher score
    const maxMoves = state.rows * state.cols * 2;
    const score = Math.max(100, 1000 - state.moves * 2 + (maxMoves - state.moves));
    return { score };
  }
  return null;
}
