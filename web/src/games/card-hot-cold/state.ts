import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CardHotColdSettings { rounds: "5" | "10" | "15"; }
export interface CardHotColdState {
  settings: CardHotColdSettings;
  deck: number[];
  current: number;
  target: number;
  guess: "hot" | "cold" | null;
  score: number;
  round: number;
  totalRounds: number;
  phase: "playing" | "revealed" | "gameover";
}
export type CardHotColdAction = { type: "guess"; choice: "hot" | "cold" } | { type: "next" };

export function cardRank(card: number): number { return card % 13; }
export function cardSuit(card: number): number { return Math.floor(card / 13); }
export const SUIT_SYMS = ["♠", "♥", "♦", "♣"];
export const RANK_NAMES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
// Hot = rank >= 7 (7-K, Ace=12 hot), Cold = rank < 7 (2-6)
export function isHot(card: number): boolean { return cardRank(card) >= 6; }

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: CardHotColdSettings): CardHotColdState {
  const rng = mulberry32(seed);
  const deck = shuffle(Array.from({ length: 52 }, (_, i) => i), rng);
  const current = deck.shift()!;
  const target = deck.shift()!;
  return { settings, deck, current, target, guess: null, score: 0, round: 1, totalRounds: parseInt(settings.rounds, 10), phase: "playing" };
}

export function reducer(state: CardHotColdState, action: CardHotColdAction): CardHotColdState {
  if (state.phase === "gameover") return state;
  switch (action.type) {
    case "guess": {
      if (state.phase !== "playing") return state;
      const correct = (action.choice === "hot") === isHot(state.target);
      return { ...state, guess: action.choice, score: correct ? state.score + 10 : state.score, phase: "revealed" };
    }
    case "next": {
      if (state.phase !== "revealed") return state;
      const nextRound = state.round + 1;
      if (nextRound > state.totalRounds || state.deck.length < 2) return { ...state, phase: "gameover" };
      const deck = [...state.deck];
      const current = deck.shift()!;
      const target = deck.shift()!;
      return { ...state, deck, current, target, guess: null, round: nextRound, phase: "playing" };
    }
    default: return state;
  }
}

export function isTerminal(state: CardHotColdState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
