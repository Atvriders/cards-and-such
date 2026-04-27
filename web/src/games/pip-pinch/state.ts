import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Pip Pinch: 12 cards dealt. Pinch (remove) high cards (rank > 6 means J,Q,K,A or 7,8,9,10).
// Final score: +1 per remaining LOW card (Ace through 6 inclusive). Bonus +5 if no high cards remain.
// You can pinch up to 6 cards. Each pinch +0 pts (pinches reduce remaining set).

export const TOTAL_CARDS = 12;
export const MAX_PINCHES = 6;

export interface PipPinchSettings { dummy: boolean; }

export interface PipPinchState {
  rngSeed: number;
  cards: number[]; // 12 indices
  removed: boolean[]; // 12 flags
  pinches: number;
  score: number;
  phase: "playing" | "done";
}

export type PipPinchAction = { type: "pinch"; index: number } | { type: "finish" };

export function rankValue(c: number): number {
  const r = c % 13;
  if (r <= 8) return r + 2; // 2..10
  if (r === 9) return 11;
  if (r === 10) return 12;
  if (r === 11) return 13;
  return 1; // A
}
export function isLow(c: number): boolean { return rankValue(c) <= 6; }

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

function deal(rng: () => number, n: number): number[] {
  const used = new Set<number>();
  const out: number[] = [];
  while (out.length < n) {
    const c = Math.floor(rng() * 52);
    if (!used.has(c)) { used.add(c); out.push(c); }
  }
  return out;
}

export function initialState(seed: number, _settings: PipPinchSettings): PipPinchState {
  const rng = mulberry32(seed);
  const cards = deal(rng, TOTAL_CARDS);
  return { rngSeed: Math.floor(rng() * 2 ** 31), cards, removed: Array(TOTAL_CARDS).fill(false), pinches: 0, score: 0, phase: "playing" };
}

function computeScore(state: PipPinchState): number {
  let lows = 0; let highs = 0;
  for (let i = 0; i < state.cards.length; i++) {
    if (state.removed[i]) continue;
    if (isLow(state.cards[i]!)) lows++;
    else highs++;
  }
  return lows + (highs === 0 ? 5 : 0);
}

export function reducer(state: PipPinchState, action: PipPinchAction): PipPinchState {
  if (state.phase === "done") return state;
  if (action.type === "pinch") {
    if (state.pinches >= MAX_PINCHES) return state;
    if (state.removed[action.index]) return state;
    if (action.index < 0 || action.index >= state.cards.length) return state;
    const removed = [...state.removed];
    removed[action.index] = true;
    return { ...state, removed, pinches: state.pinches + 1 };
  }
  if (action.type === "finish") {
    const next = { ...state, phase: "done" as const };
    return { ...next, score: computeScore(next) };
  }
  return state;
}

export function isTerminal(state: PipPinchState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
