import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Kalah: 6 pits per side + 1 store each = 14 slots
// Differs from basic mancala: NO capture rule, but extra-turn rule remains.
// P0 pits: 0-5, store: 6; P1 pits: 7-12, store: 13

export const P0_PITS = [0, 1, 2, 3, 4, 5] as const;
export const P0_STORE = 6;
export const P1_PITS = [7, 8, 9, 10, 11, 12] as const;
export const P1_STORE = 13;
export const SLOTS = 14;
// Each pit starts with 6 seeds (pure Kalah variant)
const SEEDS_PER_PIT = 6;

export interface KalahSettings {
  dummy?: string;
}

export interface KalahState {
  board: readonly number[];
  turn: 0 | 1;
  winner: 0 | 1 | "draw" | null;
  rngSeed: number;
  settings: KalahSettings;
  lastMove: number | null;
}

export type KalahAction = { type: "sow"; pit: number };

export function initialState(seed: number, settings: KalahSettings): KalahState {
  const board = new Array<number>(SLOTS).fill(0);
  for (const p of P0_PITS) board[p] = SEEDS_PER_PIT;
  for (const p of P1_PITS) board[p] = SEEDS_PER_PIT;
  return { board, turn: 0, winner: null, rngSeed: seed, settings, lastMove: null };
}

function myPits(seat: 0 | 1): readonly number[] {
  return seat === 0 ? P0_PITS : P1_PITS;
}
function myStore(seat: 0 | 1): number {
  return seat === 0 ? P0_STORE : P1_STORE;
}
function oppStore(seat: 0 | 1): number {
  return seat === 0 ? P1_STORE : P0_STORE;
}

function isOver(board: readonly number[]): boolean {
  return P0_PITS.every((p) => board[p] === 0) || P1_PITS.every((p) => board[p] === 0);
}

function collectRemaining(board: readonly number[]): number[] {
  const b = [...board];
  for (const p of P0_PITS) { b[P0_STORE]! += b[p]!; b[p] = 0; }
  for (const p of P1_PITS) { b[P1_STORE]! += b[p]!; b[p] = 0; }
  return b;
}

function determineWinner(board: readonly number[]): 0 | 1 | "draw" {
  if (board[P0_STORE]! > board[P1_STORE]!) return 0;
  if (board[P1_STORE]! > board[P0_STORE]!) return 1;
  return "draw";
}

function sowPit(board: readonly number[], pit: number, seat: 0 | 1): { board: number[]; extraTurn: boolean } {
  const b = [...board];
  let seeds = b[pit]!;
  b[pit] = 0;
  let pos = pit;
  const skip = oppStore(seat);
  while (seeds > 0) {
    pos = (pos + 1) % SLOTS;
    if (pos === skip) continue;
    b[pos]! += 1;
    seeds--;
  }
  const extraTurn = pos === myStore(seat);
  return { board: b, extraTurn };
}

function botScore(board: readonly number[], seat: 0 | 1): number {
  return board[myStore(seat)]! - board[oppStore(seat)]!;
}

function getBotMove(board: readonly number[], seat: 0 | 1, rng: () => number): number {
  const pits = myPits(seat).filter((p) => board[p]! > 0);
  if (pits.length === 0) return -1;
  // 1-ply: prefer moves that give extra turn, else pick highest-count pit
  let best: number | null = null;
  let bestScore = -Infinity;
  for (const p of pits) {
    const { board: nb, extraTurn } = sowPit(board, p, seat);
    const score = botScore(nb, seat) + (extraTurn ? 5 : 0) + rng() * 0.01;
    if (score > bestScore) { bestScore = score; best = p; }
  }
  return best ?? pits[0]!;
}

function applyMove(state: KalahState, pit: number, runBot: boolean): KalahState {
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const { board: nb, extraTurn } = sowPit(state.board, pit, state.turn);
  const opp = (state.turn === 0 ? 1 : 0) as 0 | 1;

  if (isOver(nb)) {
    const final = collectRemaining(nb);
    return { ...state, rngSeed: nextSeed, board: final, winner: determineWinner(final), lastMove: pit };
  }

  const nextTurn = extraTurn ? state.turn : opp;
  let next: KalahState = { ...state, rngSeed: nextSeed, board: nb, turn: nextTurn, lastMove: pit };

  if (runBot && next.winner === null && next.turn === 1) {
    let limit = 20;
    while (next.winner === null && next.turn === 1 && limit-- > 0) {
      const rng2 = mulberry32(next.rngSeed);
      const ns2 = Math.floor(rng2() * 2 ** 31);
      const bm = getBotMove(next.board, 1, rng2);
      if (bm < 0) break;
      const { board: bb, extraTurn: be } = sowPit(next.board, bm, 1);
      if (isOver(bb)) {
        const final = collectRemaining(bb);
        next = { ...next, rngSeed: ns2, board: final, winner: determineWinner(final), lastMove: bm };
        break;
      }
      const nt = be ? (1 as 0 | 1) : (0 as 0 | 1);
      next = { ...next, rngSeed: ns2, board: bb, turn: nt, lastMove: bm };
    }
  }
  return next;
}

export function reducer(state: KalahState, action: KalahAction): KalahState {
  if (action.type !== "sow") return state;
  if (state.winner !== null || state.turn !== 0) return state;
  const pit = action.pit;
  if (!(P0_PITS as readonly number[]).includes(pit)) return state;
  if (state.board[pit] === 0) return state;
  return applyMove(state, pit, true);
}

export function isTerminal(state: KalahState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === 0) return { score: 100 };
  if (state.winner === "draw") return { score: 50 };
  return { score: 0 };
}
