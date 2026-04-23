// Number Maze: pre-designed puzzles. Starting cell has N; move N steps in one orthogonal direction.
// Next cell dictates next move. Reach the EXIT within a turn limit.

export interface NumberMazeSettings {
  puzzle: "1" | "2" | "3" | "4" | "5";
}

export interface MazeCell {
  value: number; // 0 = exit
}

export interface Puzzle {
  grid: number[][]; // row x col, 0 = exit
  rows: number;
  cols: number;
  startRow: number;
  startCol: number;
  maxTurns: number;
  name: string;
}

// ─── 8 hand-designed puzzles ──────────────────────────────────────────────────
const PUZZLES: Puzzle[] = [
  {
    name: "Beginner",
    rows: 4, cols: 4,
    startRow: 0, startCol: 0,
    maxTurns: 6,
    grid: [
      [3, 1, 2, 1],
      [1, 2, 3, 1],
      [2, 1, 1, 2],
      [1, 3, 2, 0],
    ],
  },
  {
    name: "Easy",
    rows: 4, cols: 5,
    startRow: 0, startCol: 0,
    maxTurns: 7,
    grid: [
      [2, 3, 1, 2, 1],
      [1, 1, 2, 1, 3],
      [3, 2, 1, 2, 1],
      [1, 2, 3, 1, 0],
    ],
  },
  {
    name: "Medium",
    rows: 5, cols: 5,
    startRow: 0, startCol: 2,
    maxTurns: 8,
    grid: [
      [2, 1, 3, 1, 2],
      [1, 3, 2, 2, 1],
      [2, 1, 1, 3, 2],
      [1, 2, 3, 1, 1],
      [3, 1, 2, 1, 0],
    ],
  },
  {
    name: "Tricky",
    rows: 5, cols: 5,
    startRow: 0, startCol: 0,
    maxTurns: 10,
    grid: [
      [4, 1, 2, 1, 3],
      [1, 2, 1, 3, 1],
      [3, 1, 4, 1, 2],
      [1, 3, 1, 2, 1],
      [2, 1, 3, 1, 0],
    ],
  },
  {
    name: "Expert",
    rows: 6, cols: 6,
    startRow: 0, startCol: 0,
    maxTurns: 12,
    grid: [
      [3, 1, 2, 4, 1, 2],
      [1, 4, 1, 1, 3, 1],
      [2, 1, 3, 2, 1, 4],
      [4, 2, 1, 3, 2, 1],
      [1, 3, 4, 1, 3, 2],
      [2, 1, 1, 2, 1, 0],
    ],
  },
];

export interface NumberMazeState {
  settings: NumberMazeSettings;
  puzzle: Puzzle;
  row: number;
  col: number;
  turnsUsed: number;
  solved: boolean;
  failed: boolean;
  history: [number, number][]; // visited cells
}

export type NumberMazeAction =
  | { type: "move"; dir: "up" | "down" | "left" | "right" };

function getPuzzle(settings: NumberMazeSettings): Puzzle {
  return PUZZLES[parseInt(settings.puzzle, 10) - 1]!;
}

export function initialState(seed: number, settings: NumberMazeSettings): NumberMazeState {
  const puzzle = getPuzzle(settings);
  return {
    settings,
    puzzle,
    row: puzzle.startRow,
    col: puzzle.startCol,
    turnsUsed: 0,
    solved: false,
    failed: false,
    history: [[puzzle.startRow, puzzle.startCol]],
  };
}

function inBounds(puzzle: Puzzle, r: number, c: number): boolean {
  return r >= 0 && r < puzzle.rows && c >= 0 && c < puzzle.cols;
}

export function getLegalMoves(state: NumberMazeState): ("up" | "down" | "left" | "right")[] {
  if (state.solved || state.failed) return [];
  const { puzzle, row, col } = state;
  const steps = puzzle.grid[row]?.[col] ?? 0;
  if (steps === 0) return [];
  const dirs: ("up" | "down" | "left" | "right")[] = [];
  if (inBounds(puzzle, row - steps, col)) dirs.push("up");
  if (inBounds(puzzle, row + steps, col)) dirs.push("down");
  if (inBounds(puzzle, row, col - steps)) dirs.push("left");
  if (inBounds(puzzle, row, col + steps)) dirs.push("right");
  return dirs;
}

export function reducer(state: NumberMazeState, action: NumberMazeAction): NumberMazeState {
  if (state.solved || state.failed) return state;

  if (action.type === "move") {
    const { puzzle, row, col } = state;
    const steps = puzzle.grid[row]?.[col] ?? 0;
    let nr = row, nc = col;
    if (action.dir === "up") nr = row - steps;
    else if (action.dir === "down") nr = row + steps;
    else if (action.dir === "left") nc = col - steps;
    else nc = col + steps;

    if (!inBounds(puzzle, nr, nc)) return state; // invalid move

    const turnsUsed = state.turnsUsed + 1;
    const cellVal = puzzle.grid[nr]![nc]!;
    const solved = cellVal === 0;
    const failed = !solved && turnsUsed >= state.puzzle.maxTurns;

    return {
      ...state,
      row: nr,
      col: nc,
      turnsUsed,
      solved,
      failed,
      history: [...state.history, [nr, nc]],
    };
  }

  return state;
}

export function isTerminal(state: NumberMazeState): { score: number } | null {
  if (state.solved) {
    const efficiency = Math.max(0, state.puzzle.maxTurns - state.turnsUsed);
    return { score: 300 + efficiency * 20 };
  }
  if (state.failed) return { score: 0 };
  return null;
}

export { PUZZLES, getPuzzle, inBounds };
