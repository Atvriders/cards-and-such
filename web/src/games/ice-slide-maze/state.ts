// ─── Ice Slide Maze ───────────────────────────────────────────────────────────
// The floor is ice — when you move, you slide until you hit a wall.
// Navigate from start to the exit.

export interface IceSlideMazeSettings {
  size: "small" | "medium";
}

export type Dir = "up" | "down" | "left" | "right";

export interface IceSlideMazeState {
  rows: number;
  cols: number;
  /** true = wall cell (can't enter) */
  walls: boolean[];
  playerRow: number;
  playerCol: number;
  exitRow: number;
  exitCol: number;
  moves: number;
  won: boolean;
}

export type IceSlideMazeAction = { type: "move"; dir: Dir };

// ─── RNG ──────────────────────────────────────────────────────────────────────
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

// ─── Grid-based maze (walls as cells, not edges) ──────────────────────────────
// Uses a grid where odd cells are corridors and even cells can be walls.
function generateGrid(rows: number, cols: number, seed: number): boolean[] {
  const rng = mulberry32(seed);
  // rows and cols should be odd for clean grid-maze
  const walls = new Array(rows * cols).fill(true);

  function idx(r: number, c: number) { return r * cols + c; }

  function carve(r: number, c: number) {
    walls[idx(r, c)] = false;
    const dirs: [number, number][] = [[0, 2], [0, -2], [2, 0], [-2, 0]];
    // shuffle
    for (let i = dirs.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [dirs[i], dirs[j]] = [dirs[j]!, dirs[i]!];
    }
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (!walls[idx(nr, nc)]) continue;
      walls[idx(r + dr / 2, c + dc / 2)] = false;
      carve(nr, nc);
    }
  }

  carve(1, 1);
  return walls;
}

export function initialState(seed: number, settings: IceSlideMazeSettings): IceSlideMazeState {
  const dim = settings.size === "small" ? 11 : 15;
  // must be odd
  const rows = dim % 2 === 0 ? dim + 1 : dim;
  const cols = rows;
  const walls = generateGrid(rows, cols, seed);

  return {
    rows, cols, walls,
    playerRow: 1, playerCol: 1,
    exitRow: rows - 2, exitCol: cols - 2,
    moves: 0, won: false,
  };
}

// ─── Slide: move until hitting a wall ────────────────────────────────────────
export function slide(state: IceSlideMazeState, dir: Dir): { row: number; col: number } {
  let r = state.playerRow;
  let c = state.playerCol;
  const { rows, cols, walls } = state;
  const idx = (row: number, col: number) => row * cols + col;
  const dr = dir === "up" ? -1 : dir === "down" ? 1 : 0;
  const dc = dir === "left" ? -1 : dir === "right" ? 1 : 0;

  while (true) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) break;
    if (walls[idx(nr, nc)]) break;
    r = nr;
    c = nc;
  }
  return { row: r, col: c };
}

export function reducer(state: IceSlideMazeState, action: IceSlideMazeAction): IceSlideMazeState {
  if (state.won) return state;
  if (action.type === "move") {
    const { row: nr, col: nc } = slide(state, action.dir);
    // Did not move
    if (nr === state.playerRow && nc === state.playerCol) return state;
    const won = nr === state.exitRow && nc === state.exitCol;
    return { ...state, playerRow: nr, playerCol: nc, moves: state.moves + 1, won };
  }
  return state;
}

export function isTerminal(state: IceSlideMazeState): { score: number } | null {
  if (state.won) {
    const score = Math.max(100, 1200 - state.moves * 10);
    return { score };
  }
  return null;
}
