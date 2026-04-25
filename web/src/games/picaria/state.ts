import { minimax } from "../../engines/grid/minimax.js";

// Picaria — Pueblo/Zuni tic-tac-toe variant
// 9-point grid with diagonals allowed on the center cross intersections
// Each player has 3 pieces. Place all 3, then slide. Win = 3 in a row.

// Position layout (3x3 grid, positions 0-8):
// 0 1 2
// 3 4 5
// 6 7 8

// Adjacency includes diagonals only through center (position 4)
export const ADJACENCY: ReadonlyArray<readonly number[]> = [
  [1, 3, 4],       // 0: right, down, diagonal
  [0, 2, 4],       // 1: left, right, down
  [1, 4, 5],       // 2: left, down, diagonal
  [0, 4, 6],       // 3: up, down, diagonal-right
  [0, 1, 2, 3, 5, 6, 7, 8], // 4: center connects to all
  [2, 4, 8],       // 5: up, center, diagonal
  [3, 4, 7],       // 6: up, right, diagonal
  [4, 6, 8],       // 7: up, left, right
  [4, 5, 7],       // 8: left, up, diagonal
];

// Winning lines (rows, cols, 2 diagonals)
export const WIN_LINES: ReadonlyArray<readonly [number, number, number]> = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

export type Cell = "P" | "B" | null;

export interface PicariaSettings {
  dummy?: string;
}

export interface PicariaState {
  board: Cell[];
  pPlaced: number; // how many P placed so far (max 3)
  bPlaced: number;
  turn: "P" | "B";
  selected: number | null; // for move phase
  winner: "P" | "B" | "draw" | null;
  rngSeed: number;
  settings: PicariaSettings;
}

export type PicariaAction =
  | { type: "place"; pos: number }
  | { type: "select"; pos: number }
  | { type: "moveTo"; pos: number };

export function initialState(seed: number, settings: PicariaSettings): PicariaState {
  return {
    board: new Array(9).fill(null),
    pPlaced: 0,
    bPlaced: 0,
    turn: "P",
    selected: null,
    winner: null,
    rngSeed: seed,
    settings,
  };
}

export function checkWinner(board: Cell[]): "P" | "B" | "draw" | null {
  for (const [a, b, c] of WIN_LINES) {
    const v = board[a] ?? null;
    if (v !== null && board[b] === v && board[c] === v) return v as "P" | "B";
  }
  return null;
}

function isPlacingPhase(placed: number): boolean { return placed < 3; }

interface BotState {
  board: Cell[];
  pPlaced: number;
  bPlaced: number;
  turn: "P" | "B";
}

type BotMove = { kind: "place"; pos: number } | { kind: "move"; from: number; to: number };

function getBotMoves(s: BotState): BotMove[] {
  if (isPlacingPhase(s.turn === "P" ? s.pPlaced : s.bPlaced)) {
    return s.board
      .map((c, i) => (c === null ? i : -1))
      .filter((i) => i >= 0)
      .map((pos) => ({ kind: "place" as const, pos }));
  }
  const moves: BotMove[] = [];
  for (let from = 0; from < 9; from++) {
    if (s.board[from] !== s.turn) continue;
    for (const to of ADJACENCY[from]!) {
      if (s.board[to] === null) moves.push({ kind: "move", from, to });
    }
  }
  return moves;
}

function applyBotMove(s: BotState, m: BotMove): BotState {
  const board = [...s.board];
  let { pPlaced, bPlaced } = s;
  if (m.kind === "place") {
    board[m.pos] = s.turn;
    if (s.turn === "P") pPlaced++;
    else bPlaced++;
  } else {
    board[m.to] = s.turn;
    board[m.from] = null;
  }
  return { board, pPlaced, bPlaced, turn: s.turn === "P" ? "B" : "P" };
}

function evaluate(s: BotState): number {
  const w = checkWinner(s.board);
  if (w === "B") return 1000;
  if (w === "P") return -1000;
  // Count threats
  let bThreats = 0, pThreats = 0;
  for (const [a, b, c] of WIN_LINES) {
    const vals = [s.board[a], s.board[b], s.board[c]];
    if (vals.filter((v) => v === "B").length === 2 && vals.includes(null)) bThreats++;
    if (vals.filter((v) => v === "P").length === 2 && vals.includes(null)) pThreats++;
  }
  return bThreats - pThreats;
}

function runBot(state: PicariaState): PicariaState {
  const bs: BotState = { board: state.board, pPlaced: state.pPlaced, bPlaced: state.bPlaced, turn: "B" };
  const result = minimax<BotState, BotMove>(bs, {
    depth: 5,
    moves: getBotMoves,
    apply: applyBotMove,
    isTerminal: (s) => checkWinner(s.board) !== null || getBotMoves(s).length === 0,
    evaluate,
    maximizing: (s) => s.turn === "B",
  });
  if (!result.move) return state;
  const applied = applyBotMove(bs, result.move);
  const winner = checkWinner(applied.board);
  return {
    ...state,
    board: applied.board,
    pPlaced: applied.pPlaced,
    bPlaced: applied.bPlaced,
    turn: "P",
    selected: null,
    winner,
  };
}

export function reducer(state: PicariaState, action: PicariaAction): PicariaState {
  if (state.winner !== null) return state;
  if (state.turn !== "P") return state;

  const placing = isPlacingPhase(state.pPlaced);

  if (placing) {
    if (action.type !== "place") return state;
    if (state.board[action.pos] !== null) return state;
    const board = [...state.board];
    board[action.pos] = "P";
    const pPlaced = state.pPlaced + 1;
    const winner = checkWinner(board);
    if (winner) return { ...state, board, pPlaced, winner };
    let next: PicariaState = { ...state, board, pPlaced, turn: "B" };
    next = runBot(next);
    return next;
  }

  // Move phase
  if (action.type === "select") {
    if (state.board[action.pos] !== "P") return state;
    return { ...state, selected: action.pos };
  }
  if (action.type === "moveTo") {
    if (state.selected === null) return state;
    if (state.board[action.pos] !== null) return state;
    if (!ADJACENCY[state.selected]!.includes(action.pos)) return state;
    const board = [...state.board];
    board[action.pos] = "P";
    board[state.selected] = null;
    const winner = checkWinner(board);
    if (winner) return { ...state, board, selected: null, winner };
    let next: PicariaState = { ...state, board, turn: "B", selected: null };
    next = runBot(next);
    return next;
  }

  return state;
}

export function isTerminal(state: PicariaState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === "P") return { score: 100 };
  if (state.winner === "draw") return { score: 50 };
  return { score: 0 };
}
