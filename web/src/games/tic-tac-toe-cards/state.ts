import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Tic-Tac-Toe Cards: 3x3 board where player plays Hearts (red) and CPU plays Spades (black).
// Each placement reveals a face-up card from a shuffled deck. 3-in-a-row of suit color wins.
// On a win, the winning line's card ranks form a bonus.

export interface TicTacToeCardsSettings { dummy: boolean; }

export type Suit = "S" | "H" | "D" | "C"; // S/C = black, H/D = red
export type Rank = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export interface CardOnBoard { suit: Suit; rank: Rank; owner: "P" | "C"; }
export type Cell = CardOnBoard | null;

export interface TicTacToeCardsState {
  rngSeed: number;
  board: Cell[];
  // simple "deck": draw cards by sequence of seeded random
  turn: "P" | "C";
  result: "P" | "C" | "draw" | null;
  score: number;
  phase: "playing" | "done";
  winLine: number[] | null;
  pieces: number;
}

export type TicTacToeCardsAction = { type: "place"; idx: number };

const LINES: ReadonlyArray<readonly [number, number, number]> = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function checkWin(b: Cell[]): { winner: "P" | "C" | "draw" | null; line: number[] | null } {
  for (const [a, bi, c] of LINES) {
    const va = b[a], vb = b[bi], vc = b[c];
    if (va && vb && vc && va.owner === vb.owner && va.owner === vc.owner) {
      return { winner: va.owner, line: [a, bi, c] };
    }
  }
  if (b.every((x) => x !== null)) return { winner: "draw", line: null };
  return { winner: null, line: null };
}

export const RANK_NAMES = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"] as const;
export const SUIT_GLYPH: Record<Suit, string> = { S: "♠", H: "♥", D: "♦", C: "♣" };
export function isRedSuit(s: Suit): boolean { return s === "H" || s === "D"; }

function drawCard(rng: () => number, owner: "P" | "C"): CardOnBoard {
  // Player draws Hearts/Diamonds (red), CPU draws Spades/Clubs (black).
  const suits: Suit[] = owner === "P" ? ["H", "D"] : ["S", "C"];
  const suit = suits[Math.floor(rng() * suits.length)]!;
  const rank = Math.floor(rng() * 13) as Rank;
  return { suit, rank, owner };
}

function legalMoves(b: Cell[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < b.length; i++) if (b[i] === null) out.push(i);
  return out;
}

function cpuMove(b: Cell[], rng: () => number): number {
  const empties = legalMoves(b);
  if (empties.length === 0) return -1;
  // Win: any C 3-in-a-row?
  for (const i of empties) {
    const t = b.slice();
    t[i] = { suit: "S", rank: 0, owner: "C" };
    if (checkWin(t).winner === "C") return i;
  }
  // Block player
  for (const i of empties) {
    const t = b.slice();
    t[i] = { suit: "H", rank: 0, owner: "P" };
    if (checkWin(t).winner === "P") return i;
  }
  if (empties.includes(4)) return 4;
  return empties[Math.floor(rng() * empties.length)]!;
}

export function initialState(seed: number, _s: TicTacToeCardsSettings): TicTacToeCardsState {
  return {
    rngSeed: seed >>> 0,
    board: Array(9).fill(null),
    turn: "P",
    result: null,
    score: 0,
    phase: "playing",
    winLine: null,
    pieces: 0,
  };
}

function lineRankBonus(b: Cell[], line: number[]): number {
  let s = 0;
  for (const i of line) {
    const c = b[i];
    if (c) s += c.rank + 2; // 2..14
  }
  return s;
}

export function reducer(state: TicTacToeCardsState, action: TicTacToeCardsAction): TicTacToeCardsState {
  if (state.phase === "done") return state;
  if (action.type !== "place") return state;
  if (state.turn !== "P") return state;
  if (action.idx < 0 || action.idx >= 9) return state;
  if (state.board[action.idx] !== null) return state;

  const rng = mulberry32(state.rngSeed);
  const pCard = drawCard(rng, "P");
  const nb = state.board.slice();
  nb[action.idx] = pCard;
  let pieces = state.pieces + 1;
  let res = checkWin(nb);
  if (res.winner === "P" && res.line) {
    const bonus = lineRankBonus(nb, res.line);
    return { ...state, board: nb, result: "P", winLine: res.line, score: state.score + 100 + pieces + bonus, phase: "done", pieces };
  }
  if (res.winner === "draw") {
    return { ...state, board: nb, result: "draw", score: state.score + 25 + pieces, phase: "done", pieces };
  }
  // CPU move
  const m = cpuMove(nb, rng);
  const seed2 = Math.floor(rng() * 2 ** 31);
  if (m >= 0) {
    const cCard = drawCard(rng, "C");
    nb[m] = cCard;
    pieces += 1;
  }
  res = checkWin(nb);
  if (res.winner === "C" && res.line) {
    return { ...state, rngSeed: seed2, board: nb, result: "C", winLine: res.line, score: state.score + pieces, phase: "done", pieces };
  }
  if (res.winner === "draw") {
    return { ...state, rngSeed: seed2, board: nb, result: "draw", score: state.score + 25 + pieces, phase: "done", pieces };
  }
  return { ...state, rngSeed: seed2, board: nb, turn: "P", pieces };
}

export function isTerminal(state: TicTacToeCardsState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
