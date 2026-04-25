import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CardColorStreakSettings { rounds: "5" | "10" | "15"; }
export interface CardColorStreakState {
  settings: CardColorStreakSettings;
  deck: number[];
  currentCard: number;
  streak: number;
  bestStreak: number;
  score: number;
  round: number;
  totalRounds: number;
  lastCorrect: boolean | null;
  phase: "playing" | "gameover";
}
export type CardColorStreakAction = { type: "guess"; color: "red" | "black" } | { type: "next" };

export function cardSuit(card: number): number { return Math.floor(card / 13); }
export function cardRank(card: number): number { return card % 13; }
export const SUIT_SYMS = ["♠", "♥", "♦", "♣"];
export const RANK_NAMES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
export function isRed(card: number): boolean { const s = cardSuit(card); return s === 1 || s === 2; }

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: CardColorStreakSettings): CardColorStreakState {
  const rng = mulberry32(seed);
  const deck = shuffle(Array.from({ length: 52 }, (_, i) => i), rng);
  const currentCard = deck.shift()!;
  return { settings, deck, currentCard, streak: 0, bestStreak: 0, score: 0, round: 1, totalRounds: parseInt(settings.rounds, 10), lastCorrect: null, phase: "playing" };
}

export function reducer(state: CardColorStreakState, action: CardColorStreakAction): CardColorStreakState {
  if (state.phase === "gameover") return state;
  switch (action.type) {
    case "guess": {
      if (state.deck.length === 0) return { ...state, phase: "gameover" };
      const deck = [...state.deck];
      const nextCard = deck.shift()!;
      const correct = (action.color === "red") === isRed(nextCard);
      const streak = correct ? state.streak + 1 : 0;
      const bestStreak = Math.max(streak, state.bestStreak);
      const pts = correct ? 5 + streak * 2 : 0; // streak bonus
      return { ...state, deck, currentCard: nextCard, streak, bestStreak, score: state.score + pts, round: state.round + 1, lastCorrect: correct };
    }
    case "next": {
      if (state.round > state.totalRounds) return { ...state, phase: "gameover" };
      return state;
    }
    default: return state;
  }
}

export function isTerminal(state: CardColorStreakState): { score: number } | null {
  if (state.phase === "gameover" || state.round > state.totalRounds) return { score: state.score };
  return null;
}
