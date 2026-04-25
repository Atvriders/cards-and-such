// ─── Gravity Maze ─────────────────────────────────────────────────────────────
// Navigate a pre-built grid maze where gravity can be rotated 90° with a button.
// The ball "falls" toward the current gravity direction.

export interface GravityMazeSettings {
  puzzle: "1" | "2" | "3" | "4" | "5";
}

export type Dir = "down" | "up" | "left" | "right";

export interface GravityMazeState {
  rows: number;
  cols: number;
  /** true = wall cell */
  walls: boolean[];
  playerRow: number;
  playerCol: number;
  exitRow: number;
  exitCol: number;
  gravity: Dir;
  moves: number;
  won: boolean;
  puzzleIndex: number;
}

export type GravityMazeAction =
  | { type: "rotate-cw" }
  | { type: "rotate-ccw" }
  | { type: "fall" };

// ─── Puzzles ──────────────────────────────────────────────────────────────────
// Grid: '#' = wall, '.' = open, 'S' = start, 'E' = exit
interface PuzzleDef {
  grid: string[];
  rows: number;
  cols: number;
}

const PUZZLES: PuzzleDef[] = [
  {
    rows: 6, cols: 6,
    grid: [
      "######",
      "#S...#",
      "#.##.#",
      "#....#",
      "#.##E#",
      "######",
    ],
  },
  {
    rows: 7, cols: 7,
    grid: [
      "#######",
      "#S....#",
      "#.###.#",
      "#.#...#",
      "#...#.#",
      "#.###E#",
      "#######",
    ],
  },
  {
    rows: 7, cols: 8,
    grid: [
      "########",
      "#S.....#",
      "#.####.#",
      "#......#",
      "#.####.#",
      "#.....E#",
      "########",
    ],
  },
  {
    rows: 8, cols: 8,
    grid: [
      "########",
      "#S.....#",
      "#.####.#",
      "#......#",
      "#####..#",
      "#......#",
      "#.###.E#",
      "########",
    ],
  },
  {
    rows: 8, cols: 9,
    grid: [
      "#########",
      "#S......#",
      "#.#####.#",
      "#.......#",
      "#.#####.#",
      "#.......#",
      "#####..E#",
      "#########",
    ],
  },
];

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

export function initialState(seed: number, settings: GravityMazeSettings): GravityMazeState {
  const puzzleIndex = parseInt(settings.puzzle, 10) - 1;
  const def = PUZZLES[puzzleIndex % PUZZLES.length]!;
  const { rows, cols, grid } = def;
  const walls: boolean[] = [];
  let playerRow = 1, playerCol = 1, exitRow = rows - 2, exitCol = cols - 2;

  for (let r = 0; r < rows; r++) {
    const row = grid[r]!;
    for (let c = 0; c < cols; c++) {
      const ch = row[c] ?? "#";
      walls.push(ch === "#");
      if (ch === "S") { playerRow = r; playerCol = c; }
      if (ch === "E") { exitRow = r; exitCol = c; }
    }
  }

  return {
    rows, cols, walls,
    playerRow, playerCol,
    exitRow, exitCol,
    gravity: "down",
    moves: 0, won: false,
    puzzleIndex,
  };
}

function rotateCW(dir: Dir): Dir {
  const map: Record<Dir, Dir> = { down: "left", left: "up", up: "right", right: "down" };
  return map[dir];
}
function rotateCCW(dir: Dir): Dir {
  const map: Record<Dir, Dir> = { down: "right", right: "up", up: "left", left: "down" };
  return map[dir];
}

function fallStep(rows: number, cols: number, walls: boolean[], r: number, c: number, gravity: Dir): { row: number; col: number } {
  const idx = (rr: number, cc: number) => rr * cols + cc;
  const dr = gravity === "down" ? 1 : gravity === "up" ? -1 : 0;
  const dc = gravity === "left" ? -1 : gravity === "right" ? 1 : 0;
  const nr = r + dr;
  const nc = c + dc;
  if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return { row: r, col: c };
  if (walls[idx(nr, nc)]) return { row: r, col: c };
  return { row: nr, col: nc };
}

export function applyGravity(state: GravityMazeState): { row: number; col: number } {
  let { playerRow: r, playerCol: c } = state;
  const { rows, cols, walls, gravity } = state;
  while (true) {
    const next = fallStep(rows, cols, walls, r, c, gravity);
    if (next.row === r && next.col === c) break;
    r = next.row;
    c = next.col;
  }
  return { row: r, col: c };
}

export function reducer(state: GravityMazeState, action: GravityMazeAction): GravityMazeState {
  if (state.won) return state;

  if (action.type === "rotate-cw" || action.type === "rotate-ccw") {
    const gravity = action.type === "rotate-cw" ? rotateCW(state.gravity) : rotateCCW(state.gravity);
    const newState = { ...state, gravity, moves: state.moves + 1 };
    const { row: pr, col: pc } = applyGravity(newState);
    const won = pr === state.exitRow && pc === state.exitCol;
    return { ...newState, playerRow: pr, playerCol: pc, won };
  }

  if (action.type === "fall") {
    const { row: pr, col: pc } = applyGravity(state);
    if (pr === state.playerRow && pc === state.playerCol) return state;
    const won = pr === state.exitRow && pc === state.exitCol;
    return { ...state, playerRow: pr, playerCol: pc, won };
  }

  return state;
}

export function isTerminal(state: GravityMazeState): { score: number } | null {
  if (state.won) {
    return { score: Math.max(100, 1000 - state.moves * 20) };
  }
  return null;
}
