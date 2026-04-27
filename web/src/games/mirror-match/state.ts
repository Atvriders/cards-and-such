import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Mirror Match: 10 rounds. Deal 2 cards. Same rank = +10 points (mirror match).

export const TOTAL_ROUNDS = 10;

export interface MirrorMatchSettings { dummy: boolean; }

export interface MirrorMatchState {
  rngSeed: number;
  round: number;
  hand: number[];
  matched: boolean;
  pts: number;
  score: number;
  matches: number;
  phase: "dealing" | "scored" | "done";
}

export type MirrorMatchAction = { type: "deal" } | { type: "next" };

export function rankOf(c: number): number { return (c % 13) + 2; }
export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

function deal2(rng: () => number): number[] {
  const used = new Set<number>();
  const out: number[] = [];
  while (out.length < 2) {
    const c = Math.floor(rng() * 52);
    if (!used.has(c)) { used.add(c); out.push(c); }
  }
  return out;
}

export function initialState(seed: number, _settings: MirrorMatchSettings): MirrorMatchState {
  return { rngSeed: seed, round: 1, hand: [], matched: false, pts: 0, score: 0, matches: 0, phase: "dealing" };
}

export function reducer(state: MirrorMatchState, action: MirrorMatchAction): MirrorMatchState {
  if (state.phase === "done") return state;
  if (action.type === "deal") {
    if (state.phase !== "dealing") return state;
    const rng = mulberry32(state.rngSeed);
    const hand = deal2(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const matched = rankOf(hand[0]!) === rankOf(hand[1]!);
    const pts = matched ? 10 : 0;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, hand, matched, pts, score: state.score + pts, matches: state.matches + (matched ? 1 : 0), phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, hand: [], matched: false, pts: 0, phase: "dealing" };
  }
  return state;
}

export function isTerminal(state: MirrorMatchState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
