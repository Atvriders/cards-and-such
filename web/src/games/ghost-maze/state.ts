// ─── Ghost Maze ───────────────────────────────────────────────────────────────
// Navigate to the exit while a single ghost hunts you through the maze.
// The ghost moves on a tick system. Reach the exit before being caught.

export interface GhostMazeSettings {
  ghostSpeed: "slow" | "medium" | "fast";
}

export type Dir = "up" | "down" | "left" | "right";

export interface GhostMazeState {
  rows: number;
  cols: number;
  hWalls: boolean[];
  vWalls: boolean[];
  playerRow: number;
  playerCol: number;
  ghostRow: number;
  ghostCol: number;
  ghostTicksUntilMove: number;
  ghostSpeed: number; // ticks between ghost moves
  moves: number;
  won: boolean;
  caught: boolean;
}

export type GhostMazeAction =
  | { type: "move"; dir: Dir }
  | { type: "tick" };

// ─── RNG ──────────────────────────────────────────────────────────────────────
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

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

const SPEED_MAP: Record<string, number> = { slow: 4, medium: 2, fast: 1 };

export function initialState(seed: number, settings: GhostMazeSettings): GhostMazeState {
  const rows = 11;
  const cols = 11;
  const { hWalls, vWalls } = generateMaze(rows, cols, seed);
  const ghostSpeed = SPEED_MAP[settings.ghostSpeed] ?? 2;
  return {
    rows, cols, hWalls, vWalls,
    playerRow: 0, playerCol: 0,
    ghostRow: rows - 1, ghostCol: cols - 1,
    ghostTicksUntilMove: ghostSpeed,
    ghostSpeed,
    moves: 0, won: false, caught: false,
  };
}

function canPassWall(state: GhostMazeState, r: number, c: number, dir: Dir): boolean {
  const { rows, cols, hWalls, vWalls } = state;
  const idx = (row: number, col: number) => row * cols + col;
  if (dir === "up") return r > 0 && !hWalls[idx(r - 1, c)];
  if (dir === "down") return r < rows - 1 && !hWalls[idx(r, c)];
  if (dir === "left") return c > 0 && !vWalls[idx(r, c - 1)];
  if (dir === "right") return c < cols - 1 && !vWalls[idx(r, c)];
  return false;
}

// Ghost AI: BFS-like greedy (move toward player using manhattan distance)
function moveGhost(state: GhostMazeState, rngSeed: number): { row: number; col: number; nextSeed: number } {
  const { ghostRow: gr, ghostCol: gc, playerRow: pr, playerCol: pc } = state;
  const allDirs: Dir[] = ["up", "down", "left", "right"];
  const open = allDirs.filter((d) => canPassWall(state, gr, gc, d));
  if (open.length === 0) return { row: gr, col: gc, nextSeed: rngSeed };

  // Pick best direction by manhattan distance to player, with slight random
  const rand = ((rngSeed * 1664525 + 1013904223) >>> 0) / 0xffffffff;
  const nextSeed = (rngSeed * 1664525 + 1013904223) >>> 0;

  open.sort((a, b) => {
    const ad = (a === "up" ? -1 : a === "down" ? 1 : 0);
    const ac = (a === "left" ? -1 : a === "right" ? 1 : 0);
    const bd = (b === "up" ? -1 : b === "down" ? 1 : 0);
    const bc = (b === "left" ? -1 : b === "right" ? 1 : 0);
    const distA = Math.abs(gr + ad - pr) + Math.abs(gc + ac - pc);
    const distB = Math.abs(gr + bd - pr) + Math.abs(gc + bc - pc);
    return distA - distB;
  });

  const chosen = rand < 0.15 && open.length > 1 ? open[1]! : open[0]!;
  const dr = chosen === "up" ? -1 : chosen === "down" ? 1 : 0;
  const dc = chosen === "left" ? -1 : chosen === "right" ? 1 : 0;
  return { row: gr + dr, col: gc + dc, nextSeed };
}

export function reducer(state: GhostMazeState, action: GhostMazeAction): GhostMazeState {
  if (state.won || state.caught) return state;

  if (action.type === "move") {
    if (!canPassWall(state, state.playerRow, state.playerCol, action.dir)) return state;
    const dr = action.dir === "up" ? -1 : action.dir === "down" ? 1 : 0;
    const dc = action.dir === "left" ? -1 : action.dir === "right" ? 1 : 0;
    const pr = state.playerRow + dr;
    const pc = state.playerCol + dc;
    const won = pr === state.rows - 1 && pc === state.cols - 1;
    const caught = !won && pr === state.ghostRow && pc === state.ghostCol;
    return { ...state, playerRow: pr, playerCol: pc, moves: state.moves + 1, won, caught };
  }

  if (action.type === "tick") {
    let ticks = state.ghostTicksUntilMove - 1;
    let gr = state.ghostRow;
    let gc = state.ghostCol;
    const ghostSeed = 0xabcdef ^ (state.moves * 7 + gr * 31 + gc);

    if (ticks <= 0) {
      const { row, col } = moveGhost(state, ghostSeed);
      gr = row;
      gc = col;
      ticks = state.ghostSpeed;
    }

    const caught = gr === state.playerRow && gc === state.playerCol;
    return { ...state, ghostRow: gr, ghostCol: gc, ghostTicksUntilMove: ticks, caught };
  }

  return state;
}

export function isTerminal(state: GhostMazeState): { score: number } | null {
  if (state.won) return { score: Math.max(100, 2000 - state.moves * 5) };
  if (state.caught) return { score: Math.max(0, state.moves * 2) };
  return null;
}
