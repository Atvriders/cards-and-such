import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CardBidStreakSettings { rounds: "10" | "20"; }

export interface CardBidStreakState {
  deck: number[];
  pos: number;
  currentCard: number | null;
  streak: number;
  bestStreak: number;
  coins: number;
  round: number;
  maxRounds: number;
  phase: "bidding" | "revealed" | "gameover";
  lastCorrect: boolean | null;
}

export type CardBidStreakAction =
  | { type: "guess"; higher: boolean }
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

export function initialState(seed: number, settings: CardBidStreakSettings): CardBidStreakState {
  const rng = mulberry32(seed);
  const deck = makeDeck(rng);
  return { deck, pos: 0, currentCard: deck[0]!, streak: 0, bestStreak: 0, coins: 50, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "bidding", lastCorrect: null };
}

export function reducer(state: CardBidStreakState, action: CardBidStreakAction): CardBidStreakState {
  if (state.phase === "gameover") return state;
  if (action.type === "guess") {
    if (state.phase !== "bidding") return state;
    const current = state.deck[state.pos % state.deck.length]!;
    const next = state.deck[(state.pos + 1) % state.deck.length]!;
    const nextRank = next % 13;
    const curRank = current % 13;
    const correct = action.higher ? nextRank > curRank : nextRank < curRank;
    const newStreak = correct ? state.streak + 1 : 0;
    const bonus = correct ? (newStreak >= 3 ? 3 : 1) : 0;
    const newCoins = state.coins + bonus;
    const done = state.round >= state.maxRounds;
    return { ...state, currentCard: next, streak: newStreak, bestStreak: Math.max(state.bestStreak, newStreak), coins: newCoins, phase: done ? "gameover" : "revealed", lastCorrect: correct };
  }
  if (action.type === "next") {
    if (state.phase !== "revealed") return state;
    return { ...state, pos: state.pos + 1, round: state.round + 1, phase: "bidding", lastCorrect: null };
  }
  return state;
}

export function isTerminal(state: CardBidStreakState): { score: number } | null {
  if (state.phase === "gameover") return { score: state.coins };
  return null;
}
