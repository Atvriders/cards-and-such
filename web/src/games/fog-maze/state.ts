// ─── Fog Maze ─────────────────────────────────────────────────────────────────
// Navigate a procedural maze that's hidden by fog. Only nearby cells are
// revealed. Reach the exit marked E.

export interface FogMazeSettings {
  size: "small" | "large";
  visibility: "near" | "far";
}

export type Dir = "up" | "down" | "left" | "right";

export interface FogMazeState {
  rows: number;
  cols: number;
  hWalls: boolean[];
  vWalls: boolean[];
  visited: boolean[]; // cells the player has seen
  playerRow: number;
  playerCol: number;
  moves: number;
  won: boolean;
  visRadius: number;
}

export type FogMazeAction = { type: "move"; dir: Dir };

// ─── RNG ──────────────────────────────────────────────────────────────────────
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

// ─── Maze generation ──────────────────────────────────────────────────────────
function generateMaze(rows: number, cols: number, seed: number) {
  const rng = mulberry32(seed);
  const visited = new Array(rows * cols).fill(false);
  const hWalls = new Array(rows * cols).fill(true);
  const vWalls = new Array(rows * cols).fill(true);

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

function computeVisible(rows: number, cols: number, pr: number, pc: number, radius: number): boolean[] {
  const vis = new Array(rows * cols).fill(false);
  for (let r = Math.max(0, pr - radius); r <= Math.min(rows - 1, pr + radius); r++) {
    for (let c = Math.max(0, pc - radius); c <= Math.min(cols - 1, pc + radius); c++) {
      if (Math.abs(r - pr) + Math.abs(c - pc) <= radius + 1) {
        vis[r * cols + c] = true;
      }
    }
  }
  return vis;
}

export function initialState(seed: number, settings: FogMazeSettings): FogMazeState {
  const dim = settings.size === "small" ? 11 : 15;
  const rows = dim;
  const cols = dim;
  const visRadius = settings.visibility === "near" ? 2 : 3;
  const { hWalls, vWalls } = generateMaze(rows, cols, seed);
  const visNow = computeVisible(rows, cols, 0, 0, visRadius);
  return {
    rows, cols, hWalls, vWalls,
    visited: visNow,
    playerRow: 0, playerCol: 0,
    moves: 0, won: false, visRadius,
  };
}

function canMove(state: FogMazeState, dir: Dir): boolean {
  const { playerRow: r, playerCol: c, rows, cols, hWalls, vWalls } = state;
  const idx = (row: number, col: number) => row * cols + col;
  if (dir === "up") return r > 0 && !hWalls[idx(r - 1, c)];
  if (dir === "down") return r < rows - 1 && !hWalls[idx(r, c)];
  if (dir === "left") return c > 0 && !vWalls[idx(r, c - 1)];
  if (dir === "right") return c < cols - 1 && !vWalls[idx(r, c)];
  return false;
}

export function reducer(state: FogMazeState, action: FogMazeAction): FogMazeState {
  if (state.won) return state;
  if (action.type === "move") {
    if (!canMove(state, action.dir)) return state;
    const dr = action.dir === "up" ? -1 : action.dir === "down" ? 1 : 0;
    const dc = action.dir === "left" ? -1 : action.dir === "right" ? 1 : 0;
    const nr = state.playerRow + dr;
    const nc = state.playerCol + dc;
    const won = nr === state.rows - 1 && nc === state.cols - 1;
    const newVis = computeVisible(state.rows, state.cols, nr, nc, state.visRadius);
    const visited = state.visited.map((v, i) => v || (newVis[i] ?? false));
    return { ...state, playerRow: nr, playerCol: nc, moves: state.moves + 1, won, visited };
  }
  return state;
}

export function isTerminal(state: FogMazeState): { score: number } | null {
  if (state.won) {
    const score = Math.max(100, 1500 - state.moves * 3);
    return { score };
  }
  return null;
}
