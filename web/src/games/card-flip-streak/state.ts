import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CardFlipStreakSettings { rounds: "10" | "20"; }

export interface CardFlipStreakState {
  deck: number[];
  pos: number;
  flipped: number | null;
  streak: number;
  bestStreak: number;
  score: number;
  round: number;
  maxRounds: number;
  phase: "picking" | "revealed" | "gameover";
  lastRed: boolean | null;
}

export type CardFlipStreakAction =
  | { type: "flip" }
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

export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

export function initialState(seed: number, settings: CardFlipStreakSettings): CardFlipStreakState {
  const rng = mulberry32(seed);
  const deck = makeDeck(rng);
  return { deck, pos: 0, flipped: null, streak: 0, bestStreak: 0, score: 0, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "picking", lastRed: null };
}

export function reducer(state: CardFlipStreakState, action: CardFlipStreakAction): CardFlipStreakState {
  if (state.phase === "gameover") return state;
  if (action.type === "flip") {
    if (state.phase !== "picking") return state;
    const card = state.deck[state.pos % state.deck.length]!;
    const red = isRed(card);
    const newStreak = red ? state.streak + 1 : 0;
    const pts = red ? (newStreak >= 3 ? 5 : 2) : 0;
    const done = state.round >= state.maxRounds;
    return { ...state, flipped: card, streak: newStreak, bestStreak: Math.max(state.bestStreak, newStreak), score: state.score + pts, phase: done ? "gameover" : "revealed", lastRed: red };
  }
  if (action.type === "next") {
    if (state.phase !== "revealed") return state;
    return { ...state, pos: state.pos + 1, round: state.round + 1, flipped: null, phase: "picking", lastRed: null };
  }
  return state;
}

export function isTerminal(state: CardFlipStreakState): { score: number } | null {
  if (state.phase === "gameover") return { score: state.score };
  return null;
}
