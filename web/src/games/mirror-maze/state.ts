// Mirror Maze: place mirrors to route a laser beam to the target.

export interface MirrorMazeSettings {
  difficulty: "easy" | "medium" | "hard";
}

// Mirror: "/" reflects (N<->E, S<->W); "\" reflects (N<->W, S<->E)
export type MirrorType = "/" | "\\";

export interface MirrorMazeState {
  settings: MirrorMazeSettings;
  cols: number;
  rows: number;
  /** Source cell and direction the laser starts */
  sourceCol: number;
  sourceRow: number;
  sourceDir: "N" | "E" | "S" | "W";
  /** Target cell */
  targetCol: number;
  targetRow: number;
  /** Fixed mirrors: cannot be moved */
  fixedMirrors: readonly { col: number; row: number; type: MirrorType }[];
  /** Placeable mirrors pool: player places these on empty cells */
  availableMirrors: readonly MirrorType[];
  /** Mirrors placed by the player */
  placedMirrors: readonly { col: number; row: number; type: MirrorType }[];
  /** Currently selected mirror type from available pool */
  selectedMirrorType: MirrorType | null;
  moves: number;
  won: boolean;
}

export type MirrorMazeAction =
  | { type: "selectMirror"; mirrorType: MirrorType }
  | { type: "place"; col: number; row: number }
  | { type: "remove"; col: number; row: number };

// Reflect direction off a "/" mirror
function reflectSlash(dir: "N" | "E" | "S" | "W"): "N" | "E" | "S" | "W" {
  const map: Record<string, "N" | "E" | "S" | "W"> = { N: "E", E: "N", S: "W", W: "S" };
  return map[dir]!;
}

// Reflect direction off a "\" mirror
function reflectBackslash(dir: "N" | "E" | "S" | "W"): "N" | "E" | "S" | "W" {
  const map: Record<string, "N" | "E" | "S" | "W"> = { N: "W", W: "N", S: "E", E: "S" };
  return map[dir]!;
}

function stepDir(col: number, row: number, dir: "N" | "E" | "S" | "W"): { col: number; row: number } {
  if (dir === "N") return { col, row: row - 1 };
  if (dir === "E") return { col: col + 1, row };
  if (dir === "S") return { col, row: row + 1 };
  return { col: col - 1, row };
}

export function traceLaser(state: Pick<MirrorMazeState, "cols"|"rows"|"sourceCol"|"sourceRow"|"sourceDir"|"fixedMirrors"|"placedMirrors">): { col: number; row: number }[] {
  const allMirrors = [...state.fixedMirrors, ...state.placedMirrors];
  const path: { col: number; row: number }[] = [];
  let col = state.sourceCol;
  let row = state.sourceRow;
  let dir = state.sourceDir;
  const maxSteps = (state.cols + state.rows) * 10;

  for (let step = 0; step < maxSteps; step++) {
    path.push({ col, row });
    const mirror = allMirrors.find(m => m.col === col && m.row === row);
    if (mirror) {
      dir = mirror.type === "/" ? reflectSlash(dir) : reflectBackslash(dir);
    }
    const next = stepDir(col, row, dir);
    if (next.col < 0 || next.col >= state.cols || next.row < 0 || next.row >= state.rows) break;
    col = next.col;
    row = next.row;
  }
  return path;
}

interface PuzzleDef {
  cols: number;
  rows: number;
  sourceCol: number;
  sourceRow: number;
  sourceDir: "N" | "E" | "S" | "W";
  targetCol: number;
  targetRow: number;
  fixedMirrors: { col: number; row: number; type: MirrorType }[];
  availableMirrors: MirrorType[];
}

const PUZZLES: PuzzleDef[] = [
  // Easy (5x5)
  {
    cols: 5, rows: 5, sourceCol: 0, sourceRow: 2, sourceDir: "E",
    targetCol: 4, targetRow: 2,
    fixedMirrors: [],
    availableMirrors: [],
  },
  {
    cols: 5, rows: 5, sourceCol: 0, sourceRow: 0, sourceDir: "E",
    targetCol: 4, targetRow: 4,
    fixedMirrors: [{ col: 2, row: 0, type: "/" }],
    availableMirrors: ["/"],
  },
  {
    cols: 5, rows: 5, sourceCol: 0, sourceRow: 0, sourceDir: "E",
    targetCol: 2, targetRow: 4,
    fixedMirrors: [{ col: 2, row: 0, type: "/" }],
    availableMirrors: ["/", "\\"],
  },
  // Medium (6x6)
  {
    cols: 6, rows: 6, sourceCol: 0, sourceRow: 0, sourceDir: "E",
    targetCol: 5, targetRow: 5,
    fixedMirrors: [{ col: 2, row: 0, type: "/" }, { col: 2, row: 3, type: "\\" }],
    availableMirrors: ["/", "\\"],
  },
  {
    cols: 6, rows: 6, sourceCol: 0, sourceRow: 3, sourceDir: "E",
    targetCol: 3, targetRow: 0,
    fixedMirrors: [{ col: 4, row: 3, type: "/" }],
    availableMirrors: ["/", "/", "\\"],
  },
  {
    cols: 6, rows: 6, sourceCol: 0, sourceRow: 0, sourceDir: "S",
    targetCol: 5, targetRow: 5,
    fixedMirrors: [{ col: 0, row: 3, type: "\\" }, { col: 3, row: 3, type: "/" }],
    availableMirrors: ["\\", "/"],
  },
  // Hard (7x7)
  {
    cols: 7, rows: 7, sourceCol: 0, sourceRow: 0, sourceDir: "E",
    targetCol: 6, targetRow: 6,
    fixedMirrors: [
      { col: 2, row: 0, type: "/" },
      { col: 2, row: 4, type: "\\" },
      { col: 5, row: 4, type: "/" },
    ],
    availableMirrors: ["/", "\\", "\\"],
  },
  {
    cols: 7, rows: 7, sourceCol: 3, sourceRow: 0, sourceDir: "S",
    targetCol: 6, targetRow: 3,
    fixedMirrors: [
      { col: 3, row: 3, type: "/" },
      { col: 1, row: 3, type: "\\" },
    ],
    availableMirrors: ["\\", "/", "/"],
  },
];

export function initialState(seed: number, settings: MirrorMazeSettings): MirrorMazeState {
  const easyCount = 3, medCount = 3;
  let puzzleIndex: number;
  if (settings.difficulty === "easy") puzzleIndex = seed % easyCount;
  else if (settings.difficulty === "medium") puzzleIndex = easyCount + (seed % medCount);
  else puzzleIndex = easyCount + medCount + (seed % 2);

  const p = PUZZLES[puzzleIndex]!;
  const state: MirrorMazeState = {
    settings,
    cols: p.cols,
    rows: p.rows,
    sourceCol: p.sourceCol,
    sourceRow: p.sourceRow,
    sourceDir: p.sourceDir,
    targetCol: p.targetCol,
    targetRow: p.targetRow,
    fixedMirrors: p.fixedMirrors,
    availableMirrors: p.availableMirrors,
    placedMirrors: [],
    selectedMirrorType: p.availableMirrors[0] ?? null,
    moves: 0,
    won: false,
  };

  // Check if already solved (no mirrors needed)
  const path = traceLaser(state);
  const last = path[path.length - 1]!;
  if (last.col === p.targetCol && last.row === p.targetRow) {
    return { ...state, won: true };
  }
  return state;
}

export function reducer(state: MirrorMazeState, action: MirrorMazeAction): MirrorMazeState {
  if (state.won) return state;

  if (action.type === "selectMirror") {
    return { ...state, selectedMirrorType: action.mirrorType };
  }

  if (action.type === "remove") {
    const { col, row } = action;
    const isFixed = state.fixedMirrors.some(m => m.col === col && m.row === row);
    if (isFixed) return state;
    const placedMirrors = state.placedMirrors.filter(m => !(m.col === col && m.row === row));
    return { ...state, placedMirrors, moves: state.moves + 1 };
  }

  if (action.type === "place") {
    const { col, row } = action;
    if (!state.selectedMirrorType) return state;
    // Cannot place on source, target, or fixed mirror
    if (col === state.sourceCol && row === state.sourceRow) return state;
    if (col === state.targetCol && row === state.targetRow) return state;
    const isFixed = state.fixedMirrors.some(m => m.col === col && m.row === row);
    if (isFixed) return state;

    // Check available mirrors
    const alreadyPlaced = state.placedMirrors.filter(m => m.type === state.selectedMirrorType!).length;
    const available = state.availableMirrors.filter(m => m === state.selectedMirrorType!).length;
    const existsAt = state.placedMirrors.find(m => m.col === col && m.row === row);

    if (!existsAt && alreadyPlaced >= available) return state;

    let placedMirrors: typeof state.placedMirrors;
    if (existsAt) {
      // Replace
      placedMirrors = state.placedMirrors.map(m =>
        m.col === col && m.row === row ? { ...m, type: state.selectedMirrorType! } : m
      );
    } else {
      placedMirrors = [...state.placedMirrors, { col, row, type: state.selectedMirrorType! }];
    }

    const newState = { ...state, placedMirrors, moves: state.moves + 1 };
    const path = traceLaser(newState);
    const last = path[path.length - 1]!;
    const won = last.col === state.targetCol && last.row === state.targetRow;
    return { ...newState, won };
  }

  return state;
}

export function isTerminal(state: MirrorMazeState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(50, 500 - state.moves * 10) };
}
