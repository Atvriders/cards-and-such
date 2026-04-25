// Cube Roll: roll a die through a grid maze so the correct face is up at the goal.
// Die orientation tracked as [top, front, right, bottom, back, left] face numbers.

export interface CubeRollSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface CubeRollState {
  settings: CubeRollSettings;
  /** Grid dimensions */
  cols: number;
  rows: number;
  /** Current cube position */
  col: number;
  row: number;
  /** Goal position */
  goalCol: number;
  goalRow: number;
  /** Walls: set of "r,c-r,c" blocking between two adjacent cells */
  walls: readonly string[];
  /** Current die faces [top, front, right, bottom, back, left] */
  faces: readonly number[];
  /** Target face that must be on top at the goal */
  targetFace: number;
  moves: number;
  won: boolean;
  puzzleIndex: number;
}

export type CubeRollAction = { type: "move"; dir: "up" | "down" | "left" | "right" };

// Standard die orientation: opposite faces sum to 7
// Initial state: top=1, front=2, right=3, bottom=6, back=5, left=4
const INIT_FACES = [1, 2, 3, 6, 5, 4] as const;

function rollFaces(faces: readonly number[], dir: "up" | "down" | "left" | "right"): number[] {
  const top = faces[0]!;
  const front = faces[1]!;
  const right = faces[2]!;
  const bottom = faces[3]!;
  const back = faces[4]!;
  const left = faces[5]!;
  switch (dir) {
    case "up":    return [front, bottom, right, back, top, left];
    case "down":  return [back, top, right, front, bottom, left];
    case "left":  return [right, front, bottom, left, back, top];
    case "right": return [left, front, top, right, back, bottom];
  }
}

function wallKey(r1: number, c1: number, r2: number, c2: number): string {
  const a = `${Math.min(r1,r2)},${Math.min(c1,c2)}`;
  const b = `${Math.max(r1,r2)},${Math.max(c1,c2)}`;
  return `${a}-${b}`;
}

interface PuzzleDef {
  cols: number;
  rows: number;
  startCol: number;
  startRow: number;
  goalCol: number;
  goalRow: number;
  walls: string[];
  targetFace: number;
}

const PUZZLES: PuzzleDef[] = [
  // Easy puzzles (5x5)
  { cols: 5, rows: 5, startCol: 0, startRow: 0, goalCol: 4, goalRow: 4, walls: [], targetFace: 6 },
  { cols: 5, rows: 5, startCol: 0, startRow: 0, goalCol: 4, goalRow: 4,
    walls: [wallKey(0,1,0,2), wallKey(1,2,2,2), wallKey(2,3,3,3)], targetFace: 2 },
  { cols: 5, rows: 5, startCol: 0, startRow: 2, goalCol: 4, goalRow: 2,
    walls: [wallKey(1,1,2,1), wallKey(2,2,2,3), wallKey(3,3,3,4)], targetFace: 1 },
  // Medium puzzles (6x6)
  { cols: 6, rows: 6, startCol: 0, startRow: 0, goalCol: 5, goalRow: 5,
    walls: [wallKey(0,2,0,3), wallKey(1,1,2,1), wallKey(2,3,3,3), wallKey(3,4,4,4)], targetFace: 3 },
  { cols: 6, rows: 6, startCol: 0, startRow: 3, goalCol: 5, goalRow: 2,
    walls: [wallKey(2,1,2,2), wallKey(3,2,3,3), wallKey(4,3,4,4), wallKey(1,4,2,4)], targetFace: 4 },
  { cols: 6, rows: 6, startCol: 1, startRow: 0, goalCol: 4, goalRow: 5,
    walls: [wallKey(0,3,0,4), wallKey(1,2,2,2), wallKey(2,4,3,4), wallKey(4,1,4,2)], targetFace: 5 },
  // Hard puzzles (7x7)
  { cols: 7, rows: 7, startCol: 0, startRow: 0, goalCol: 6, goalRow: 6,
    walls: [wallKey(0,3,0,4), wallKey(1,1,2,1), wallKey(2,4,3,4), wallKey(3,2,3,3), wallKey(4,5,5,5), wallKey(5,3,5,4)], targetFace: 1 },
  { cols: 7, rows: 7, startCol: 0, startRow: 3, goalCol: 6, goalRow: 3,
    walls: [wallKey(1,2,2,2), wallKey(2,4,2,5), wallKey(3,1,3,2), wallKey(3,4,4,4), wallKey(4,2,5,2), wallKey(5,5,5,6)], targetFace: 6 },
];

export function initialState(seed: number, settings: CubeRollSettings): CubeRollState {
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
    col: p.startCol,
    row: p.startRow,
    goalCol: p.goalCol,
    goalRow: p.goalRow,
    walls: p.walls,
    faces: [...INIT_FACES],
    targetFace: p.targetFace,
    moves: 0,
    won: false,
    puzzleIndex,
  };
}

export function reducer(state: CubeRollState, action: CubeRollAction): CubeRollState {
  if (action.type !== "move") return state;
  if (state.won) return state;

  let { col, row } = state;
  const { dir } = action;
  let nc = col, nr = row;
  if (dir === "up") nr--;
  else if (dir === "down") nr++;
  else if (dir === "left") nc--;
  else if (dir === "right") nc++;

  if (nc < 0 || nc >= state.cols || nr < 0 || nr >= state.rows) return state;

  // Check walls
  const wk = wallKey(Math.min(row,nr), Math.min(col,nc), Math.max(row,nr), Math.max(col,nc));
  if (state.walls.includes(wk)) return state;

  const newFaces = rollFaces(state.faces, dir);
  const atGoal = nc === state.goalCol && nr === state.goalRow;
  const won = atGoal && newFaces[0] === state.targetFace;

  return {
    ...state,
    col: nc,
    row: nr,
    faces: newFaces,
    moves: state.moves + 1,
    won,
  };
}

export function isTerminal(state: CubeRollState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(50, 500 - state.moves * 5) };
}
