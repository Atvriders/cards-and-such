import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// QuartetMatch: each round, 7 random cards are dealt. Player picks 4 cards;
// if they share the same rank, player scores rank * 10 (face cards weighted).
// 5 rounds total.

export interface QuartetMatchSettings { rounds: "5" | "10"; }

export interface QuartetMatchState {
  hand: number[]; // 7 cards (0..51)
  selected: number[]; // indices into hand
  round: number;
  maxRounds: number;
  score: number;
  rngSeed: number;
  phase: "selecting" | "scored" | "done";
  lastPts: number;
  lastMessage: string;
}

export type QuartetMatchAction =
  | { type: "toggle"; idx: number }
  | { type: "submit" }
  | { type: "next" };

function dealHand(rng: () => number): number[] {
  const used = new Set<number>();
  const out: number[] = [];
  while (out.length < 7) {
    const c = Math.floor(rng() * 52);
    if (!used.has(c)) { used.add(c); out.push(c); }
  }
  return out;
}

export function rankOf(c: number): number { return c % 13; } // 0..12 (2..A)
export function rankPoints(rank: number): number {
  // 2..10 worth their face value; J=11, Q=12, K=13, A=14
  return rank + 2;
}
export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

export function initialState(seed: number, settings: QuartetMatchSettings): QuartetMatchState {
  const rng = mulberry32(seed);
  const hand = dealHand(rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const maxRounds = parseInt(settings.rounds, 10);
  return { hand, selected: [], round: 1, maxRounds, score: 0, rngSeed: nextSeed, phase: "selecting", lastPts: 0, lastMessage: "" };
}

export function reducer(state: QuartetMatchState, action: QuartetMatchAction): QuartetMatchState {
  if (state.phase === "done") return state;
  if (action.type === "toggle") {
    if (state.phase !== "selecting") return state;
    const idx = action.idx;
    if (state.selected.includes(idx)) {
      return { ...state, selected: state.selected.filter(i => i !== idx) };
    }
    if (state.selected.length >= 4) return state;
    return { ...state, selected: [...state.selected, idx] };
  }
  if (action.type === "submit") {
    if (state.phase !== "selecting") return state;
    if (state.selected.length !== 4) return state;
    const ranks = state.selected.map(i => rankOf(state.hand[i]!));
    const allSame = ranks.every(r => r === ranks[0]);
    let pts = 0;
    let msg = "Not a quartet — try a single rank.";
    if (allSame) {
      pts = rankPoints(ranks[0]!) * 10;
      msg = `Quartet of ${cardName(state.hand[state.selected[0]!]!).slice(0,-1)}s! +${pts}`;
    }
    return { ...state, phase: "scored", score: state.score + pts, lastPts: pts, lastMessage: msg };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    if (state.round >= state.maxRounds) return { ...state, phase: "done" };
    const rng = mulberry32(state.rngSeed);
    const hand = dealHand(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, hand, selected: [], round: state.round + 1, phase: "selecting", rngSeed: nextSeed, lastPts: 0, lastMessage: "" };
  }
  return state;
}

export function isTerminal(state: QuartetMatchState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
