import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dual Deal: 12 rounds. Player picks "left higher" or "right higher" before two cards are revealed.
// Higher rank wins; tie = push (0). +10 per correct.

export const TOTAL_ROUNDS = 12;

export interface DualDealSettings { dummy: boolean; }

export interface DualDealState {
  rngSeed: number;
  round: number;
  cards: [number, number] | null;
  bet: "left" | "right" | null;
  score: number;
  phase: "betting" | "result" | "done";
  lastWin: boolean;
  push: boolean;
}

export type DualDealAction = { type: "bet"; choice: "left" | "right" } | { type: "next" };

export function rankOf(c: number): number { return c % 13; }
export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

function deal2(rng: () => number): [number, number] {
  const a = Math.floor(rng() * 52);
  let b = Math.floor(rng() * 52);
  while (b === a) b = Math.floor(rng() * 52);
  return [a, b];
}

export function initialState(seed: number, _settings: DualDealSettings): DualDealState {
  return { rngSeed: seed, round: 1, cards: null, bet: null, score: 0, phase: "betting", lastWin: false, push: false };
}

export function reducer(state: DualDealState, action: DualDealAction): DualDealState {
  if (state.phase === "done") return state;
  if (action.type === "bet") {
    if (state.phase !== "betting") return state;
    const rng = mulberry32(state.rngSeed);
    const cards = deal2(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const ra = rankOf(cards[0]); const rb = rankOf(cards[1]);
    let win = false; let push = false;
    if (ra === rb) push = true;
    else if (action.choice === "left") win = ra > rb;
    else win = rb > ra;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, cards, bet: action.choice, score: state.score + (win ? 10 : 0), phase: isLast ? "done" : "result", lastWin: win, push };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, cards: null, bet: null, phase: "betting", lastWin: false, push: false };
  }
  return state;
}

export function isTerminal(state: DualDealState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
