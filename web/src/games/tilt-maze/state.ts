// Tilt Maze: tilt the board so the ball slides until it hits a wall or the goal.

export interface TiltMazeSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface TiltMazeState {
  settings: TiltMazeSettings;
  cols: number;
  rows: number;
  ballCol: number;
  ballRow: number;
  goalCol: number;
  goalRow: number;
  /** Horizontal walls: "row,col" means wall below cell (row,col) */
  hWalls: readonly string[];
  /** Vertical walls: "row,col" means wall right of cell (row,col) */
  vWalls: readonly string[];
  moves: number;
  won: boolean;
  puzzleIndex: number;
}

export type TiltMazeAction = { type: "tilt"; dir: "up" | "down" | "left" | "right" };

interface PuzzleDef {
  cols: number;
  rows: number;
  startCol: number;
  startRow: number;
  goalCol: number;
  goalRow: number;
  hWalls: string[];
  vWalls: string[];
}

function hw(r: number, c: number) { return `${r},${c}`; }
function vw(r: number, c: number) { return `${r},${c}`; }

const PUZZLES: PuzzleDef[] = [
  // Easy (4x4)
  { cols: 4, rows: 4, startCol: 0, startRow: 0, goalCol: 3, goalRow: 3,
    hWalls: [hw(1,1), hw(2,2)], vWalls: [vw(0,2), vw(2,1)] },
  { cols: 4, rows: 4, startCol: 0, startRow: 3, goalCol: 3, goalRow: 0,
    hWalls: [hw(1,2), hw(2,0)], vWalls: [vw(1,1), vw(3,2)] },
  { cols: 4, rows: 4, startCol: 1, startRow: 0, goalCol: 2, goalRow: 3,
    hWalls: [hw(0,0), hw(2,1), hw(2,3)], vWalls: [vw(1,2), vw(3,1)] },
  // Medium (5x5)
  { cols: 5, rows: 5, startCol: 0, startRow: 0, goalCol: 4, goalRow: 4,
    hWalls: [hw(1,2), hw(2,0), hw(3,3)], vWalls: [vw(0,3), vw(2,2), vw(4,1)] },
  { cols: 5, rows: 5, startCol: 0, startRow: 2, goalCol: 4, goalRow: 2,
    hWalls: [hw(1,1), hw(3,3), hw(2,4)], vWalls: [vw(2,1), vw(0,2), vw(4,3)] },
  { cols: 5, rows: 5, startCol: 2, startRow: 0, goalCol: 2, goalRow: 4,
    hWalls: [hw(1,0), hw(2,3), hw(3,1)], vWalls: [vw(0,1), vw(2,3), vw(4,2)] },
  // Hard (6x6)
  { cols: 6, rows: 6, startCol: 0, startRow: 0, goalCol: 5, goalRow: 5,
    hWalls: [hw(1,3), hw(2,1), hw(3,4), hw(4,2)], vWalls: [vw(0,2), vw(2,4), vw(3,1), vw(5,3)] },
  { cols: 6, rows: 6, startCol: 0, startRow: 5, goalCol: 5, goalRow: 0,
    hWalls: [hw(1,1), hw(2,4), hw(3,2), hw(4,5)], vWalls: [vw(0,3), vw(1,2), vw(4,4), vw(5,1)] },
];

function hasHWall(hWalls: readonly string[], r: number, c: number): boolean {
  return hWalls.includes(hw(r, c));
}
function hasVWall(vWalls: readonly string[], r: number, c: number): boolean {
  return vWalls.includes(vw(r, c));
}

export function slideBall(
  col: number,
  row: number,
  dir: "up" | "down" | "left" | "right",
  cols: number,
  rows: number,
  hWalls: readonly string[],
  vWalls: readonly string[]
): { col: number; row: number } {
  let c = col, r = row;
  while (true) {
    if (dir === "up") {
      if (r === 0) break;
      if (hasHWall(hWalls, r - 1, c)) break;
      r--;
    } else if (dir === "down") {
      if (r === rows - 1) break;
      if (hasHWall(hWalls, r, c)) break;
      r++;
    } else if (dir === "left") {
      if (c === 0) break;
      if (hasVWall(vWalls, r, c - 1)) break;
      c--;
    } else {
      if (c === cols - 1) break;
      if (hasVWall(vWalls, r, c)) break;
      c++;
    }
  }
  return { col: c, row: r };
}

export function initialState(seed: number, settings: TiltMazeSettings): TiltMazeState {
  const easyCount = 3;
  const medCount = 3;
  let puzzleIndex: number;
  if (settings.difficulty === "easy") puzzleIndex = seed % easyCount;
  else if (settings.difficulty === "medium") puzzleIndex = easyCount + (seed % medCount);
  else puzzleIndex = easyCount + medCount + (seed % 2);

  const p = PUZZLES[puzzleIndex]!;
  return {
    settings,
    cols: p.cols,
    rows: p.rows,
    ballCol: p.startCol,
    ballRow: p.startRow,
    goalCol: p.goalCol,
    goalRow: p.goalRow,
    hWalls: p.hWalls,
    vWalls: p.vWalls,
    moves: 0,
    won: false,
    puzzleIndex,
  };
}

export function reducer(state: TiltMazeState, action: TiltMazeAction): TiltMazeState {
  if (action.type !== "tilt") return state;
  if (state.won) return state;

  const { col, row } = slideBall(
    state.ballCol, state.ballRow, action.dir,
    state.cols, state.rows, state.hWalls, state.vWalls
  );

  if (col === state.ballCol && row === state.ballRow) return state;

  const won = col === state.goalCol && row === state.goalRow;
  return {
    ...state,
    ballCol: col,
    ballRow: row,
    moves: state.moves + 1,
    won,
  };
}

export function isTerminal(state: TiltMazeState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(50, 500 - state.moves * 20) };
}
