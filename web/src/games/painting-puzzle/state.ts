import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Painting Puzzle: fill a 5x5 grid so each row and column has exactly one of each color
// Like a color Latin square. 4 colors on a 4x4 grid.

export const SIZE = 4;
export type Color = 0 | 1 | 2 | 3 | 4; // 0 = empty, 1-4 = colors

export interface PaintState {
  rngSeed: number;
  grid: Color[][];       // [row][col]
  locked: boolean[][];   // cells that are pre-filled (cannot change)
  phase: "playing" | "won";
  moves: number;
  puzzleIndex: number;
}

export type PaintAction =
  | { type: "cycleColor"; row: number; col: number }
  | { type: "reset" };

const COLORS: Color[] = [1, 2, 3, 4];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function generateSolution(rng: () => number): Color[][] {
  // Generate a valid Latin square by rotating a random base row
  const base = shuffle([...COLORS], rng) as Color[];
  return Array.from({ length: SIZE }, (_, r) =>
    Array.from({ length: SIZE }, (_, c) => base[(c + r) % SIZE]!) as Color[]
  );
}

function generatePuzzle(seed: number, puzzleIndex: number): { grid: Color[][]; locked: boolean[][] } {
  const rng = mulberry32(seed + puzzleIndex * 1337);
  const solution = generateSolution(rng);
  // Reveal roughly half the cells
  const revealCount = 6 + (puzzleIndex % 3);
  const locked: boolean[][] = Array.from({ length: SIZE }, () => new Array(SIZE).fill(false));
  const grid: Color[][] = Array.from({ length: SIZE }, () => new Array(SIZE).fill(0 as Color));
  const cells: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) cells.push([r, c]);
  const revealed = shuffle(cells, rng).slice(0, revealCount);
  for (const [r, c] of revealed) {
    grid[r]![c] = solution[r]![c]!;
    locked[r]![c] = true;
  }
  return { grid, locked };
}

export function initialState(seed: number): PaintState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const { grid, locked } = generatePuzzle(nextSeed, 0);
  return {
    rngSeed: nextSeed,
    grid,
    locked,
    phase: "playing",
    moves: 0,
    puzzleIndex: 0,
  };
}

function checkWin(grid: Color[][]): boolean {
  for (let r = 0; r < SIZE; r++) {
    const rowColors = new Set(grid[r]);
    if (rowColors.has(0 as Color) || rowColors.size !== SIZE) return false;
  }
  for (let c = 0; c < SIZE; c++) {
    const colColors = new Set(grid.map(row => row[c]!));
    if (colColors.has(0 as Color) || colColors.size !== SIZE) return false;
  }
  return true;
}

export function reducer(state: PaintState, action: PaintAction): PaintState {
  if (state.phase === "won" && action.type !== "reset") return state;

  if (action.type === "reset") {
    const nextPuzzleIndex = state.puzzleIndex + 1;
    const { grid, locked } = generatePuzzle(state.rngSeed, nextPuzzleIndex);
    return {
      ...state,
      grid,
      locked,
      phase: "playing",
      moves: state.moves,
      puzzleIndex: nextPuzzleIndex,
    };
  }

  const { row, col } = action;
  if (state.locked[row]![col]) return state;

  const current = state.grid[row]![col]!;
  const next: Color = (current === 4 ? 0 : current + 1) as Color;
  const newGrid = state.grid.map((r, ri) =>
    r.map((c, ci) => ri === row && ci === col ? next : c)
  ) as Color[][];

  const won = checkWin(newGrid);
  return {
    ...state,
    grid: newGrid,
    phase: won ? "won" : "playing",
    moves: state.moves + 1,
  };
}

export function isTerminal(state: PaintState): { score: number } | null {
  if (state.phase !== "won") return null;
  return { score: Math.max(0, Math.min(100, 100 - Math.max(0, state.moves - SIZE * SIZE) * 3)) };
}
