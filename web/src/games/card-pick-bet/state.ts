import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CardPickBetSettings { rounds: "5" | "10" | "15"; }
export interface CardPickBetState {
  settings: CardPickBetSettings;
  deck: number[];
  topCard: number;
  bet: "higher" | "lower" | null;
  nextCard: number | null;
  score: number;
  round: number;
  totalRounds: number;
  phase: "playing" | "revealed" | "gameover";
}
export type CardPickBetAction =
  | { type: "bet"; choice: "higher" | "lower" }
  | { type: "next" };

export function cardRank(card: number): number { return card % 13; }
export const RANK_NAMES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
export const SUIT_SYMS = ["♠", "♥", "♦", "♣"];
export function cardSuit(card: number): number { return Math.floor(card / 13); }

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: CardPickBetSettings): CardPickBetState {
  const rng = mulberry32(seed);
  const deck = shuffle(Array.from({ length: 52 }, (_, i) => i), rng);
  const topCard = deck.shift()!;
  return { settings, deck, topCard, bet: null, nextCard: null, score: 0, round: 1, totalRounds: parseInt(settings.rounds, 10), phase: "playing" };
}

export function reducer(state: CardPickBetState, action: CardPickBetAction): CardPickBetState {
  if (state.phase === "gameover") return state;
  switch (action.type) {
    case "bet": {
      if (state.phase !== "playing") return state;
      const deck = [...state.deck];
      const nextCard = deck.shift()!;
      const topRank = cardRank(state.topCard);
      const nextRank = cardRank(nextCard);
      const correct = (action.choice === "higher" && nextRank > topRank) || (action.choice === "lower" && nextRank < topRank);
      return { ...state, deck, bet: action.choice, nextCard, score: correct ? state.score + 10 : state.score, phase: "revealed" };
    }
    case "next": {
      if (state.phase !== "revealed") return state;
      const nextRound = state.round + 1;
      if (nextRound > state.totalRounds) return { ...state, phase: "gameover" };
      return { ...state, topCard: state.nextCard!, nextCard: null, bet: null, round: nextRound, phase: "playing" };
    }
    default: return state;
  }
}

export function isTerminal(state: CardPickBetState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
