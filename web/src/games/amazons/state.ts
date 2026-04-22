import { minimax } from "../../engines/grid/minimax.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Game of Amazons: 10×10 board, 4 queens per player.
// Turn: move a queen (chess queen), then shoot an arrow from its new position.
// Arrows block cells permanently. Player who cannot move loses.

export type Cell = "Q0" | "Q1" | "arrow" | null;

export interface AmazonsSettings {
  dummy?: string;
}

export interface AmazonsState {
  settings: AmazonsSettings;
  board: readonly Cell[]; // 100 cells, row-major 10×10
  turn: 0 | 1; // 0 = human, 1 = bot
  // Phase within a turn (for human): select queen, move queen, shoot arrow
  phase: "selectQueen" | "moveQueen" | "shootArrow";
  selectedQueen: number | null; // position of selected queen
  movedTo: number | null; // where the queen moved
  winner: 0 | 1 | null;
  movesMade: number;
  rngSeed: number;
}

export type AmazonsAction =
  | { type: "selectQueen"; pos: number }
  | { type: "moveQueen"; pos: number }
  | { type: "shootArrow"; pos: number };

const SIZE = 10;

function posToRC(pos: number): { row: number; col: number } {
  return { row: Math.floor(pos / SIZE), col: pos % SIZE };
}
function rcToPos(row: number, col: number): number {
  return row * SIZE + col;
}

const DIRS8 = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
] as const;

// Get all reachable positions from a queen at `from`, treating `skip` as empty
function queenReach(board: readonly Cell[], from: number, skip: number | null = null): number[] {
  const { row: fr, col: fc } = posToRC(from);
  const result: number[] = [];
  for (const [dr, dc] of DIRS8) {
    let r = fr + dr;
    let c = fc + dc;
    while (r >= 0 && r < SIZE && c >= 0 && c < SIZE) {
      const pos = rcToPos(r, c);
      if (pos === skip) { r += dr; c += dc; continue; }
      if (board[pos] !== null) break;
      result.push(pos);
      r += dr;
      c += dc;
    }
  }
  return result;
}

// Count legal moves for a player
function countMoves(board: readonly Cell[], player: 0 | 1): number {
  const tag: Cell = player === 0 ? "Q0" : "Q1";
  let total = 0;
  for (let i = 0; i < 100; i++) {
    if (board[i] !== tag) continue;
    const moveTos = queenReach(board, i);
    for (const to of moveTos) {
      // After moving, count arrow shots
      const tmpBoard = board.map((c, idx) => (idx === i ? null : idx === to ? tag : c)) as Cell[];
      total += queenReach(tmpBoard, to).length;
    }
  }
  return total;
}

function evalBoard(board: readonly Cell[], forPlayer: 0 | 1): number {
  const opp: 0 | 1 = forPlayer === 0 ? 1 : 0;
  return countMoves(board, forPlayer) - countMoves(board, opp);
}

interface BotTurnMove {
  queenFrom: number;
  queenTo: number;
  arrowAt: number;
}

interface BotSearchState {
  board: readonly Cell[];
  turn: 0 | 1;
}

function getBotMove(state: AmazonsState): BotTurnMove | null {
  const result = minimax<BotSearchState, BotTurnMove>(
    { board: state.board, turn: 1 },
    {
      depth: 2,
      moves(s) {
        const tag: Cell = s.turn === 0 ? "Q0" : "Q1";
        const ms: BotTurnMove[] = [];
        for (let from = 0; from < 100; from++) {
          if (s.board[from] !== tag) continue;
          for (const to of queenReach(s.board, from)) {
            const tmp = s.board.map((c, i) => (i === from ? null : i === to ? tag : c)) as Cell[];
            for (const arrow of queenReach(tmp, to)) {
              ms.push({ queenFrom: from, queenTo: to, arrowAt: arrow });
            }
          }
        }
        return ms;
      },
      apply(s, m) {
        const tag: Cell = s.turn === 0 ? "Q0" : "Q1";
        const nb = s.board.map((c, i) => {
          if (i === m.queenFrom) return null;
          if (i === m.queenTo) return tag;
          if (i === m.arrowAt) return "arrow" as Cell;
          return c;
        }) as Cell[];
        return { board: nb, turn: (s.turn === 0 ? 1 : 0) as 0 | 1 };
      },
      isTerminal(s) {
        return countMoves(s.board, s.turn) === 0;
      },
      evaluate(s) { return evalBoard(s.board, 1); },
      maximizing(s) { return s.turn === 1; },
    }
  );
  return result.move;
}

// Standard starting positions for amazons
// Human (Q0): (0,3), (0,6), (3,0), (3,9) — top side
// Bot (Q1): (6,0), (6,9), (9,3), (9,6) — bottom side
function makeInitialBoard(): Cell[] {
  const board: Cell[] = new Array(100).fill(null);
  // Human queens at top
  board[rcToPos(0, 3)] = "Q0";
  board[rcToPos(0, 6)] = "Q0";
  board[rcToPos(3, 0)] = "Q0";
  board[rcToPos(3, 9)] = "Q0";
  // Bot queens at bottom
  board[rcToPos(6, 0)] = "Q1";
  board[rcToPos(6, 9)] = "Q1";
  board[rcToPos(9, 3)] = "Q1";
  board[rcToPos(9, 6)] = "Q1";
  return board;
}

export function initialState(seed: number, settings: AmazonsSettings): AmazonsState {
  return {
    settings,
    board: makeInitialBoard(),
    turn: 0,
    phase: "selectQueen",
    selectedQueen: null,
    movedTo: null,
    winner: null,
    movesMade: 0,
    rngSeed: seed,
  };
}

function runBot(state: AmazonsState): AmazonsState {
  let s = state;
  while (s.turn === 1 && s.winner === null) {
    const rng = mulberry32(s.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    if (countMoves(s.board, 1) === 0) {
      return { ...s, winner: 0, rngSeed: nextSeed };
    }

    const move = getBotMove(s);
    if (!move) {
      return { ...s, winner: 0, rngSeed: nextSeed };
    }

    const nb = s.board.map((c, i) => {
      if (i === move.queenFrom) return null;
      if (i === move.queenTo) return "Q1" as Cell;
      if (i === move.arrowAt) return "arrow" as Cell;
      return c;
    }) as Cell[];

    s = {
      ...s,
      board: nb,
      turn: 0,
      phase: "selectQueen",
      selectedQueen: null,
      movedTo: null,
      movesMade: s.movesMade + 1,
      rngSeed: nextSeed,
    };
    break;
  }
  return s;
}

export function reducer(state: AmazonsState, action: AmazonsAction): AmazonsState {
  if (state.winner !== null) return state;
  if (state.turn !== 0) return state; // human only

  if (action.type === "selectQueen") {
    if (state.phase !== "selectQueen") return state;
    const { pos } = action;
    if (state.board[pos] !== "Q0") return state;
    if (queenReach(state.board, pos).length === 0) return state;
    return { ...state, selectedQueen: pos, phase: "moveQueen" };
  }

  if (action.type === "moveQueen") {
    if (state.phase !== "moveQueen" || state.selectedQueen === null) return state;
    const reachable = queenReach(state.board, state.selectedQueen);
    if (!reachable.includes(action.pos)) return state;

    const nb = state.board.map((c, i) => {
      if (i === state.selectedQueen) return null;
      if (i === action.pos) return "Q0" as Cell;
      return c;
    }) as Cell[];

    return { ...state, board: nb, movedTo: action.pos, phase: "shootArrow" };
  }

  if (action.type === "shootArrow") {
    if (state.phase !== "shootArrow" || state.movedTo === null) return state;
    const reachable = queenReach(state.board, state.movedTo, state.selectedQueen);
    if (!reachable.includes(action.pos)) return state;

    const nb = state.board.map((c, i) => (i === action.pos ? "arrow" as Cell : c)) as Cell[];

    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    // Check if bot can move
    if (countMoves(nb, 1) === 0) {
      return {
        ...state,
        board: nb,
        winner: 0,
        phase: "selectQueen",
        selectedQueen: null,
        movedTo: null,
        movesMade: state.movesMade + 1,
        rngSeed: nextSeed,
      };
    }

    let next: AmazonsState = {
      ...state,
      board: nb,
      turn: 1,
      phase: "selectQueen",
      selectedQueen: null,
      movedTo: null,
      movesMade: state.movesMade + 1,
      rngSeed: nextSeed,
    };

    next = runBot(next);

    // Check if human can move after bot
    if (next.winner === null && countMoves(next.board, 0) === 0) {
      next = { ...next, winner: 1 };
    }

    return next;
  }

  return state;
}

export function isTerminal(state: AmazonsState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === 0) return { score: 100 };
  return { score: 0 };
}

export { queenReach, posToRC, rcToPos };
