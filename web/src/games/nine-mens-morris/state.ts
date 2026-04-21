import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { minimax } from "../../engines/grid/minimax.js";

// Nine Men's Morris uses 24 intersections. Positions 0-23 on a specific topology.
// Three concentric squares:
// Outer: 0-7, Middle: 8-15, Inner: 16-23
//
// Outer square corners & edges (clockwise from top-left):
//   0   1   2
//   7   .   3
//   6   5   4
//
// Middle:
//   8   9   10
//  15   .   11
//  14  13   12
//
// Inner:
//  16  17  18
//  23   .  19
//  22  21  20

// Adjacency list (hard-coded)
export const ADJACENCY: ReadonlyArray<readonly number[]> = [
  [1, 7],       // 0
  [0, 2, 9],    // 1
  [1, 3],       // 2
  [2, 4, 11],   // 3
  [3, 5],       // 4
  [4, 6, 13],   // 5
  [5, 7],       // 6
  [6, 0, 15],   // 7
  [9, 15],      // 8
  [8, 10, 1, 17], // 9
  [9, 11],      // 10
  [10, 12, 3, 19], // 11
  [11, 13],     // 12
  [12, 14, 5, 21], // 13
  [13, 15],     // 14
  [14, 8, 7, 23], // 15
  [17, 23],     // 16
  [16, 18, 9],  // 17
  [17, 19],     // 18
  [18, 20, 11], // 19
  [19, 21],     // 20
  [20, 22, 13], // 21
  [21, 23],     // 22
  [22, 16, 15], // 23
];

// All mill lines (3 positions that form a mill)
export const MILLS: ReadonlyArray<readonly [number, number, number]> = [
  // Outer square rows/cols
  [0, 1, 2], [2, 3, 4], [4, 5, 6], [6, 7, 0],
  // Middle square
  [8, 9, 10], [10, 11, 12], [12, 13, 14], [14, 15, 8],
  // Inner square
  [16, 17, 18], [18, 19, 20], [20, 21, 22], [22, 23, 16],
  // Cross connections
  [1, 9, 17], [3, 11, 19], [5, 13, 21], [7, 15, 23],
];

export type Cell = 0 | 1 | null; // seat 0 = player, seat 1 = bot

export type Phase = "placing" | "moving" | "flying";

export interface MorrisSettings {
  // no settings needed
  dummy?: string;
}

export interface MorrisState {
  board: ReadonlyArray<Cell>;
  turn: 0 | 1;
  phase: [Phase, Phase]; // phase[0] for player 0, phase[1] for player 1
  piecesToPlace: [number, number];
  piecesOnBoard: [number, number];
  mustRemove: boolean; // after forming a mill, must remove opponent piece
  selectedPos: number | null; // for moving phase: selected position to move from
  winner: 0 | 1 | null;
  rngSeed: number;
  settings: MorrisSettings;
}

export type MorrisAction =
  | { type: "place"; pos: number }
  | { type: "remove"; pos: number }
  | { type: "select"; pos: number }
  | { type: "move"; to: number };

export function initialState(seed: number, settings: MorrisSettings): MorrisState {
  return {
    board: new Array(24).fill(null) as Cell[],
    turn: 0,
    phase: ["placing", "placing"],
    piecesToPlace: [9, 9],
    piecesOnBoard: [0, 0],
    mustRemove: false,
    selectedPos: null,
    winner: null,
    rngSeed: seed,
    settings,
  };
}

export function formsNewMill(board: ReadonlyArray<Cell>, pos: number, seat: 0 | 1): boolean {
  return MILLS.some(([a, b, c]) => {
    const mill = [a, b, c];
    if (!mill.includes(pos)) return false;
    return mill.every((p) => board[p] === seat);
  });
}

export function countMills(board: ReadonlyArray<Cell>, seat: 0 | 1): number {
  return MILLS.filter(([a, b, c]) => board[a] === seat && board[b] === seat && board[c] === seat).length;
}

export function canRemove(board: ReadonlyArray<Cell>, pos: number, opp: 0 | 1): boolean {
  if (board[pos] !== opp) return false;
  // Can always remove if not in a mill; if all are in mills, can remove from any
  const inMill = MILLS.some(([a, b, c]) => [a, b, c].includes(pos) && board[a] === opp && board[b] === opp && board[c] === opp);
  if (!inMill) return true;
  // check if there are any pieces NOT in mills
  const hasFreePiece = board.some((cell, i) => {
    if (cell !== opp) return false;
    return !MILLS.some(([a, b, c]) => [a, b, c].includes(i) && board[a] === opp && board[b] === opp && board[c] === opp);
  });
  return !hasFreePiece; // can only remove from mill if no free pieces
}

function getPhase(piecesToPlace: number, piecesOnBoard: number): Phase {
  if (piecesToPlace > 0) return "placing";
  if (piecesOnBoard <= 3) return "flying";
  return "moving";
}

function checkWinner(state: MorrisState): 0 | 1 | null {
  // Lose if < 3 pieces on board (and placing phase done)
  for (const seat of [0, 1] as const) {
    if (state.piecesToPlace[seat] === 0 && state.piecesOnBoard[seat] < 3) {
      return seat === 0 ? 1 : 0;
    }
    // Lose if no legal moves in moving phase
    if (getPhase(state.piecesToPlace[seat], state.piecesOnBoard[seat]) === "moving") {
      const hasMoves = state.board.some((cell, pos) => {
        if (cell !== seat) return false;
        return ADJACENCY[pos]!.some((adj) => state.board[adj] === null);
      });
      if (!hasMoves) return seat === 0 ? 1 : 0;
    }
  }
  return null;
}

interface BotState {
  board: ReadonlyArray<Cell>;
  turn: 0 | 1;
  piecesToPlace: [number, number];
  piecesOnBoard: [number, number];
  mustRemove: boolean;
}

type BotMove =
  | { type: "place"; pos: number }
  | { type: "remove"; pos: number }
  | { type: "move"; from: number; to: number };

function botMoves(s: BotState): BotMove[] {
  const seat = s.turn;
  const opp = seat === 0 ? 1 : 0;

  if (s.mustRemove) {
    return s.board
      .map((cell, i) => ({ cell, i }))
      .filter(({ i }) => canRemove(s.board, i, opp))
      .map(({ i }) => ({ type: "remove" as const, pos: i }));
  }

  const phase = getPhase(s.piecesToPlace[seat], s.piecesOnBoard[seat]);
  if (phase === "placing") {
    return s.board
      .map((cell, i) => ({ cell, i }))
      .filter(({ cell }) => cell === null)
      .map(({ i }) => ({ type: "place" as const, pos: i }));
  }
  // moving or flying
  const isFlying = phase === "flying";
  const moves: BotMove[] = [];
  for (let from = 0; from < 24; from++) {
    if (s.board[from] !== seat) continue;
    const targets = isFlying ? s.board.map((c, i) => i).filter((i) => s.board[i] === null) : ADJACENCY[from]!.filter((i) => s.board[i] === null);
    for (const to of targets) {
      moves.push({ type: "move", from, to });
    }
  }
  return moves;
}

function applyBotMove(s: BotState, move: BotMove): BotState {
  const seat = s.turn;
  const opp = seat === 0 ? 1 : 0;
  const board = [...s.board] as Cell[];

  if (move.type === "remove") {
    board[move.pos] = null;
    return {
      board,
      turn: opp,
      piecesToPlace: s.piecesToPlace,
      piecesOnBoard: [
        opp === 0 ? s.piecesOnBoard[0] - 1 : s.piecesOnBoard[0],
        opp === 1 ? s.piecesOnBoard[1] - 1 : s.piecesOnBoard[1],
      ],
      mustRemove: false,
    };
  }

  if (move.type === "place") {
    board[move.pos] = seat;
    const mill = formsNewMill(board, move.pos, seat);
    return {
      board,
      turn: mill ? seat : opp,
      piecesToPlace: [
        seat === 0 ? s.piecesToPlace[0] - 1 : s.piecesToPlace[0],
        seat === 1 ? s.piecesToPlace[1] - 1 : s.piecesToPlace[1],
      ],
      piecesOnBoard: [
        seat === 0 ? s.piecesOnBoard[0] + 1 : s.piecesOnBoard[0],
        seat === 1 ? s.piecesOnBoard[1] + 1 : s.piecesOnBoard[1],
      ],
      mustRemove: mill,
    };
  }

  // move
  board[move.from] = null;
  board[move.to] = seat;
  const mill = formsNewMill(board, move.to, seat);
  return {
    board,
    turn: mill ? seat : opp,
    piecesToPlace: s.piecesToPlace,
    piecesOnBoard: s.piecesOnBoard,
    mustRemove: mill,
  };
}

function evaluateBot(s: BotState): number {
  // bot = seat 1 (maximizer)
  const botPieces = s.board.filter((c) => c === 1).length + s.piecesToPlace[1];
  const playerPieces = s.board.filter((c) => c === 0).length + s.piecesToPlace[0];
  const botMills = countMills(s.board, 1);
  const playerMills = countMills(s.board, 0);
  // Lose states
  if (s.piecesToPlace[0] === 0 && playerPieces < 3) return 1000;
  if (s.piecesToPlace[1] === 0 && botPieces < 3) return -1000;
  return (botPieces - playerPieces) * 10 + (botMills - playerMills) * 5;
}

function botIsTerminal(s: BotState): boolean {
  const botPieces = s.board.filter((c) => c === 1).length + s.piecesToPlace[1];
  const playerPieces = s.board.filter((c) => c === 0).length + s.piecesToPlace[0];
  if (s.piecesToPlace[0] === 0 && playerPieces < 3) return true;
  if (s.piecesToPlace[1] === 0 && botPieces < 3) return true;
  return botMoves(s).length === 0;
}

function chooseBotMove(state: MorrisState, rng: () => number): void {
  const bs: BotState = {
    board: state.board,
    turn: state.turn,
    piecesToPlace: state.piecesToPlace,
    piecesOnBoard: state.piecesOnBoard,
    mustRemove: state.mustRemove,
  };

  const result = minimax<BotState, BotMove>(bs, {
    depth: 3,
    moves: botMoves,
    apply: applyBotMove,
    isTerminal: botIsTerminal,
    evaluate: evaluateBot,
    maximizing: (s) => s.turn === 1,
  });

  // We use this for side effect - return the best move
  void result;
  void rng;
}

// Return bot's chosen move
function getBotMove(state: MorrisState): BotMove | null {
  const bs: BotState = {
    board: state.board,
    turn: state.turn,
    piecesToPlace: state.piecesToPlace,
    piecesOnBoard: state.piecesOnBoard,
    mustRemove: state.mustRemove,
  };

  const result = minimax<BotState, BotMove>(bs, {
    depth: 3,
    moves: botMoves,
    apply: applyBotMove,
    isTerminal: botIsTerminal,
    evaluate: evaluateBot,
    maximizing: (s) => s.turn === 1,
  });

  return result.move;
}

function applyBotMoveToState(state: MorrisState, move: BotMove): MorrisState {
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const seat = state.turn as 0 | 1;
  const opp = (seat === 0 ? 1 : 0) as 0 | 1;
  const board = [...state.board] as Cell[];

  if (move.type === "remove") {
    board[move.pos] = null;
    const newPiecesOnBoard: [number, number] = [...state.piecesOnBoard] as [number, number];
    newPiecesOnBoard[opp] -= 1;
    const next: MorrisState = {
      ...state,
      rngSeed: nextSeed,
      board,
      turn: opp,
      piecesOnBoard: newPiecesOnBoard,
      mustRemove: false,
    };
    // Update phases
    next.phase = [getPhase(next.piecesToPlace[0], next.piecesOnBoard[0]), getPhase(next.piecesToPlace[1], next.piecesOnBoard[1])];
    const w = checkWinner(next);
    return { ...next, winner: w };
  }

  if (move.type === "place") {
    board[move.pos] = seat;
    const newPiecesToPlace: [number, number] = [...state.piecesToPlace] as [number, number];
    newPiecesToPlace[seat] -= 1;
    const newPiecesOnBoard: [number, number] = [...state.piecesOnBoard] as [number, number];
    newPiecesOnBoard[seat] += 1;
    const mill = formsNewMill(board, move.pos, seat);
    const next: MorrisState = {
      ...state,
      rngSeed: nextSeed,
      board,
      turn: mill ? seat : opp,
      piecesToPlace: newPiecesToPlace,
      piecesOnBoard: newPiecesOnBoard,
      mustRemove: mill,
      selectedPos: null,
    };
    next.phase = [getPhase(next.piecesToPlace[0], next.piecesOnBoard[0]), getPhase(next.piecesToPlace[1], next.piecesOnBoard[1])];
    const w = checkWinner(next);
    return { ...next, winner: w };
  }

  // move type
  board[move.from] = null;
  board[move.to] = seat;
  const mill = formsNewMill(board, move.to, seat);
  const next: MorrisState = {
    ...state,
    rngSeed: nextSeed,
    board,
    turn: mill ? seat : opp,
    mustRemove: mill,
    selectedPos: null,
  };
  next.phase = [getPhase(next.piecesToPlace[0], next.piecesOnBoard[0]), getPhase(next.piecesToPlace[1], next.piecesOnBoard[1])];
  const w = checkWinner(next);
  return { ...next, winner: w };
}

// After a player move, if it's bot's turn, run bot moves until it's player's turn or game over
function runBotMoves(state: MorrisState): MorrisState {
  let s = state;
  let limit = 10;
  while (s.winner === null && s.turn === 1 && limit-- > 0) {
    const move = getBotMove(s);
    if (!move) break;
    s = applyBotMoveToState(s, move);
  }
  return s;
}

export function reducer(state: MorrisState, action: MorrisAction): MorrisState {
  if (state.winner !== null) return state;

  const seat = state.turn as 0 | 1;
  const opp = (seat === 0 ? 1 : 0) as 0 | 1;
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  if (action.type === "remove") {
    if (!state.mustRemove) return state;
    if (!canRemove(state.board, action.pos, opp)) return state;

    const board = [...state.board] as Cell[];
    board[action.pos] = null;
    const newPiecesOnBoard: [number, number] = [...state.piecesOnBoard] as [number, number];
    newPiecesOnBoard[opp] -= 1;
    let next: MorrisState = {
      ...state,
      rngSeed: nextSeed,
      board,
      turn: opp,
      piecesOnBoard: newPiecesOnBoard,
      mustRemove: false,
    };
    next.phase = [getPhase(next.piecesToPlace[0], next.piecesOnBoard[0]), getPhase(next.piecesToPlace[1], next.piecesOnBoard[1])];
    const w = checkWinner(next);
    next = { ...next, winner: w };
    if (next.winner === null) next = runBotMoves(next);
    return next;
  }

  if (action.type === "place") {
    if (state.phase[seat] !== "placing") return state;
    if (state.board[action.pos] !== null) return state;

    const board = [...state.board] as Cell[];
    board[action.pos] = seat;
    const newPiecesToPlace: [number, number] = [...state.piecesToPlace] as [number, number];
    newPiecesToPlace[seat] -= 1;
    const newPiecesOnBoard: [number, number] = [...state.piecesOnBoard] as [number, number];
    newPiecesOnBoard[seat] += 1;
    const mill = formsNewMill(board, action.pos, seat);
    let next: MorrisState = {
      ...state,
      rngSeed: nextSeed,
      board,
      turn: mill ? seat : opp,
      piecesToPlace: newPiecesToPlace,
      piecesOnBoard: newPiecesOnBoard,
      mustRemove: mill,
      selectedPos: null,
    };
    next.phase = [getPhase(next.piecesToPlace[0], next.piecesOnBoard[0]), getPhase(next.piecesToPlace[1], next.piecesOnBoard[1])];
    const w = checkWinner(next);
    next = { ...next, winner: w };
    if (next.winner === null && !next.mustRemove) next = runBotMoves(next);
    return next;
  }

  if (action.type === "select") {
    if (state.phase[seat] === "placing") return state;
    if (state.board[action.pos] !== seat) return state;
    return { ...state, selectedPos: action.pos };
  }

  if (action.type === "move") {
    if (state.phase[seat] === "placing") return state;
    if (state.selectedPos === null) return state;
    const from = state.selectedPos;
    if (state.board[from] !== seat) return state;
    if (state.board[action.to] !== null) return state;

    const phase = state.phase[seat];
    if (phase !== "flying" && !ADJACENCY[from]!.includes(action.to)) return state;

    const board = [...state.board] as Cell[];
    board[from] = null;
    board[action.to] = seat;
    const mill = formsNewMill(board, action.to, seat);
    let next: MorrisState = {
      ...state,
      rngSeed: nextSeed,
      board,
      turn: mill ? seat : opp,
      mustRemove: mill,
      selectedPos: null,
    };
    next.phase = [getPhase(next.piecesToPlace[0], next.piecesOnBoard[0]), getPhase(next.piecesToPlace[1], next.piecesOnBoard[1])];
    const w = checkWinner(next);
    next = { ...next, winner: w };
    if (next.winner === null && !next.mustRemove) next = runBotMoves(next);
    return next;
  }

  return state;
}

export function isTerminal(state: MorrisState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === 0) return { score: 100 };
  return { score: 0 };
}

// suppress unused warning
void chooseBotMove;
