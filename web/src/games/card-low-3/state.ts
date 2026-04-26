import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CardLow3Settings { rounds: "10" | "20"; }

export interface CardLow3State {
  deck: number[];
  pos: number;
  hand: [number, number, number] | null;
  score: number;
  round: number;
  maxRounds: number;
  phase: "dealing" | "revealed" | "gameover";
  lastSum: number | null;
}

export type CardLow3Action =
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
  const r = c % 13; // 0=2, 1=3, ... 8=10, 9=J, 10=Q, 11=K, 12=A
  return Math.min(r + 2, 10); // 2..10, face=10
}

export function initialState(seed: number, settings: CardLow3Settings): CardLow3State {
  const rng = mulberry32(seed);
  const deck = makeDeck(rng);
  return { deck, pos: 0, hand: null, score: 0, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "dealing", lastSum: null };
}

export function reducer(state: CardLow3State, action: CardLow3Action): CardLow3State {
  if (state.phase === "gameover") return state;
  if (action.type === "deal") {
    if (state.phase !== "dealing") return state;
    const a = state.deck[state.pos % state.deck.length]!;
    const b = state.deck[(state.pos + 1) % state.deck.length]!;
    const c = state.deck[(state.pos + 2) % state.deck.length]!;
    const sum = cardValue(a) + cardValue(b) + cardValue(c);
    // Score based on how low: sum <= 9 = 20pts, <= 15 = 10pts, <= 21 = 5pts, else 0
    const pts = sum <= 9 ? 20 : sum <= 15 ? 10 : sum <= 21 ? 5 : 0;
    const done = state.round >= state.maxRounds;
    return { ...state, hand: [a, b, c], score: state.score + pts, lastSum: sum, phase: done ? "gameover" : "revealed" };
  }
  if (action.type === "next") {
    if (state.phase !== "revealed") return state;
    return { ...state, pos: state.pos + 3, hand: null, round: state.round + 1, phase: "dealing", lastSum: null };
  }
  return state;
}

export function isTerminal(state: CardLow3State): { score: number } | null {
  if (state.phase === "gameover") return { score: state.score };
  return null;
}
