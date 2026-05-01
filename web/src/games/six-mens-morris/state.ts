// Six Men's Morris: smaller variant. 16 intersections (two concentric squares with mid-side connections),
// 6 men each. No diagonal mills. Standard placing/moving phases. No flying.
//
// Position layout (16 points):
// Outer square: 0..7 starting top-left, clockwise. Inner square: 8..15 starting top-left, clockwise.
// Mid-side connections cross from outer-mid to inner-mid (1↔9, 3↔11, 5↔13, 7↔15).
//
// Outer:
//   0  1  2
//   7     3
//   6  5  4
// Inner:
//   8  9 10
//  15    11
//  14 13 12

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const POINTS = 16;

export const ADJACENCY: ReadonlyArray<readonly number[]> = [
  [1, 7],          // 0
  [0, 2, 9],       // 1 (connects through to inner mid 9)
  [1, 3],          // 2
  [2, 4, 11],      // 3
  [3, 5],          // 4
  [4, 6, 13],      // 5
  [5, 7],          // 6
  [6, 0, 15],      // 7
  [9, 15],         // 8
  [8, 10, 1],      // 9
  [9, 11],         // 10
  [10, 12, 3],     // 11
  [11, 13],        // 12
  [12, 14, 5],     // 13
  [13, 15],        // 14
  [14, 8, 7],      // 15
];

export const MILLS: ReadonlyArray<readonly [number, number, number]> = [
  // Outer rows/cols
  [0, 1, 2], [2, 3, 4], [4, 5, 6], [6, 7, 0],
  // Inner
  [8, 9, 10], [10, 11, 12], [12, 13, 14], [14, 15, 8],
];

const REAL_MILLS = MILLS;

export type Cell = 0 | 1 | null;
export type Phase = "placing" | "moving";

export interface SixMorrisSettings {
  botStrength: "easy" | "hard";
}

export interface GameState {
  board: ReadonlyArray<Cell>;
  turn: 0 | 1;
  phase: [Phase, Phase];
  piecesToPlace: [number, number];
  piecesOnBoard: [number, number];
  mustRemove: boolean;
  selectedPos: number | null;
  winner: 0 | 1 | null;
  rngSeed: number;
  settings: SixMorrisSettings;
}

export type GameAction =
  | { type: "place"; pos: number }
  | { type: "remove"; pos: number }
  | { type: "select"; pos: number }
  | { type: "move"; to: number };

export function formsNewMill(board: ReadonlyArray<Cell>, pos: number, seat: 0 | 1): boolean {
  return REAL_MILLS.some(([a, b, c]) => {
    const m = [a, b, c];
    if (!m.includes(pos)) return false;
    return m.every((p) => board[p] === seat);
  });
}

function inMill(board: ReadonlyArray<Cell>, pos: number, seat: 0 | 1): boolean {
  return REAL_MILLS.some(([a, b, c]) =>
    [a, b, c].includes(pos) && board[a] === seat && board[b] === seat && board[c] === seat
  );
}

export function canRemove(board: ReadonlyArray<Cell>, pos: number, opp: 0 | 1): boolean {
  if (board[pos] !== opp) return false;
  if (!inMill(board, pos, opp)) return true;
  const hasFree = board.some((cell, i) => cell === opp && !inMill(board, i, opp));
  return !hasFree;
}

function getPhase(toPlace: number): Phase {
  return toPlace > 0 ? "placing" : "moving";
}

function legalMovesFor(board: ReadonlyArray<Cell>, seat: 0 | 1): Array<{ from: number; to: number }> {
  const out: Array<{ from: number; to: number }> = [];
  for (let i = 0; i < POINTS; i++) {
    if (board[i] !== seat) continue;
    for (const t of ADJACENCY[i]!) {
      if (board[t] === null) out.push({ from: i, to: t });
    }
  }
  return out;
}

function checkWinner(s: GameState): 0 | 1 | null {
  for (const seat of [0, 1] as const) {
    const opp: 0 | 1 = seat === 0 ? 1 : 0;
    if (s.piecesToPlace[seat] === 0 && s.piecesOnBoard[seat] < 3) return opp;
    if (getPhase(s.piecesToPlace[seat]) === "moving") {
      if (s.turn === seat && legalMovesFor(s.board, seat).length === 0 && !s.mustRemove) return opp;
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
  const opp: 0 | 1 = seat === 0 ? 1 : 0;
  if (s.mustRemove) {
    return s.board
      .map((_, i) => i)
      .filter((i) => canRemove(s.board, i, opp))
      .map((i) => ({ type: "remove" as const, pos: i }));
  }
  if (getPhase(s.piecesToPlace[seat]) === "placing") {
    return s.board
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => c === null)
      .map(({ i }) => ({ type: "place" as const, pos: i }));
  }
  return legalMovesFor(s.board, seat).map((m) => ({ type: "move" as const, from: m.from, to: m.to }));
}

function applyBot(s: BotState, mv: BotMove): BotState {
  const seat = s.turn;
  const opp: 0 | 1 = seat === 0 ? 1 : 0;
  const board = [...s.board] as Cell[];
  if (mv.type === "remove") {
    board[mv.pos] = null;
    const pob: [number, number] = [...s.piecesOnBoard];
    pob[opp] -= 1;
    return { board, turn: opp, piecesToPlace: s.piecesToPlace, piecesOnBoard: pob, mustRemove: false };
  }
  if (mv.type === "place") {
    board[mv.pos] = seat;
    const ptp: [number, number] = [...s.piecesToPlace];
    ptp[seat] -= 1;
    const pob: [number, number] = [...s.piecesOnBoard];
    pob[seat] += 1;
    const mill = formsNewMill(board, mv.pos, seat);
    return { board, turn: mill ? seat : opp, piecesToPlace: ptp, piecesOnBoard: pob, mustRemove: mill };
  }
  board[mv.from] = null;
  board[mv.to] = seat;
  const mill = formsNewMill(board, mv.to, seat);
  return { board, turn: mill ? seat : opp, piecesToPlace: s.piecesToPlace, piecesOnBoard: s.piecesOnBoard, mustRemove: mill };
}

function evaluate(s: BotState): number {
  const bot = s.board.filter((c) => c === 1).length + s.piecesToPlace[1];
  const player = s.board.filter((c) => c === 0).length + s.piecesToPlace[0];
  let mills0 = 0, mills1 = 0;
  for (const [a, b, c] of REAL_MILLS) {
    if (s.board[a] === 0 && s.board[b] === 0 && s.board[c] === 0) mills0++;
    if (s.board[a] === 1 && s.board[b] === 1 && s.board[c] === 1) mills1++;
  }
  if (s.piecesToPlace[0] === 0 && s.board.filter((c) => c === 0).length < 3) return 1000;
  if (s.piecesToPlace[1] === 0 && s.board.filter((c) => c === 1).length < 3) return -1000;
  return (bot - player) * 10 + (mills1 - mills0) * 8;
}

function botPick(s: BotState, strength: "easy" | "hard"): BotMove | null {
  const moves = botMoves(s);
  if (moves.length === 0) return null;
  if (strength === "easy") {
    for (const m of moves) {
      const after = applyBot(s, m);
      if (after.mustRemove && after.turn === s.turn) return m;
    }
    return moves[0]!;
  }
  let best: BotMove = moves[0]!;
  let bs = -Infinity;
  for (const m of moves) {
    const after = applyBot(s, m);
    const v = evaluate(after);
    if (v > bs) { bs = v; best = m; }
  }
  return best;
}

export function initialState(seed: number, settings: SixMorrisSettings): GameState {
  return {
    board: new Array(POINTS).fill(null) as Cell[],
    turn: 0,
    phase: ["placing", "placing"],
    piecesToPlace: [6, 6],
    piecesOnBoard: [0, 0],
    mustRemove: false,
    selectedPos: null,
    winner: null,
    rngSeed: seed,
    settings,
  };
}

function applyBotMoveToState(state: GameState, move: BotMove): GameState {
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const seat = state.turn;
  const opp: 0 | 1 = seat === 0 ? 1 : 0;
  const board = [...state.board] as Cell[];
  if (move.type === "remove") {
    board[move.pos] = null;
    const pob: [number, number] = [...state.piecesOnBoard];
    pob[opp] -= 1;
    const next: GameState = { ...state, rngSeed: nextSeed, board, turn: opp, piecesOnBoard: pob, mustRemove: false };
    next.phase = [getPhase(next.piecesToPlace[0]), getPhase(next.piecesToPlace[1])];
    return { ...next, winner: checkWinner(next) };
  }
  if (move.type === "place") {
    board[move.pos] = seat;
    const ptp: [number, number] = [...state.piecesToPlace];
    ptp[seat] -= 1;
    const pob: [number, number] = [...state.piecesOnBoard];
    pob[seat] += 1;
    const mill = formsNewMill(board, move.pos, seat);
    const next: GameState = {
      ...state, rngSeed: nextSeed, board, turn: mill ? seat : opp,
      piecesToPlace: ptp, piecesOnBoard: pob, mustRemove: mill, selectedPos: null,
    };
    next.phase = [getPhase(next.piecesToPlace[0]), getPhase(next.piecesToPlace[1])];
    return { ...next, winner: checkWinner(next) };
  }
  board[move.from] = null;
  board[move.to] = seat;
  const mill = formsNewMill(board, move.to, seat);
  const next: GameState = {
    ...state, rngSeed: nextSeed, board, turn: mill ? seat : opp,
    mustRemove: mill, selectedPos: null,
  };
  next.phase = [getPhase(next.piecesToPlace[0]), getPhase(next.piecesToPlace[1])];
  return { ...next, winner: checkWinner(next) };
}

function runBot(state: GameState): GameState {
  let s = state;
  let limit = 6;
  while (s.winner === null && s.turn === 1 && limit-- > 0) {
    const bs: BotState = {
      board: s.board, turn: s.turn,
      piecesToPlace: s.piecesToPlace,
      piecesOnBoard: s.piecesOnBoard,
      mustRemove: s.mustRemove,
    };
    const mv = botPick(bs, s.settings.botStrength);
    if (!mv) break;
    s = applyBotMoveToState(s, mv);
  }
  return s;
}

export function reducer(state: GameState, action: GameAction): GameState {
  if (state.winner !== null) return state;
  const seat = state.turn;
  const opp: 0 | 1 = seat === 0 ? 1 : 0;
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  if (action.type === "remove") {
    if (!state.mustRemove) return state;
    if (!canRemove(state.board, action.pos, opp)) return state;
    const board = [...state.board] as Cell[];
    board[action.pos] = null;
    const pob: [number, number] = [...state.piecesOnBoard];
    pob[opp] -= 1;
    let next: GameState = { ...state, rngSeed: nextSeed, board, turn: opp, piecesOnBoard: pob, mustRemove: false };
    next.phase = [getPhase(next.piecesToPlace[0]), getPhase(next.piecesToPlace[1])];
    next = { ...next, winner: checkWinner(next) };
    if (next.winner === null) next = runBot(next);
    return next;
  }

  if (action.type === "place") {
    if (state.phase[seat] !== "placing") return state;
    if (state.board[action.pos] !== null) return state;
    const board = [...state.board] as Cell[];
    board[action.pos] = seat;
    const ptp: [number, number] = [...state.piecesToPlace];
    ptp[seat] -= 1;
    const pob: [number, number] = [...state.piecesOnBoard];
    pob[seat] += 1;
    const mill = formsNewMill(board, action.pos, seat);
    let next: GameState = {
      ...state, rngSeed: nextSeed, board, turn: mill ? seat : opp,
      piecesToPlace: ptp, piecesOnBoard: pob, mustRemove: mill, selectedPos: null,
    };
    next.phase = [getPhase(next.piecesToPlace[0]), getPhase(next.piecesToPlace[1])];
    next = { ...next, winner: checkWinner(next) };
    if (next.winner === null && !next.mustRemove) next = runBot(next);
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
    if (!ADJACENCY[from]!.includes(action.to)) return state;
    const board = [...state.board] as Cell[];
    board[from] = null;
    board[action.to] = seat;
    const mill = formsNewMill(board, action.to, seat);
    let next: GameState = {
      ...state, rngSeed: nextSeed, board, turn: mill ? seat : opp,
      mustRemove: mill, selectedPos: null,
    };
    next.phase = [getPhase(next.piecesToPlace[0]), getPhase(next.piecesToPlace[1])];
    next = { ...next, winner: checkWinner(next) };
    if (next.winner === null && !next.mustRemove) next = runBot(next);
    return next;
  }

  return state;
}

export function isTerminal(state: GameState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === 0) return { score: 100 };
  return { score: 0 };
}

export { REAL_MILLS };
