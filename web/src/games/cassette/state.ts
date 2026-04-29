import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const ROUNDS = 10;
export const HAND_SIZE = 5;

export interface CassetteSettings { dummy: boolean; }

export interface CassetteState {
  rngSeed: number;
  deck: number[];
  pos: number;
  hand: number[];
  round: number;
  score: number;
  phase: "playing" | "done";
  log: string[];
}

export type CassetteAction =
  | { type: "keep" }
  | { type: "discard"; index: number }
  | { type: "swap"; index: number }
  | { type: "noop" };

export function cardName(c: number): string {
  const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13) % 4]!;
}

export function cardRank(c: number): number { return (c % 13) + 1; }
export function cardSuit(c: number): number { return Math.floor(c / 13) % 4; }

function shuffle(rng: () => number, n: number): number[] {
  const a: number[] = [];
  for (let i = 0; i < n; i++) a.push(i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function scoreHand(hand: number[]): { score: number; reason: string } {
  let score = 0;
  const reasons: string[] = [];
  const ranks = hand.map(cardRank);
  const sorted = [...ranks].sort((a, b) => a - b);
  const counts: Record<number, number> = {};
  for (const r of ranks) counts[r] = (counts[r] || 0) + 1;
  const pairs = Object.values(counts).filter((v) => v >= 2).length;
  const trips = Object.values(counts).filter((v) => v >= 3).length;
  let asc = 1, best = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i]! === sorted[i - 1]! + 1) { asc++; best = Math.max(best, asc); } else if (sorted[i]! !== sorted[i - 1]!) { asc = 1; }
  }
  const suits = new Set(hand.map(cardSuit));
  const flush = suits.size === 1;
  const faces = ranks.filter((r) => r >= 11).length;
  const lows = ranks.filter((r) => r <= 5).length;
  // Pairs-heavy variant
  if (pairs >= 1) { score += pairs * 12; reasons.push(`${pairs} pair`); }
  if (trips >= 1) { score += trips * 18; reasons.push(`${trips} trip`); }
  if (best >= 3) { score += best * 3; reasons.push(`run${best}`); }
  if (flush) { score += 8; reasons.push("flush"); }
  if (faces >= 1) { score += faces * 4; reasons.push(`${faces} face`); }
  if (score === 0) score = 1;
  return { score, reason: reasons.join(",") || "weak" };
}

export function initialState(seed: number, _s: CassetteSettings): CassetteState {
  const rng = mulberry32(seed);
  const deck = shuffle(rng, 52);
  const hand = deck.slice(0, HAND_SIZE);
  return { rngSeed: seed, deck, pos: HAND_SIZE, hand, round: 0, score: 0, phase: "playing", log: [] };
}

export function reducer(state: CassetteState, action: CassetteAction): CassetteState {
  if (state.phase === "done") return state;
  if (action.type === "noop") return state;
  if (action.type === "keep") {
    const { score, reason } = scoreHand(state.hand);
    const newScore = state.score + score;
    const round = state.round + 1;
    const log = [...state.log, `R${round}: keep +${score} (${reason})`];
    if (round >= ROUNDS || state.pos + HAND_SIZE > state.deck.length) {
      return { ...state, score: newScore, round, phase: "done", log };
    }
    const next = state.deck.slice(state.pos, state.pos + HAND_SIZE);
    return { ...state, score: newScore, round, hand: next, pos: state.pos + HAND_SIZE, log };
  }
  if (action.type === "discard") {
    if (action.index < 0 || action.index >= state.hand.length) return state;
    const round = state.round + 1;
    const log = [...state.log, `R${round}: discard`];
    if (round >= ROUNDS || state.pos + HAND_SIZE > state.deck.length) {
      return { ...state, round, phase: "done", log, score: state.score + 1 };
    }
    const next = state.deck.slice(state.pos, state.pos + HAND_SIZE);
    return { ...state, round, hand: next, pos: state.pos + HAND_SIZE, log, score: state.score + 1 };
  }
  if (action.type === "swap") {
    if (action.index < 0 || action.index >= state.hand.length) return state;
    if (state.pos >= state.deck.length) return state;
    const swapCard = state.deck[state.pos]!;
    const newHand = [...state.hand];
    newHand[action.index] = swapCard;
    return { ...state, hand: newHand, pos: state.pos + 1 };
  }
  return state;
}

export function isTerminal(state: CassetteState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
