// Pentomino Puzzle: fill a rectangular grid with pentomino pieces.

export interface PentominoPuzzleSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface PentominoPuzzleState {
  settings: PentominoPuzzleSettings;
  cols: number;
  rows: number;
  /** Grid cells: -1 = empty, 0..n = piece index */
  grid: readonly number[];
  /** Available pieces (each piece is a set of [col, row] offsets) */
  pieces: readonly {
    id: number;
    cells: readonly [number, number][];
    color: number;
    placed: boolean;
  }[];
  /** Currently selected piece index */
  selectedPiece: number | null;
  moves: number;
  won: boolean;
}

export type PentominoPuzzleAction =
  | { type: "selectPiece"; pieceId: number }
  | { type: "placePiece"; col: number; row: number }
  | { type: "removePiece"; col: number; row: number };

function canPlace(
  cells: readonly [number, number][],
  col: number,
  row: number,
  grid: readonly number[],
  cols: number,
  rows: number,
  excludePieceId = -1
): boolean {
  for (const [dc, dr] of cells) {
    const c = col + dc, r = row + dr;
    if (c < 0 || c >= cols || r < 0 || r >= rows) return false;
    const idx = r * cols + c;
    if (grid[idx] !== -1 && grid[idx] !== excludePieceId) return false;
  }
  return true;
}

function placePiece(
  cells: readonly [number, number][],
  col: number,
  row: number,
  grid: readonly number[],
  cols: number,
  pieceId: number
): number[] {
  const newGrid = [...grid];
  for (const [dc, dr] of cells) {
    newGrid[(row + dr) * cols + (col + dc)] = pieceId;
  }
  return newGrid;
}

// 5-cell pieces (simplified orientations)
type PieceDef = { cells: [number, number][] };

// I piece: 1x5 horizontal
const I_H: PieceDef = { cells: [[0,0],[1,0],[2,0],[3,0],[4,0]] };
// L piece
const L_0: PieceDef = { cells: [[0,0],[0,1],[0,2],[0,3],[1,3]] };
// P piece
const P_0: PieceDef = { cells: [[0,0],[1,0],[0,1],[1,1],[0,2]] };
// T piece
const T_0: PieceDef = { cells: [[0,0],[1,0],[2,0],[1,1],[1,2]] };
// U piece
const U_0: PieceDef = { cells: [[0,0],[2,0],[0,1],[1,1],[2,1]] };
// S/Z piece
const S_0: PieceDef = { cells: [[1,0],[2,0],[0,1],[1,1],[0,2]] };
// Y piece
const Y_0: PieceDef = { cells: [[1,0],[0,1],[1,1],[1,2],[1,3]] };
// F piece
const F_0: PieceDef = { cells: [[1,0],[2,0],[0,1],[1,1],[1,2]] };

interface PuzzleDef {
  cols: number;
  rows: number;
  pieces: { cells: [number, number][]; color: number }[];
  /** Pre-filled cells: [col, row, pieceId] for cells already on board */
  preplace?: [number, number, number][];
}

const PUZZLES: PuzzleDef[] = [
  // Easy: 5x4=20 cells, 4 pentominoes
  {
    cols: 5, rows: 4,
    pieces: [
      { cells: I_H.cells, color: 1 },
      { cells: L_0.cells, color: 2 },
      { cells: P_0.cells, color: 3 },
      { cells: T_0.cells, color: 4 },
    ],
  },
  {
    cols: 5, rows: 4,
    pieces: [
      { cells: U_0.cells, color: 1 },
      { cells: I_H.cells, color: 2 },
      { cells: S_0.cells, color: 3 },
      { cells: T_0.cells, color: 4 },
    ],
  },
  {
    cols: 5, rows: 4,
    pieces: [
      { cells: Y_0.cells, color: 1 },
      { cells: P_0.cells, color: 2 },
      { cells: L_0.cells, color: 3 },
      { cells: F_0.cells, color: 4 },
    ],
  },
  // Medium: 5x5=25 cells, 5 pentominoes
  {
    cols: 5, rows: 5,
    pieces: [
      { cells: I_H.cells, color: 1 },
      { cells: L_0.cells, color: 2 },
      { cells: P_0.cells, color: 3 },
      { cells: T_0.cells, color: 4 },
      { cells: U_0.cells, color: 5 },
    ],
  },
  {
    cols: 5, rows: 5,
    pieces: [
      { cells: S_0.cells, color: 1 },
      { cells: Y_0.cells, color: 2 },
      { cells: F_0.cells, color: 3 },
      { cells: T_0.cells, color: 4 },
      { cells: P_0.cells, color: 5 },
    ],
  },
  // Hard: 6x5=30 cells, 6 pentominoes
  {
    cols: 6, rows: 5,
    pieces: [
      { cells: I_H.cells, color: 1 },
      { cells: L_0.cells, color: 2 },
      { cells: P_0.cells, color: 3 },
      { cells: T_0.cells, color: 4 },
      { cells: U_0.cells, color: 5 },
      { cells: S_0.cells, color: 6 },
    ],
  },
  {
    cols: 6, rows: 5,
    pieces: [
      { cells: Y_0.cells, color: 1 },
      { cells: F_0.cells, color: 2 },
      { cells: I_H.cells, color: 3 },
      { cells: S_0.cells, color: 4 },
      { cells: T_0.cells, color: 5 },
      { cells: P_0.cells, color: 6 },
    ],
  },
  {
    cols: 6, rows: 5,
    pieces: [
      { cells: L_0.cells, color: 1 },
      { cells: U_0.cells, color: 2 },
      { cells: Y_0.cells, color: 3 },
      { cells: F_0.cells, color: 4 },
      { cells: S_0.cells, color: 5 },
      { cells: T_0.cells, color: 6 },
    ],
  },
];

export function initialState(seed: number, settings: PentominoPuzzleSettings): PentominoPuzzleState {
  const easyCount = 3, medCount = 2;
  let puzzleIndex: number;
  if (settings.difficulty === "easy") puzzleIndex = seed % easyCount;
  else if (settings.difficulty === "medium") puzzleIndex = easyCount + (seed % medCount);
  else puzzleIndex = easyCount + medCount + (seed % 3);

  const p = PUZZLES[puzzleIndex]!;
  const grid = new Array(p.cols * p.rows).fill(-1);

  return {
    settings,
    cols: p.cols,
    rows: p.rows,
    grid,
    pieces: p.pieces.map((piece, id) => ({
      id,
      cells: piece.cells,
      color: piece.color,
      placed: false,
    })),
    selectedPiece: 0,
    moves: 0,
    won: false,
  };
}

export function reducer(state: PentominoPuzzleState, action: PentominoPuzzleAction): PentominoPuzzleState {
  if (state.won) return state;

  if (action.type === "selectPiece") {
    const piece = state.pieces.find(p => p.id === action.pieceId);
    if (!piece || piece.placed) return state;
    return { ...state, selectedPiece: action.pieceId };
  }

  if (action.type === "removePiece") {
    const { col, row } = action;
    const idx = row * state.cols + col;
    const pieceId = state.grid[idx];
    if (pieceId === undefined || pieceId === -1) return state;
    const newGrid = state.grid.map(v => v === pieceId ? -1 : v);
    const pieces = state.pieces.map(p => p.id === pieceId ? { ...p, placed: false } : p);
    return { ...state, grid: newGrid, pieces, moves: state.moves + 1, selectedPiece: pieceId };
  }

  if (action.type === "placePiece") {
    if (state.selectedPiece === null) return state;
    const piece = state.pieces.find(p => p.id === state.selectedPiece);
    if (!piece || piece.placed) return state;
    const { col, row } = action;
    if (!canPlace(piece.cells, col, row, state.grid, state.cols, state.rows)) return state;
    const newGrid = placePiece(piece.cells, col, row, state.grid, state.cols, piece.id);
    const pieces = state.pieces.map(p => p.id === piece.id ? { ...p, placed: true } : p);
    const won = newGrid.every(v => v !== -1);
    return { ...state, grid: newGrid, pieces, moves: state.moves + 1, won };
  }

  return state;
}

export function isTerminal(state: PentominoPuzzleState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(50, 600 - state.moves * 5) };
}
