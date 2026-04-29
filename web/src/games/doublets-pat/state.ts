import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const ROUNDS = 10;
export const HAND_SIZE = 5;

export interface SoliSettings { dummy: boolean; }

export interface SoliState {
  rngSeed: number;
  deck: number[];
  pos: number;
  hand: number[];
  round: number;
  score: number;
  phase: "playing" | "done";
  log: string[];
}

export type SoliAction =
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

function scoreHand(h: number[]): number {
  const ranks = h.map(c => c % 13);
  const counts = new Map<number, number>();
  for (const r of ranks) counts.set(r, (counts.get(r) || 0) + 1);
  let pairs = 0, trips = 0, quads = 0;
  for (const v of counts.values()) {
    if (v === 4) quads++;
    else if (v === 3) trips++;
    else if (v === 2) pairs++;
  }
  if (quads >= 1) return 50;
  if (trips >= 1 && pairs >= 1) return 30;
  if (trips >= 1) return 20;
  if (pairs >= 2) return 12;
  if (pairs >= 1) return 4;
  return 1;
}

export function initialState(seed: number, _s: SoliSettings): SoliState {
  const rng = mulberry32(seed);
  const deck = shuffle(rng, 52);
  const hand = deck.slice(0, HAND_SIZE);
  return { rngSeed: seed, deck, pos: HAND_SIZE, hand, round: 0, score: 0, phase: "playing", log: [] };
}

export function reducer(state: SoliState, action: SoliAction): SoliState {
  if (state.phase === "done") return state;
  if (action.type === "noop") return state;
  if (action.type === "keep") {
    const score = scoreHand(state.hand);
    const newScore = state.score + score;
    const round = state.round + 1;
    const log = [...state.log, `R${round}: keep +${score}`];
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

export function isTerminal(state: SoliState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
