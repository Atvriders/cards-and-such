import { minimax } from "../../engines/grid/minimax.js";

// Seega — Ancient Egyptian strategy game
// 5x5 board, center square always empty
// Phase 1: drop 2 pieces per turn (not on center) until 12 each placed
// Phase 2: move 1 piece orthogonally; capture by custodian (enemy sandwiched between 2 of yours)
// Win: capture all opponent pieces OR opponent has no moves

export const SIZE = 5;
export const CENTER = 12; // index of center (2,2)
export const TOTAL_CELLS = 25;
export const PIECES_PER_PLAYER = 12;

export type Cell = "P" | "B" | null;

export interface SeegaSettings {
  dummy?: string;
}

export interface SeegaState {
  board: Cell[];
  pHand: number;
  bHand: number;
  turn: "P" | "B";
  phase: "place" | "move";
  placeBuf: number | null; // first placement this turn
  winner: "P" | "B" | null;
  rngSeed: number;
  settings: SeegaSettings;
  selected: number | null;
}

export type SeegaAction =
  | { type: "place"; pos: number }
  | { type: "select"; pos: number }
  | { type: "moveTo"; pos: number };

function idx(r: number, c: number): number { return r * SIZE + c; }
function coord(i: number): [number, number] { return [Math.floor(i / SIZE), i % SIZE]; }

function ortho(i: number): number[] {
  const [r, c] = coord(i);
  const ns: number[] = [];
  if (r > 0) ns.push(idx(r-1, c));
  if (r < SIZE-1) ns.push(idx(r+1, c));
  if (c > 0) ns.push(idx(r, c-1));
  if (c < SIZE-1) ns.push(idx(r, c+1));
  return ns;
}

export function initialState(seed: number, settings: SeegaSettings): SeegaState {
  return {
    board: new Array(TOTAL_CELLS).fill(null),
    pHand: PIECES_PER_PLAYER,
    bHand: PIECES_PER_PLAYER,
    turn: "P",
    phase: "place",
    placeBuf: null,
    winner: null,
    rngSeed: seed,
    settings,
    selected: null,
  };
}

// Check custodian captures: after moving piece to `to`, check all 4 directions
function applyCustodianCaptures(board: Cell[], to: number, mover: Cell): Cell[] {
  const b = [...board];
  const opp = mover === "P" ? "B" : "P";
  const [r, c] = coord(to);
  const dirs: [number, number][] = [[-1,0],[1,0],[0,-1],[0,1]];
  for (const [dr, dc] of dirs) {
    const mr = r + dr, mc = c + dc;
    const fr = r + 2*dr, fc = c + 2*dc;
    if (mr < 0 || mr >= SIZE || mc < 0 || mc >= SIZE) continue;
    if (fr < 0 || fr >= SIZE || fc < 0 || fc >= SIZE) continue;
    const midIdx = idx(mr, mc);
    const farIdx = idx(fr, fc);
    if (b[midIdx] === opp && b[farIdx] === mover) {
      b[midIdx] = null; // capture
    }
  }
  return b;
}

export function countPieces(board: Cell[], player: Cell): number {
  return board.filter((c) => c === player).length;
}

function getLegalMovesFrom(board: Cell[], pos: number): number[] {
  return ortho(pos).filter((n) => board[n] === null && n !== CENTER);
}

function hasAnyMove(board: Cell[], player: Cell): boolean {
  for (let i = 0; i < TOTAL_CELLS; i++) {
    if (board[i] !== player) continue;
    if (getLegalMovesFrom(board, i).length > 0) return true;
  }
  return false;
}

// ----- Bot -----

interface BotState {
  board: Cell[];
  turn: "P" | "B";
}

type BotMove = { from: number; to: number };

function getBotMoves(s: BotState): BotMove[] {
  const moves: BotMove[] = [];
  for (let from = 0; from < TOTAL_CELLS; from++) {
    if (s.board[from] !== s.turn) continue;
    for (const to of getLegalMovesFrom(s.board, from)) {
      moves.push({ from, to });
    }
  }
  return moves;
}

function applyBotMove(s: BotState, m: BotMove): BotState {
  const board = [...s.board];
  board[m.to] = s.turn;
  board[m.from] = null;
  const captured = applyCustodianCaptures(board, m.to, s.turn);
  return { board: captured, turn: s.turn === "P" ? "B" : "P" };
}

function evaluate(s: BotState): number {
  const b = countPieces(s.board, "B");
  const p = countPieces(s.board, "P");
  return (b - p) * 10;
}

function runBot(state: SeegaState): SeegaState {
  const bs: BotState = { board: state.board, turn: "B" };
  const result = minimax<BotState, BotMove>(bs, {
    depth: 3,
    moves: getBotMoves,
    apply: applyBotMove,
    isTerminal: (s) => !hasAnyMove(s.board, s.turn) || countPieces(s.board, s.turn) === 0,
    evaluate,
    maximizing: (s) => s.turn === "B",
  });
  if (!result.move) {
    // Bot has no moves — player wins
    return { ...state, winner: "P" };
  }
  const applied = applyBotMove(bs, result.move);

  let winner: "P" | "B" | null = null;
  if (countPieces(applied.board, "P") === 0) winner = "B";
  else if (!hasAnyMove(applied.board, "P")) winner = "B";

  return {
    ...state,
    board: applied.board,
    pHand: state.pHand,
    bHand: state.bHand,
    turn: "P",
    phase: "move",
    selected: null,
    winner,
  };
}

// Place bot 2 pieces
function runBotPlace(state: SeegaState): SeegaState {
  const board = [...state.board];
  let bHand = state.bHand;
  let placed = 0;
  for (let i = 0; i < TOTAL_CELLS && placed < 2; i++) {
    if (board[i] === null && i !== CENTER) {
      board[i] = "B";
      bHand--;
      placed++;
    }
  }
  const newPhase = state.pHand === 0 && bHand === 0 ? "move" : "place";
  return { ...state, board, bHand, turn: "P", phase: newPhase, placeBuf: null };
}

export function reducer(state: SeegaState, action: SeegaAction): SeegaState {
  if (state.winner !== null) return state;
  if (state.turn !== "P") return state;

  // Place phase
  if (state.phase === "place") {
    if (action.type !== "place") return state;
    if (action.pos === CENTER) return state;
    if (state.board[action.pos] !== null) return state;
    if (state.pHand <= 0) return state;

    const board = [...state.board];
    board[action.pos] = "P";
    const pHand = state.pHand - 1;

    if (state.placeBuf === null) {
      // First of 2 placements
      return { ...state, board, pHand, placeBuf: action.pos };
    } else {
      // Second placement — hand to bot
      const bPlaceState: SeegaState = { ...state, board, pHand, placeBuf: null };
      return runBotPlace(bPlaceState);
    }
  }

  // Move phase
  if (action.type === "select") {
    if (state.board[action.pos] !== "P") return state;
    return { ...state, selected: action.pos };
  }
  if (action.type === "moveTo") {
    if (state.selected === null) return state;
    if (!getLegalMovesFrom(state.board, state.selected).includes(action.pos)) return state;
    const board = [...state.board];
    board[action.pos] = "P";
    board[state.selected] = null;
    const newBoard = applyCustodianCaptures(board, action.pos, "P");

    let winner: "P" | "B" | null = null;
    if (countPieces(newBoard, "B") === 0) winner = "P";
    else if (!hasAnyMove(newBoard, "B")) winner = "P";

    let next: SeegaState = { ...state, board: newBoard, turn: "B", selected: null, winner };
    if (!winner) next = runBot(next);
    return next;
  }

  return state;
}

export function isTerminal(state: SeegaState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === "P") return { score: 100 };
  return { score: 0 };
}
