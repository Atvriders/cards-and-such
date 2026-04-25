import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Shark: flip cards one at a time, guess higher or lower to build a streak.

export interface CardSharkSettings {
  decks: "1" | "2";
  rounds: "10" | "20" | "30";
}

export interface CardSharkState {
  settings: CardSharkSettings;
  rngSeed: number;
  shoe: readonly Card[];
  currentCard: Card | null;
  nextCard: Card | null;
  streak: number;
  bestStreak: number;
  score: number;
  round: number;
  maxRounds: number;
  lastResult: "correct" | "wrong" | "tie" | null;
  over: boolean;
}

export type CardSharkAction =
  | { type: "higher" }
  | { type: "lower" }
  | { type: "next" };

function cardValue(card: Card): number {
  if (card.rank === 1) return 14; // Ace high
  if (card.rank >= 11) return card.rank; // J=11, Q=12, K=13
  return card.rank;
}

function buildShoe(seed: number, deckCount: number): { shoe: Card[]; nextSeed: number } {
  let cards: Card[] = [];
  for (let i = 0; i < deckCount; i++) {
    cards = [...cards, ...newDeck()];
  }
  const r = mulberry32(seed);
  const nextSeed = Math.floor(r() * 2 ** 31);
  return { shoe: shuffle(cards, mulberry32(seed)), nextSeed };
}

export function initialState(seed: number, settings: CardSharkSettings): CardSharkState {
  const deckCount = parseInt(settings.decks, 10);
  const { shoe, nextSeed } = buildShoe(seed, deckCount);
  const maxRounds = parseInt(settings.rounds, 10);
  const currentCard = shoe[0] ?? null;
  const nextCard = shoe[1] ?? null;
  return {
    settings,
    rngSeed: nextSeed,
    shoe,
    currentCard,
    nextCard,
    streak: 0,
    bestStreak: 0,
    score: 0,
    round: 1,
    maxRounds,
    lastResult: null,
    over: false,
  };
}

export function reducer(state: CardSharkState, action: CardSharkAction): CardSharkState {
  if (state.over) return state;

  switch (action.type) {
    case "higher":
    case "lower": {
      if (!state.currentCard || !state.nextCard) return state;

      const curVal = cardValue(state.currentCard);
      const nxtVal = cardValue(state.nextCard);
      let result: "correct" | "wrong" | "tie";

      if (curVal === nxtVal) {
        result = "tie";
      } else if (action.type === "higher") {
        result = nxtVal > curVal ? "correct" : "wrong";
      } else {
        result = nxtVal < curVal ? "correct" : "wrong";
      }

      const newStreak = result === "correct" ? state.streak + 1 : 0;
      const streakBonus = result === "correct" ? 10 * newStreak : 0; // bonus for streaks
      const baseScore = result === "correct" ? 50 : result === "tie" ? 10 : 0;
      const newScore = state.score + baseScore + streakBonus;
      const newBest = Math.max(state.bestStreak, newStreak);

      const nextRound = state.round + 1;
      const over = nextRound > state.maxRounds;

      // Advance shoe
      const newShoe = state.shoe.slice(1);
      const newCurrent = newShoe[0] ?? null;
      const newNext = newShoe[1] ?? null;

      return {
        ...state,
        shoe: newShoe,
        currentCard: newCurrent,
        nextCard: over ? null : newNext,
        streak: newStreak,
        bestStreak: newBest,
        score: newScore,
        round: nextRound,
        lastResult: result,
        over,
      };
    }

    case "next":
      return state;

    default:
      return state;
  }
}

export function isTerminal(state: CardSharkState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

export { cardValue };
