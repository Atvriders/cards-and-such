// ─── Tetris-like state ────────────────────────────────────────────────────────
// 10×20 grid. 7 tetrominoes. Pure reducer.

export const COLS = 10;
export const ROWS = 20;

export type CellColor = string | null;

// Grid is row-major: grid[row][col]
export type Grid = readonly (readonly CellColor[])[];

export interface Piece {
  type: TetrominoType;
  row: number;
  col: number;
  rotation: number; // 0-3
}

export type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "L" | "J";

export interface TetrisSettings {
  startLevel: "0" | "5" | "10";
}

export interface TetrisState {
  settings: TetrisSettings;
  grid: Grid;
  current: Piece;
  next: TetrominoType;
  score: number;
  lines: number;
  level: number;
  over: boolean;
  rngSeed: number;
}

export type TetrisAction =
  | { type: "tick" }
  | { type: "left" }
  | { type: "right" }
  | { type: "rotate" }
  | { type: "hard-drop" }
  | { type: "soft-drop" };

// ─── Tetrominoes ──────────────────────────────────────────────────────────────
// Each rotation is a list of [row, col] offsets from pivot.
const TETROMINOS: Record<TetrominoType, { rotations: [number, number][][]; color: string }> = {
  I: {
    color: "#00cfcf",
    rotations: [
      [[0,-1],[0,0],[0,1],[0,2]],
      [[-1,0],[0,0],[1,0],[2,0]],
      [[0,-1],[0,0],[0,1],[0,2]],
      [[-1,0],[0,0],[1,0],[2,0]],
    ],
  },
  O: {
    color: "#cfcf00",
    rotations: [
      [[0,0],[0,1],[1,0],[1,1]],
      [[0,0],[0,1],[1,0],[1,1]],
      [[0,0],[0,1],[1,0],[1,1]],
      [[0,0],[0,1],[1,0],[1,1]],
    ],
  },
  T: {
    color: "#9f00cf",
    rotations: [
      [[0,-1],[0,0],[0,1],[-1,0]],
      [[-1,0],[0,0],[1,0],[0,1]],
      [[0,-1],[0,0],[0,1],[1,0]],
      [[-1,0],[0,0],[1,0],[0,-1]],
    ],
  },
  S: {
    color: "#00cf00",
    rotations: [
      [[0,-1],[0,0],[-1,0],[-1,1]],
      [[-1,0],[0,0],[0,1],[1,1]],
      [[0,-1],[0,0],[-1,0],[-1,1]],
      [[-1,0],[0,0],[0,1],[1,1]],
    ],
  },
  Z: {
    color: "#cf0000",
    rotations: [
      [[-1,-1],[-1,0],[0,0],[0,1]],
      [[1,0],[0,0],[0,1],[-1,1]],
      [[-1,-1],[-1,0],[0,0],[0,1]],
      [[1,0],[0,0],[0,1],[-1,1]],
    ],
  },
  L: {
    color: "#cf7f00",
    rotations: [
      [[0,-1],[0,0],[0,1],[-1,1]],
      [[-1,0],[0,0],[1,0],[1,1]],
      [[0,-1],[0,0],[0,1],[1,-1]],
      [[-1,0],[0,0],[1,0],[-1,-1]],
    ],
  },
  J: {
    color: "#0000cf",
    rotations: [
      [[0,-1],[0,0],[0,1],[-1,-1]],
      [[-1,0],[0,0],[1,0],[-1,1]],
      [[0,-1],[0,0],[0,1],[1,1]],
      [[-1,0],[0,0],[1,0],[1,-1]],
    ],
  },
};

export function getCells(piece: Piece): [number, number][] {
  const tetro = TETROMINOS[piece.type];
  const rot = tetro.rotations[piece.rotation % 4]!;
  return rot.map(([dr, dc]) => [piece.row + dr, piece.col + dc]);
}

export function getColor(type: TetrominoType): string {
  return TETROMINOS[type].color;
}

// ─── RNG (simple LCG) ─────────────────────────────────────────────────────────
function lcg(seed: number): number {
  return (seed * 1664525 + 1013904223) & 0x7fffffff;
}

const ALL_TYPES: TetrominoType[] = ["I", "O", "T", "S", "Z", "L", "J"];

function randomType(seed: number): { type: TetrominoType; nextSeed: number } {
  const nextSeed = lcg(seed);
  const idx = nextSeed % ALL_TYPES.length;
  return { type: ALL_TYPES[idx]!, nextSeed };
}

// ─── Grid helpers ─────────────────────────────────────────────────────────────
function emptyGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function isValidPosition(grid: Grid, piece: Piece): boolean {
  for (const [r, c] of getCells(piece)) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
    if (grid[r]![c] !== null) return false;
  }
  return true;
}

function lockPiece(grid: Grid, piece: Piece): Grid {
  const color = getColor(piece.type);
  const newGrid = grid.map((row) => [...row]) as CellColor[][];
  for (const [r, c] of getCells(piece)) {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
      newGrid[r]![c] = color;
    }
  }
  return newGrid;
}

const ROW_SCORES = [0, 100, 300, 500, 800];

function clearLines(grid: Grid): { newGrid: Grid; linesCleared: number } {
  const kept = (grid as CellColor[][]).filter((row) => row.some((c) => c === null));
  const linesCleared = ROWS - kept.length;
  const emptyRows = Array.from({ length: linesCleared }, () => Array(COLS).fill(null) as CellColor[]);
  return { newGrid: [...emptyRows, ...kept], linesCleared };
}

function spawnPiece(type: TetrominoType): Piece {
  return { type, row: 1, col: Math.floor(COLS / 2), rotation: 0 };
}

export function levelFromLines(startLevel: number, totalLines: number): number {
  return startLevel + Math.floor(totalLines / 10);
}

// ─── Initial state ─────────────────────────────────────────────────────────────
export function initialState(seed: number, settings: TetrisSettings): TetrisState {
  const startLevel = parseInt(settings.startLevel, 10);
  const { type: firstType, nextSeed: s1 } = randomType(seed);
  const { type: nextType, nextSeed: s2 } = randomType(s1);
  const current = spawnPiece(firstType);
  return {
    settings,
    grid: emptyGrid(),
    current,
    next: nextType,
    score: 0,
    lines: 0,
    level: startLevel,
    over: false,
    rngSeed: s2,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function reducer(state: TetrisState, action: TetrisAction): TetrisState {
  if (state.over) return state;

  switch (action.type) {
    case "left": {
      const moved = { ...state.current, col: state.current.col - 1 };
      if (!isValidPosition(state.grid, moved)) return state;
      return { ...state, current: moved };
    }

    case "right": {
      const moved = { ...state.current, col: state.current.col + 1 };
      if (!isValidPosition(state.grid, moved)) return state;
      return { ...state, current: moved };
    }

    case "rotate": {
      const rotated = { ...state.current, rotation: (state.current.rotation + 1) % 4 };
      if (!isValidPosition(state.grid, rotated)) {
        // Try wall kicks: shift left/right by 1
        const kickLeft = { ...rotated, col: rotated.col - 1 };
        if (isValidPosition(state.grid, kickLeft)) return { ...state, current: kickLeft };
        const kickRight = { ...rotated, col: rotated.col + 1 };
        if (isValidPosition(state.grid, kickRight)) return { ...state, current: kickRight };
        return state;
      }
      return { ...state, current: rotated };
    }

    case "soft-drop": {
      const moved = { ...state.current, row: state.current.row + 1 };
      if (!isValidPosition(state.grid, moved)) return state;
      return { ...state, current: moved };
    }

    case "hard-drop": {
      let dropped = { ...state.current };
      while (isValidPosition(state.grid, { ...dropped, row: dropped.row + 1 })) {
        dropped = { ...dropped, row: dropped.row + 1 };
      }
      return lockAndSpawn({ ...state, current: dropped });
    }

    case "tick": {
      const moved = { ...state.current, row: state.current.row + 1 };
      if (!isValidPosition(state.grid, moved)) {
        return lockAndSpawn(state);
      }
      return { ...state, current: moved };
    }

    default:
      return state;
  }
}

function lockAndSpawn(state: TetrisState): TetrisState {
  const lockedGrid = lockPiece(state.grid, state.current);
  const { newGrid, linesCleared } = clearLines(lockedGrid);
  const newLines = state.lines + linesCleared;
  const rowScore = ROW_SCORES[Math.min(linesCleared, 4)] ?? 0;
  const newScore = state.score + rowScore * (state.level + 1);
  const newLevel = levelFromLines(parseInt(state.settings.startLevel, 10), newLines);

  const { type: nextType, nextSeed } = randomType(state.rngSeed);
  const newCurrent = spawnPiece(state.next);

  // Game over if spawn is invalid
  if (!isValidPosition(newGrid, newCurrent)) {
    return {
      ...state,
      grid: newGrid,
      score: newScore,
      lines: newLines,
      level: newLevel,
      over: true,
    };
  }

  return {
    ...state,
    grid: newGrid,
    current: newCurrent,
    next: nextType,
    score: newScore,
    lines: newLines,
    level: newLevel,
    rngSeed: nextSeed,
  };
}

export function isTerminal(state: TetrisState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

/** Returns ms delay between ticks at a given level. */
export function tickDelay(level: number): number {
  // Roughly follows NES Tetris speeds
  const frames = Math.max(1, 48 - level * 5);
  return Math.round(frames * (1000 / 60));
}
