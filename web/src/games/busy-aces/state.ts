import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const ROUNDS = 10;
export const HAND_SIZE = 5;
export const RATING_BANDS = [0,35,75,115] as const;

export interface BusyAcesSettings { dummy: boolean; }

export interface BusyAcesState {
  rngSeed: number;
  deck: number[];
  pos: number;
  hand: number[];
  round: number;
  score: number;
  phase: "playing" | "done";
  log: string[];
}

export type BusyAcesAction =
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

function deal(deck: number[], pos: number): { hand: number[]; pos: number } {
  const hand = deck.slice(pos, pos + HAND_SIZE);
  return { hand, pos: pos + HAND_SIZE };
}

function variantBonus(hand: number[]): number {
  const ranks = hand.map(cardRank);
  const suits = hand.map(cardSuit);
  void ranks; void suits;
  const counts: Record<number,number> = {}; for (const s of suits) counts[s] = (counts[s]||0)+1; const max = Math.max(...Object.values(counts)); return max >= 3 ? max * 2 : 0;
}

function scoreHand(hand: number[]): { score: number; reason: string } {
  let score = 0;
  const reasons: string[] = [];
  const faces = hand.filter((c) => cardRank(c) >= 11).length;
  if (faces >= 1) { score += faces * 5; reasons.push(`${faces} face`); }
  const ranks = hand.map(cardRank).sort((a, b) => a - b);
  const ranksAll = hand.map(cardRank);
  const counts: Record<number, number> = {};
  for (const r of ranksAll) counts[r] = (counts[r] || 0) + 1;
  const pairs = Object.values(counts).filter((v) => v >= 2).length;
  if (pairs >= 1) { score += pairs * 10; reasons.push(`${pairs} pair`); }
  let asc = 1, best = 1;
  for (let i = 1; i < ranks.length; i++) {
    if (ranks[i]! === ranks[i - 1]! + 1) { asc++; best = Math.max(best, asc); } else if (ranks[i]! !== ranks[i - 1]!) { asc = 1; }
  }
  if (best >= 3) { score += best * 4; reasons.push(`run${best}`); }
  const suits = new Set(hand.map(cardSuit));
  if (suits.size === 1) { score += 12; reasons.push("flush"); }
  const bonus = variantBonus(hand);
  if (bonus > 0) { score += bonus; reasons.push(`bonus+${bonus}`); }
  if (score === 0) score = 1;
  return { score, reason: reasons.join(",") || "weak" };
}

export function initialState(seed: number, _s: BusyAcesSettings): BusyAcesState {
  const rng = mulberry32(seed);
  const deck = shuffle(rng, 52);
  const { hand, pos } = deal(deck, 0);
  return { rngSeed: seed, deck, pos, hand, round: 0, score: 0, phase: "playing", log: [] };
}

export function reducer(state: BusyAcesState, action: BusyAcesAction): BusyAcesState {
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
    return { ...state, round, hand: next, pos: state.pos + HAND_SIZE, log: [...log], score: state.score + 1 };
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

export function isTerminal(state: BusyAcesState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
