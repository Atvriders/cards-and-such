import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Agon — 6×6×6 hexagonal board (91 hexes), two players
// Player pieces: 1 Queen + 6 Guards each
// Goal: move your Queen to the centre hex (0,0,0 in cube coords)
//       all 6 Guard pieces must surround the centre before/when queen arrives
// Simplified: 7×7 offset grid approximation mapped to hex connectivity
// Player = "white" (human), Bot = "black"
// Each piece moves 1 step to any adjacent hex; pieces cannot jump.
// Bot: random legal move (depth-0 AI)

// We represent Agon on a 6-ring hexagonal board (radius 5) in axial coords.
// Cells: q in [-5..5], r in [-5..5], with |q+r| <= 5 (hex grid constraint)
// For simplicity, encode cell as { q, r }

export interface Cell {
  q: number;
  r: number;
}

export type PieceType = "queen" | "guard";
export type Color = "white" | "black";

export interface Piece {
  type: PieceType;
  color: Color;
}

export type Board = Map<string, Piece>;

export interface AgonSettings {
  opponent: "bot";
}

export interface AgonState {
  settings: AgonSettings;
  rngSeed: number;
  board: Board;
  turn: Color;
  selected: Cell | null;
  winner: Color | null;
}

export type AgonAction =
  | { type: "select"; cell: Cell }
  | { type: "move"; to: Cell };

// ----- Hex utilities -----

export function cellKey(c: Cell): string {
  return `${c.q},${c.r}`;
}

function parseKey(k: string): Cell {
  const [q, r] = k.split(",").map(Number);
  return { q: q!, r: r! };
}

function inBounds(c: Cell): boolean {
  const s = -c.q - c.r;
  return Math.abs(c.q) <= 5 && Math.abs(c.r) <= 5 && Math.abs(s) <= 5;
}

const HEX_DIRS: Cell[] = [
  { q: 1, r: 0 }, { q: -1, r: 0 },
  { q: 0, r: 1 }, { q: 0, r: -1 },
  { q: 1, r: -1 }, { q: -1, r: 1 },
];

export function hexNeighbors(c: Cell): Cell[] {
  return HEX_DIRS.map((d) => ({ q: c.q + d.q, r: c.r + d.r })).filter(inBounds);
}

// ----- Initialisation -----

export function initialState(seed: number, settings: AgonSettings): AgonState {
  const board: Board = new Map();

  // White pieces on outer ring (r=5 row equivalent) near top
  // Queen at top centre; guards surrounding
  // Place white: queen at (0, -5), guards around outer edge
  const whitePlacements: { cell: Cell; type: PieceType }[] = [
    { cell: { q: 0, r: -5 }, type: "queen" },
    { cell: { q: 1, r: -5 }, type: "guard" },
    { cell: { q: -1, r: -5 }, type: "guard" },
    { cell: { q: 2, r: -5 }, type: "guard" },
    { cell: { q: -2, r: -5 }, type: "guard" },
    { cell: { q: 3, r: -5 }, type: "guard" },
    { cell: { q: -3, r: -5 }, type: "guard" },
  ];

  const blackPlacements: { cell: Cell; type: PieceType }[] = [
    { cell: { q: 0, r: 5 }, type: "queen" },
    { cell: { q: 1, r: 5 }, type: "guard" },
    { cell: { q: -1, r: 5 }, type: "guard" },
    { cell: { q: 2, r: 4 }, type: "guard" },
    { cell: { q: -2, r: 4 }, type: "guard" },
    { cell: { q: 3, r: 3 }, type: "guard" },
    { cell: { q: -3, r: 3 }, type: "guard" },
  ];

  for (const { cell, type } of whitePlacements) {
    board.set(cellKey(cell), { type, color: "white" });
  }
  for (const { cell, type } of blackPlacements) {
    board.set(cellKey(cell), { type, color: "black" });
  }

  return {
    settings,
    rngSeed: seed,
    board,
    turn: "white",
    selected: null,
    winner: null,
  };
}

// ----- Win check -----

const CENTRE: Cell = { q: 0, r: 0 };

function checkWin(board: Board, color: Color): boolean {
  const centreKey = cellKey(CENTRE);
  const centrePiece = board.get(centreKey);
  if (!centrePiece || centrePiece.color !== color || centrePiece.type !== "queen") return false;

  // All 6 neighbours of centre must have guards of same color
  const neighbours = hexNeighbors(CENTRE);
  return neighbours.every((n) => {
    const p = board.get(cellKey(n));
    return p && p.color === color && p.type === "guard";
  });
}

// ----- Legal moves -----

export function legalMoves(board: Board, color: Color): Array<{ from: Cell; to: Cell }> {
  const moves: Array<{ from: Cell; to: Cell }> = [];
  for (const [key, piece] of board) {
    if (piece.color !== color) continue;
    const from = parseKey(key);
    for (const nb of hexNeighbors(from)) {
      const toKey = cellKey(nb);
      const target = board.get(toKey);
      if (!target) {
        moves.push({ from, to: nb });
      }
    }
  }
  return moves;
}

// ----- Apply move -----

function applyMove(board: Board, from: Cell, to: Cell): Board {
  const newBoard = new Map(board);
  const piece = newBoard.get(cellKey(from))!;
  newBoard.delete(cellKey(from));
  newBoard.set(cellKey(to), piece);
  return newBoard;
}

// ----- Bot (random legal move) -----

function runBot(state: AgonState): AgonState {
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const moves = legalMoves(state.board, "black");
  if (moves.length === 0) return { ...state, rngSeed: nextSeed, winner: "white" };

  const move = moves[Math.floor(rng() * moves.length)]!;
  const newBoard = applyMove(state.board, move.from, move.to);
  const winner = checkWin(newBoard, "black") ? "black" : null;

  return {
    ...state,
    rngSeed: nextSeed,
    board: newBoard,
    turn: "white",
    selected: null,
    winner,
  };
}

// ----- Reducer -----

export function reducer(state: AgonState, action: AgonAction): AgonState {
  if (state.winner !== null) return state;

  if (action.type === "select") {
    const piece = state.board.get(cellKey(action.cell));
    if (!piece || piece.color !== state.turn) return state;
    return { ...state, selected: action.cell };
  }

  if (action.type === "move") {
    if (state.selected === null) return state;
    const moves = legalMoves(state.board, state.turn);
    const valid = moves.find(
      (m) =>
        m.from.q === state.selected!.q &&
        m.from.r === state.selected!.r &&
        m.to.q === action.to.q &&
        m.to.r === action.to.r,
    );
    if (!valid) return state;

    const newBoard = applyMove(state.board, state.selected, action.to);
    const winnerCheck = checkWin(newBoard, "white") ? "white" : null;
    if (winnerCheck) {
      return { ...state, board: newBoard, winner: "white", selected: null };
    }

    const afterPlayer: AgonState = {
      ...state,
      board: newBoard,
      turn: "black",
      selected: null,
    };

    return runBot(afterPlayer);
  }

  return state;
}

// ----- isTerminal -----

export function isTerminal(state: AgonState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === "white" ? 20 : 0 };
}
