import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 6;
export const CARDS_PER_ROUND = 2;

export interface CardBakerySettings { dummy: boolean; }

export interface CardBakeryState {
  rngSeed: number;
  round: number;
  pair: [number, number] | null;
  decisions: number[];
  score: number;
  phase: "deal" | "decide" | "done";
}

export type CardBakeryAction = { type: "deal" } | { type: "take" } | { type: "skip" };

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

function dealPair(rng: () => number, used: Set<number>): [number, number] {
  const out: number[] = [];
  while (out.length < 2) {
    const c = Math.floor(rng() * 52);
    if (!used.has(c)) { used.add(c); out.push(c); }
  }
  return [out[0]!, out[1]!];
}

export function scoreCardBakery(cards: number[]): number {
  return (() => { let rise = true; for (let i = 1; i < cards.length; i++) { if ((cards[i]! % 13) <= (cards[i-1]! % 13)) { rise = false; break; } } const sum = cards.reduce((s,c) => s + ((c%13)+1)*3, 0); return sum + (rise && cards.length >= 3 ? 50 : 0); })();
}

export function initialState(seed: number, _settings: CardBakerySettings): CardBakeryState {
  return { rngSeed: seed, round: 0, pair: null, decisions: [], score: 0, phase: "deal" };
}

export function reducer(state: CardBakeryState, action: CardBakeryAction): CardBakeryState {
  if (state.phase === "done") return state;
  if (action.type === "deal") {
    if (state.phase !== "deal") return state;
    if (state.round >= TOTAL_ROUNDS) {
      return { ...state, score: scoreCardBakery(state.decisions), phase: "done" };
    }
    const rng = mulberry32(state.rngSeed);
    const used = new Set<number>(state.decisions);
    if (state.pair) { used.add(state.pair[0]); used.add(state.pair[1]); }
    const pair = dealPair(rng, used);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: nextSeed, pair, phase: "decide" };
  }
  if (action.type === "take") {
    if (state.phase !== "decide" || !state.pair) return state;
    const newDecs = [...state.decisions, state.pair[0], state.pair[1]];
    const nextRound = state.round + 1;
    const isLast = nextRound >= TOTAL_ROUNDS;
    return { ...state, decisions: newDecs, pair: null, round: nextRound, phase: isLast ? "done" : "deal", score: isLast ? scoreCardBakery(newDecs) : state.score };
  }
  if (action.type === "skip") {
    if (state.phase !== "decide" || !state.pair) return state;
    const nextRound = state.round + 1;
    const isLast = nextRound >= TOTAL_ROUNDS;
    return { ...state, pair: null, round: nextRound, phase: isLast ? "done" : "deal", score: isLast ? scoreCardBakery(state.decisions) : state.score };
  }
  return state;
}

export function isTerminal(state: CardBakeryState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
