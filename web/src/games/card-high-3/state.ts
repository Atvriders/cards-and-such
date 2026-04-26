import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CardHigh3Settings { rounds: "10" | "20"; }

export interface CardHigh3State {
  deck: number[];
  pos: number;
  hand: [number, number, number] | null;
  score: number;
  round: number;
  maxRounds: number;
  phase: "dealing" | "revealed" | "gameover";
  lastSum: number | null;
}

export type CardHigh3Action =
  | { type: "deal" }
  | { type: "next" };

function makeDeck(rng: () => number): number[] {
  const arr = Array.from({ length: 52 }, (_, i) => i);
  for (let i = 51; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j]!, arr[i]!]; }
  return arr;
}

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}

export function cardValue(c: number): number {
  const r = c % 13;
  if (r === 12) return 11; // Ace = 11
  return Math.min(r + 2, 10);
}

export function initialState(seed: number, settings: CardHigh3Settings): CardHigh3State {
  const rng = mulberry32(seed);
  const deck = makeDeck(rng);
  return { deck, pos: 0, hand: null, score: 0, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "dealing", lastSum: null };
}

export function reducer(state: CardHigh3State, action: CardHigh3Action): CardHigh3State {
  if (state.phase === "gameover") return state;
  if (action.type === "deal") {
    if (state.phase !== "dealing") return state;
    const a = state.deck[state.pos % state.deck.length]!;
    const b = state.deck[(state.pos + 1) % state.deck.length]!;
    const c = state.deck[(state.pos + 2) % state.deck.length]!;
    const sum = cardValue(a) + cardValue(b) + cardValue(c);
    // Score based on how high: sum >= 30 = 20pts, >= 24 = 10pts, >= 18 = 5pts, else 0
    const pts = sum >= 30 ? 20 : sum >= 24 ? 10 : sum >= 18 ? 5 : 0;
    const done = state.round >= state.maxRounds;
    return { ...state, hand: [a, b, c], score: state.score + pts, lastSum: sum, phase: done ? "gameover" : "revealed" };
  }
  if (action.type === "next") {
    if (state.phase !== "revealed") return state;
    return { ...state, pos: state.pos + 3, hand: null, round: state.round + 1, phase: "dealing", lastSum: null };
  }
  return state;
}

export function isTerminal(state: CardHigh3State): { score: number } | null {
  if (state.phase === "gameover") return { score: state.score };
  return null;
}
