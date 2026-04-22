import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Grid-based Tangram implementation on a 10x10 grid
// 7 pieces: 5 triangles (various sizes), 1 square, 1 parallelogram
// Each piece is defined as a set of cells on a grid

export type PieceId = "LT1" | "LT2" | "MT" | "ST1" | "ST2" | "SQ" | "PA";

export interface PieceDef {
  id: PieceId;
  label: string;
  // cells for each of 4 rotations (0, 90, 180, 270)
  rotations: [number, number][][];
  color: string;
}

// Pieces defined as sets of [row, col] offsets
// Large triangle 1 (4 cells making a triangle)
const LT1_R0: [number, number][] = [[0,0],[0,1],[1,0],[1,1],[0,2],[1,2],[2,0],[2,1],[2,2]]; // 3×3 filled (simplification: use rectangular approximations)

// For grid-based tangram, we'll use simpler polyomino shapes
// Each piece occupies distinct cells on the grid

const PIECE_DEFS: PieceDef[] = [
  {
    id: "LT1",
    label: "Large Triangle 1",
    color: "#e74c3c",
    rotations: [
      [[0,0],[0,1],[0,2],[0,3],[1,0],[1,1],[1,2],[2,0],[2,1],[3,0]],
      [[0,0],[1,0],[1,1],[2,0],[2,1],[2,2],[3,0],[3,1],[3,2],[3,3]],
      [[0,3],[1,2],[1,3],[2,1],[2,2],[2,3],[3,0],[3,1],[3,2],[3,3]],
      [[0,0],[0,1],[0,2],[0,3],[1,1],[1,2],[1,3],[2,2],[2,3],[3,3]],
    ],
  },
  {
    id: "LT2",
    label: "Large Triangle 2",
    color: "#2980b9",
    rotations: [
      [[0,0],[0,1],[0,2],[0,3],[1,1],[1,2],[1,3],[2,2],[2,3],[3,3]],
      [[0,3],[1,2],[1,3],[2,1],[2,2],[2,3],[3,0],[3,1],[3,2],[3,3]],
      [[0,0],[1,0],[1,1],[2,0],[2,1],[2,2],[3,0],[3,1],[3,2],[3,3]],
      [[0,0],[0,1],[0,2],[0,3],[1,0],[1,1],[1,2],[2,0],[2,1],[3,0]],
    ],
  },
  {
    id: "MT",
    label: "Medium Triangle",
    color: "#27ae60",
    rotations: [
      [[0,0],[0,1],[0,2],[0,3],[1,1],[1,2],[2,1],[2,2]],
      [[0,0],[1,0],[1,1],[2,0],[2,1],[2,2],[3,0],[3,1]],
      [[0,1],[0,2],[1,1],[1,2],[2,0],[2,1],[2,2],[2,3]],
      [[0,2],[0,3],[1,1],[1,2],[1,3],[2,1],[2,2],[3,2]],
    ],
  },
  {
    id: "ST1",
    label: "Small Triangle 1",
    color: "#f39c12",
    rotations: [
      [[0,0],[0,1],[1,0]],
      [[0,0],[1,0],[1,1]],
      [[0,1],[1,0],[1,1]],
      [[0,0],[0,1],[1,1]],
    ],
  },
  {
    id: "ST2",
    label: "Small Triangle 2",
    color: "#8e44ad",
    rotations: [
      [[0,0],[0,1],[1,1]],
      [[0,0],[1,0],[1,1]],
      [[0,0],[0,1],[1,0]],
      [[0,0],[0,1],[1,1]],
    ],
  },
  {
    id: "SQ",
    label: "Square",
    color: "#16a085",
    rotations: [
      [[0,0],[0,1],[1,0],[1,1]],
      [[0,0],[0,1],[1,0],[1,1]],
      [[0,0],[0,1],[1,0],[1,1]],
      [[0,0],[0,1],[1,0],[1,1]],
    ],
  },
  {
    id: "PA",
    label: "Parallelogram",
    color: "#d35400",
    rotations: [
      [[0,1],[0,2],[1,0],[1,1]],
      [[0,0],[1,0],[1,1],[2,1]],
      [[0,1],[0,2],[1,0],[1,1]],
      [[0,0],[1,0],[1,1],[2,1]],
    ],
  },
];

export interface TargetPuzzle {
  name: string;
  // Piece placements: id -> [rotation, startRow, startCol]
  solution: Record<PieceId, [number, number, number]>;
  // Filled cells (pre-computed from solution)
  outline: [number, number][];
}

// Pre-designed target puzzles
const PUZZLES: TargetPuzzle[] = [
  {
    name: "Simple Rectangle",
    solution: {
      LT1: [0, 0, 0],
      LT2: [1, 0, 4],
      MT:  [0, 4, 0],
      ST1: [0, 4, 4],
      ST2: [2, 5, 4],
      SQ:  [0, 4, 5],
      PA:  [0, 5, 5],
    },
    outline: [],
  },
  {
    name: "House Shape",
    solution: {
      LT1: [0, 0, 0],
      LT2: [1, 0, 4],
      MT:  [2, 4, 0],
      ST1: [0, 4, 4],
      ST2: [1, 5, 4],
      SQ:  [0, 5, 6],
      PA:  [1, 6, 6],
    },
    outline: [],
  },
  {
    name: "Diamond",
    solution: {
      LT1: [0, 0, 3],
      LT2: [2, 4, 3],
      MT:  [1, 0, 1],
      ST1: [0, 3, 0],
      ST2: [1, 3, 6],
      SQ:  [0, 4, 1],
      PA:  [0, 4, 4],
    },
    outline: [],
  },
];

// Compute outline for each puzzle
for (const puzzle of PUZZLES) {
  const cells = new Set<string>();
  for (const [pieceId, [rotation, startRow, startCol]] of Object.entries(puzzle.solution) as [PieceId, [number, number, number]][]) {
    const piece = PIECE_DEFS.find(p => p.id === pieceId)!;
    const rot = piece.rotations[rotation]!;
    for (const [dr, dc] of rot) {
      cells.add(`${startRow + dr},${startCol + dc}`);
    }
  }
  puzzle.outline = [...cells].map(k => k.split(",").map(Number) as [number, number]);
}

export interface PlacedPiece {
  id: PieceId;
  rotation: number;
  row: number;
  col: number;
}

export interface TangramState {
  puzzleIndex: number;
  puzzle: TargetPuzzle;
  placedPieces: PlacedPiece[];
  selectedPiece: PieceId | null;
  selectedRotation: number;
  won: boolean;
  score: number;
}

export type TangramAction =
  | { type: "selectPiece"; pieceId: PieceId }
  | { type: "rotate" }
  | { type: "placePiece"; row: number; col: number }
  | { type: "removePiece"; pieceId: PieceId };

export function getPieceDef(id: PieceId): PieceDef {
  return PIECE_DEFS.find(p => p.id === id)!;
}

export const ALL_PIECES: PieceId[] = PIECE_DEFS.map(p => p.id);

function getCells(pieceId: PieceId, rotation: number, row: number, col: number): [number, number][] {
  const def = getPieceDef(pieceId);
  const rot = def.rotations[rotation % def.rotations.length]!;
  return rot.map(([dr, dc]) => [row + dr, col + dc]);
}

function hasOverlap(cells: [number, number][], placed: PlacedPiece[], excludeId?: PieceId): boolean {
  const occupied = new Set<string>();
  for (const p of placed) {
    if (p.id === excludeId) continue;
    for (const [r, c] of getCells(p.id, p.rotation, p.row, p.col)) {
      occupied.add(`${r},${c}`);
    }
  }
  for (const [r, c] of cells) {
    if (occupied.has(`${r},${c}`)) return true;
    if (r < 0 || r >= 10 || c < 0 || c >= 10) return true;
  }
  return false;
}

function checkWin(placed: PlacedPiece[], puzzle: TargetPuzzle): boolean {
  if (placed.length !== ALL_PIECES.length) return false;
  const placedCells = new Set<string>();
  for (const p of placed) {
    for (const [r, c] of getCells(p.id, p.rotation, p.row, p.col)) {
      placedCells.add(`${r},${c}`);
    }
  }
  const outlineSet = new Set(puzzle.outline.map(([r, c]) => `${r},${c}`));
  if (placedCells.size !== outlineSet.size) return false;
  for (const key of placedCells) {
    if (!outlineSet.has(key)) return false;
  }
  return true;
}

export function initialState(seed: number): TangramState {
  const rng = mulberry32(seed);
  const puzzleIndex = Math.floor(rng() * PUZZLES.length);
  const puzzle = PUZZLES[puzzleIndex]!;
  return {
    puzzleIndex,
    puzzle,
    placedPieces: [],
    selectedPiece: "LT1",
    selectedRotation: 0,
    won: false,
    score: 0,
  };
}

export function reducer(state: TangramState, action: TangramAction): TangramState {
  if (state.won) return state;

  switch (action.type) {
    case "selectPiece": {
      if (state.placedPieces.some(p => p.id === action.pieceId)) return state;
      return { ...state, selectedPiece: action.pieceId, selectedRotation: 0 };
    }
    case "rotate": {
      return { ...state, selectedRotation: (state.selectedRotation + 1) % 4 };
    }
    case "placePiece": {
      if (!state.selectedPiece) return state;
      const cells = getCells(state.selectedPiece, state.selectedRotation, action.row, action.col);
      if (hasOverlap(cells, state.placedPieces)) return state;
      const placed: PlacedPiece = { id: state.selectedPiece, rotation: state.selectedRotation, row: action.row, col: action.col };
      const placedPieces = [...state.placedPieces.filter(p => p.id !== state.selectedPiece), placed];
      const won = checkWin(placedPieces, state.puzzle);
      // Auto-select next unplaced piece
      const placedIds = new Set(placedPieces.map(p => p.id));
      const nextPiece = ALL_PIECES.find(id => !placedIds.has(id)) ?? null;
      return { ...state, placedPieces, selectedPiece: nextPiece, selectedRotation: 0, won, score: won ? 500 : 0 };
    }
    case "removePiece": {
      const placedPieces = state.placedPieces.filter(p => p.id !== action.pieceId);
      return { ...state, placedPieces, selectedPiece: action.pieceId, selectedRotation: 0 };
    }
  }
}

export function isTerminal(state: TangramState): { score: number } | null {
  if (state.won) return { score: state.score };
  return null;
}

export { getCells };
