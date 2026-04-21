import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { minimax } from "../../engines/grid/minimax.js";

// Mancala (Kalah) board layout:
// Pits 0-5: player 0 side (left to right)
// Store 6: player 0 store
// Pits 7-12: player 1 side (left to right, from player 1's perspective = right to left on board)
// Store 13: player 1 store
// Total 14 slots

export const PLAYER0_PITS = [0, 1, 2, 3, 4, 5] as const;
export const PLAYER0_STORE = 6;
export const PLAYER1_PITS = [7, 8, 9, 10, 11, 12] as const;
export const PLAYER1_STORE = 13;
export const TOTAL_SLOTS = 14;

// Opposite pit mapping for captures
const OPPOSITE: ReadonlyArray<number> = [12, 11, 10, 9, 8, 7, -1, -1, 0, 1, 2, 3, 4, 5];

export interface MancalaSettings {
  dummy?: string;
}

export interface MancalaState {
  board: readonly number[]; // seeds in each slot
  turn: 0 | 1;
  winner: 0 | 1 | "draw" | null;
  rngSeed: number;
  settings: MancalaSettings;
  lastMove: number | null;
}

export type MancalaAction = { type: "sow"; pit: number };

function myPits(seat: 0 | 1): readonly number[] {
  return seat === 0 ? PLAYER0_PITS : PLAYER1_PITS;
}

function myStore(seat: 0 | 1): number {
  return seat === 0 ? PLAYER0_STORE : PLAYER1_STORE;
}

function oppStore(seat: 0 | 1): number {
  return seat === 0 ? PLAYER1_STORE : PLAYER0_STORE;
}

export function initialState(seed: number, settings: MancalaSettings): MancalaState {
  const board = new Array(TOTAL_SLOTS).fill(0) as number[];
  for (const p of PLAYER0_PITS) board[p] = 4;
  for (const p of PLAYER1_PITS) board[p] = 4;
  return { board, turn: 0, winner: null, rngSeed: seed, settings, lastMove: null };
}

function isGameOver(board: readonly number[]): boolean {
  const p0Empty = PLAYER0_PITS.every((p) => board[p] === 0);
  const p1Empty = PLAYER1_PITS.every((p) => board[p] === 0);
  return p0Empty || p1Empty;
}

function finalizeBoard(board: number[]): number[] {
  const b = [...board];
  // Collect remaining seeds to respective stores
  for (const p of PLAYER0_PITS) { b[PLAYER0_STORE] = (b[PLAYER0_STORE] ?? 0) + (b[p] ?? 0); b[p] = 0; }
  for (const p of PLAYER1_PITS) { b[PLAYER1_STORE] = (b[PLAYER1_STORE] ?? 0) + (b[p] ?? 0); b[p] = 0; }
  return b;
}

function computeWinner(board: readonly number[]): 0 | 1 | "draw" | null {
  const p0 = board[PLAYER0_STORE]!;
  const p1 = board[PLAYER1_STORE]!;
  if (p0 > p1) return 0;
  if (p1 > p0) return 1;
  return "draw";
}

function applySow(board: readonly number[], pit: number, seat: 0 | 1): { board: number[]; extraTurn: boolean } {
  const b = [...board];
  let seeds = b[pit]!;
  b[pit] = 0;
  let pos = pit;
  const skip = oppStore(seat);

  while (seeds > 0) {
    pos = (pos + 1) % TOTAL_SLOTS;
    if (pos === skip) continue; // skip opponent's store
    b[pos]! += 1;
    seeds--;
  }

  // Extra turn if last seed landed in own store
  const extraTurn = pos === myStore(seat);

  // Capture: last seed in own empty pit (was 1 after adding, now check)
  if (!extraTurn && b[pos] === 1 && myPits(seat).includes(pos as typeof PLAYER0_PITS[number])) {
    const oppPos = OPPOSITE[pos]!;
    if (oppPos >= 0 && (b[oppPos] ?? 0) > 0) {
      b[myStore(seat)] = (b[myStore(seat)] ?? 0) + (b[pos] ?? 0) + (b[oppPos] ?? 0);
      b[pos] = 0;
      b[oppPos] = 0;
    }
  }

  return { board: b, extraTurn };
}

interface BotSearchState {
  board: readonly number[];
  turn: 0 | 1;
}

function validPits(s: BotSearchState): number[] {
  return myPits(s.turn).filter((p) => s.board[p]! > 0);
}

function applyBotSow(s: BotSearchState, pit: number): BotSearchState {
  const { board, extraTurn } = applySow(s.board, pit, s.turn);
  if (isGameOver(board)) {
    const final = finalizeBoard(board);
    return { board: final, turn: s.turn };
  }
  const opp = (s.turn === 0 ? 1 : 0) as 0 | 1;
  return { board, turn: extraTurn ? s.turn : opp };
}

function evaluateBot(s: BotSearchState): number {
  // Bot is seat 1 (maximizer)
  return s.board[PLAYER1_STORE]! - s.board[PLAYER0_STORE]!;
}

function getBotMove(state: MancalaState): number | null {
  const bs: BotSearchState = { board: state.board, turn: state.turn };
  const result = minimax<BotSearchState, number>(bs, {
    depth: 4,
    moves: validPits,
    apply: applyBotSow,
    isTerminal: (s) => isGameOver(s.board) || validPits(s).length === 0,
    evaluate: evaluateBot,
    maximizing: (s) => s.turn === 1,
  });
  return result.move;
}

function runBotMoves(state: MancalaState): MancalaState {
  let s = state;
  let limit = 20;
  while (s.winner === null && s.turn === 1 && limit-- > 0) {
    const move = getBotMove(s);
    if (move === null) break;
    s = applyPlayerMove(s, move, false);
  }
  return s;
}

function applyPlayerMove(state: MancalaState, pit: number, triggerBot: boolean): MancalaState {
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  const { board: newBoard, extraTurn } = applySow(state.board, pit, state.turn);
  const opp = (state.turn === 0 ? 1 : 0) as 0 | 1;

  if (isGameOver(newBoard)) {
    const finalBoard = finalizeBoard([...newBoard]);
    const winner = computeWinner(finalBoard);
    return { ...state, rngSeed: nextSeed, board: finalBoard, winner, lastMove: pit };
  }

  const nextTurn = extraTurn ? state.turn : opp;
  let next: MancalaState = { ...state, rngSeed: nextSeed, board: newBoard, turn: nextTurn, lastMove: pit };

  if (triggerBot && next.winner === null && next.turn === 1) {
    next = runBotMoves(next);
  }
  return next;
}

export function reducer(state: MancalaState, action: MancalaAction): MancalaState {
  if (action.type !== "sow") return state;
  if (state.winner !== null) return state;
  if (state.turn !== 0) return state; // Only player 0 actions from UI

  const pit = action.pit;
  if (!PLAYER0_PITS.includes(pit as typeof PLAYER0_PITS[number])) return state;
  if (state.board[pit] === 0) return state;

  return applyPlayerMove(state, pit, true);
}

export function isTerminal(state: MancalaState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === 0) return { score: 100 };
  if (state.winner === "draw") return { score: 50 };
  return { score: 0 };
}
