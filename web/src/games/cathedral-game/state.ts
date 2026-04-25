import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Cathedral: territory game on 10×10 board.
// Players place polyomino-like "buildings" to claim territory.
// We implement a simplified version: players place tetrominoes/trominoes.
// First, the "cathedral" (5-cell cross) is placed in the center.
// Then players alternate placing their pieces.
// Player with more territory after all pieces placed wins.
//
// Simplified piece set: each player has 6 pieces (tromino L, tromino I, tetromino L, tetromino T, tetromino S, tetromino I).
// Pieces can be rotated. No flipping for simplicity.

export const BOARD = 10;
export const TOTAL = BOARD * BOARD; // 100 cells

export type CellOwner = "cathedral" | "p0" | "p1" | null;

// Piece shapes (relative offsets from anchor [0,0])
export type Shape = Array<[number, number]>;

export interface Piece {
  name: string;
  shape: Shape;
}

// All rotations of a shape (0, 90, 180, 270 degrees)
function rotate90(shape: Shape): Shape {
  return shape.map(([r, c]) => [c, -r] as [number, number]);
}

function normalise(shape: Shape): Shape {
  const minR = Math.min(...shape.map(([r]) => r));
  const minC = Math.min(...shape.map(([, c]) => c));
  return shape.map(([r, c]) => [r - minR, c - minC] as [number, number]);
}

function shapeKey(shape: Shape): string {
  return normalise([...shape].sort((a, b) => a[0] - b[0] || a[1] - b[1])).map(([r, c]) => `${r},${c}`).join("|");
}

function allRotations(shape: Shape): Shape[] {
  const seen = new Set<string>();
  const result: Shape[] = [];
  let s = shape;
  for (let i = 0; i < 4; i++) {
    const norm = normalise(s);
    const key = shapeKey(norm);
    if (!seen.has(key)) { seen.add(key); result.push(norm); }
    s = rotate90(s);
  }
  return result;
}

export const BASE_PIECES: Piece[] = [
  { name: "i2", shape: [[0,0],[0,1]] },
  { name: "i3", shape: [[0,0],[0,1],[0,2]] },
  { name: "l3", shape: [[0,0],[1,0],[1,1]] },
  { name: "i4", shape: [[0,0],[0,1],[0,2],[0,3]] },
  { name: "l4", shape: [[0,0],[1,0],[2,0],[2,1]] },
  { name: "t4", shape: [[0,0],[0,1],[0,2],[1,1]] },
];

export interface PieceState {
  pieceIdx: number;
  rotation: number; // 0-3
  placed: boolean;
}

export interface CathedralSettings { dummy?: string; }

export interface CathedralState {
  board: readonly CellOwner[];
  p0Pieces: readonly PieceState[];
  p1Pieces: readonly PieceState[];
  turn: 0 | 1;
  winner: 0 | 1 | "draw" | null;
  rngSeed: number;
  settings: CathedralSettings;
  phase: "cathedral" | "play" | "done";
  selectedPiece: number | null; // index into current player's pieces
  selectedRotation: number;
}

export type CathedralAction =
  | { type: "selectPiece"; idx: number }
  | { type: "rotatePiece" }
  | { type: "place"; row: number; col: number };

function makePieces(): PieceState[] {
  return BASE_PIECES.map((_, i) => ({ pieceIdx: i, rotation: 0, placed: false }));
}

const CATHEDRAL_SHAPE: Shape = [[0,0],[1,0],[-1,0],[0,1],[0,-1]]; // cross

function placeCathedral(board: CellOwner[]): void {
  const cr = 4, cc = 4; // center-ish (offset to fit in 10x10)
  for (const [dr, dc] of CATHEDRAL_SHAPE) {
    const r = cr + dr, c = cc + dc;
    if (r >= 0 && r < BOARD && c >= 0 && c < BOARD) board[r * BOARD + c] = "cathedral";
  }
}

export function initialState(seed: number, settings: CathedralSettings): CathedralState {
  const board: CellOwner[] = new Array(TOTAL).fill(null);
  placeCathedral(board);
  return {
    board,
    p0Pieces: makePieces(),
    p1Pieces: makePieces(),
    turn: 0,
    winner: null,
    rngSeed: seed,
    settings,
    phase: "play",
    selectedPiece: null,
    selectedRotation: 0,
  };
}

export function getShape(pieceIdx: number, rotation: number): Shape {
  const base = BASE_PIECES[pieceIdx]!.shape;
  const rots = allRotations(base);
  return rots[rotation % rots.length]!;
}

export function canPlace(board: readonly CellOwner[], shape: Shape, row: number, col: number, owner: CellOwner): boolean {
  for (const [dr, dc] of shape) {
    const r = row + dr, c = col + dc;
    if (r < 0 || r >= BOARD || c < 0 || c >= BOARD) return false;
    if (board[r * BOARD + c] !== null) return false;
  }
  return true;
}

function placeShape(board: CellOwner[], shape: Shape, row: number, col: number, owner: CellOwner): void {
  for (const [dr, dc] of shape) board[(row + dr) * BOARD + col + dc] = owner;
}

function countTerritory(board: readonly CellOwner[]): { p0: number; p1: number } {
  let p0 = 0, p1 = 0;
  for (const c of board) {
    if (c === "p0") p0++;
    else if (c === "p1") p1++;
  }
  return { p0, p1 };
}

function allPassed(p0: readonly PieceState[], p1: readonly PieceState[]): boolean {
  return p0.every((p) => p.placed) && p1.every((p) => p.placed);
}

function botMove(state: CathedralState, rng: () => number): CathedralState {
  const pieces = state.turn === 0 ? state.p0Pieces : state.p1Pieces;
  const owner: CellOwner = state.turn === 0 ? "p0" : "p1";
  const available = pieces.map((p, i) => ({ ...p, i })).filter((p) => !p.placed);
  if (available.length === 0) return { ...state };

  // Try pieces in random order, pick first that fits
  const shuffled = [...available].sort(() => rng() - 0.5);
  for (const ps of shuffled) {
    const shape = getShape(ps.pieceIdx, ps.rotation);
    const rots = allRotations(BASE_PIECES[ps.pieceIdx]!.shape);
    for (let rot = 0; rot < rots.length; rot++) {
      const s = rots[rot]!;
      for (let r = 0; r < BOARD; r++) {
        for (let c = 0; c < BOARD; c++) {
          if (canPlace(state.board, s, r, c, owner)) {
            // Place it
            const newBoard = [...state.board] as CellOwner[];
            placeShape(newBoard, s, r, c, owner);
            const newPieces = [...(state.turn === 0 ? state.p0Pieces : state.p1Pieces)] as PieceState[];
            newPieces[ps.i] = { ...newPieces[ps.i]!, placed: true };
            const p0p = state.turn === 0 ? newPieces : state.p0Pieces;
            const p1p = state.turn === 0 ? state.p1Pieces : newPieces;
            const rng2 = mulberry32(state.rngSeed);
            const ns = Math.floor(rng2() * 2 ** 31);
            if (allPassed(p0p, p1p)) {
              const { p0, p1 } = countTerritory(newBoard);
              const winner = p0 > p1 ? 0 : p1 > p0 ? 1 : "draw";
              return { ...state, rngSeed: ns, board: newBoard, p0Pieces: p0p, p1Pieces: p1p, winner, phase: "done" };
            }
            const nextTurn = (state.turn === 0 ? 1 : 0) as 0 | 1;
            return { ...state, rngSeed: ns, board: newBoard, p0Pieces: p0p, p1Pieces: p1p, turn: nextTurn, selectedPiece: null, selectedRotation: 0 };
          }
        }
      }
    }
  }
  // Bot can't place: skip turn
  const nextTurn = (state.turn === 0 ? 1 : 0) as 0 | 1;
  const rng2 = mulberry32(state.rngSeed);
  const ns = Math.floor(rng2() * 2 ** 31);
  return { ...state, rngSeed: ns, turn: nextTurn };
}

export function reducer(state: CathedralState, action: CathedralAction): CathedralState {
  if (state.winner !== null || state.phase === "done") return state;
  if (state.turn !== 0) return state; // only player actions

  if (action.type === "selectPiece") {
    const pieces = state.p0Pieces;
    if (action.idx < 0 || action.idx >= pieces.length) return state;
    if (pieces[action.idx]!.placed) return state;
    return { ...state, selectedPiece: action.idx, selectedRotation: 0 };
  }

  if (action.type === "rotatePiece") {
    if (state.selectedPiece === null) return state;
    return { ...state, selectedRotation: (state.selectedRotation + 1) % 4 };
  }

  if (action.type === "place") {
    if (state.selectedPiece === null) return state;
    const ps = state.p0Pieces[state.selectedPiece]!;
    const shape = getShape(ps.pieceIdx, state.selectedRotation);
    const owner: CellOwner = "p0";
    if (!canPlace(state.board, shape, action.row, action.col, owner)) return state;

    const rng = mulberry32(state.rngSeed);
    const ns = Math.floor(rng() * 2 ** 31);
    const newBoard = [...state.board] as CellOwner[];
    placeShape(newBoard, shape, action.row, action.col, owner);
    const newP0 = [...state.p0Pieces] as PieceState[];
    newP0[state.selectedPiece] = { ...ps, placed: true };

    if (allPassed(newP0, state.p1Pieces)) {
      const { p0, p1 } = countTerritory(newBoard);
      const winner = p0 > p1 ? 0 : p1 > p0 ? 1 : "draw";
      return { ...state, rngSeed: ns, board: newBoard, p0Pieces: newP0, winner, phase: "done", selectedPiece: null };
    }

    let next: CathedralState = { ...state, rngSeed: ns, board: newBoard, p0Pieces: newP0, turn: 1, selectedPiece: null, selectedRotation: 0 };

    // Bot plays
    const rng2 = mulberry32(next.rngSeed);
    next = botMove(next, rng2);
    return next;
  }

  return state;
}

export function isTerminal(state: CathedralState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === 0) return { score: 100 };
  if (state.winner === "draw") return { score: 50 };
  return { score: 0 };
}
