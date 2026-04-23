import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Ride the Bus — non-alcoholic variant
// Phase 1: 4 yes/no questions, one card revealed per question
//   Q1: Red or Black?
//   Q2: Higher or Lower (than Q1 card)?
//   Q3: Inside or Outside (range of Q1 and Q2)?
//   Q4: Guess the suit?
// Wrong answer = +1 "drink" (penalty point)
// After 4 questions, start a new round
// Goal: finish 5 rounds with fewest penalties (score = 100 - drinks*4, min 0)

export interface RideTheBusSettings { rounds: "3" | "5" | "7" }

export type RideTheBusPhase = "question" | "reveal" | "roundEnd" | "done";

export type Question = "redBlack" | "higherLower" | "insideOutside" | "suit";

export interface RideTheBusState {
  settings: RideTheBusSettings;
  deck: readonly Card[];
  revealedCards: readonly Card[]; // cards revealed this round (1 per question)
  currentQuestion: number; // 0-3
  phase: RideTheBusPhase;
  lastGuess: string | null;
  lastCorrect: boolean | null;
  drinks: number; // total penalties
  roundsPlayed: number;
  currentReveal: Card | null; // the card just flipped
  rngSeed: number;
}

export type RideTheBusAction =
  | { type: "guess"; value: string }
  | { type: "nextQuestion" }
  | { type: "nextRound" };

function rankVal(rank: number): number {
  if (rank === 1) return 14; // Ace high
  return rank;
}

export function checkGuess(question: Question, guess: string, card: Card, revealedCards: readonly Card[]): boolean {
  const rv = rankVal(card.rank);
  const isRed = card.suit === "♥" || card.suit === "♦";

  if (question === "redBlack") {
    return guess === (isRed ? "red" : "black");
  }

  if (question === "higherLower") {
    const prev = revealedCards[0]!;
    const prevRv = rankVal(prev.rank);
    if (guess === "higher") return rv > prevRv;
    if (guess === "lower") return rv < prevRv;
    return rv === prevRv; // "same" always wrong in simplified
  }

  if (question === "insideOutside") {
    const r1 = rankVal(revealedCards[0]!.rank);
    const r2 = rankVal(revealedCards[1]!.rank);
    const lo = Math.min(r1, r2);
    const hi = Math.max(r1, r2);
    if (guess === "inside") return rv > lo && rv < hi;
    if (guess === "outside") return rv < lo || rv > hi;
    return false;
  }

  if (question === "suit") {
    return guess === card.suit;
  }

  return false;
}

const QUESTIONS: Question[] = ["redBlack", "higherLower", "insideOutside", "suit"];

export function initialState(seed: number, settings: RideTheBusSettings): RideTheBusState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  return {
    settings,
    deck,
    revealedCards: [],
    currentQuestion: 0,
    phase: "question",
    lastGuess: null,
    lastCorrect: null,
    drinks: 0,
    roundsPlayed: 0,
    currentReveal: null,
    rngSeed: nextSeed,
  };
}

export function reducer(state: RideTheBusState, action: RideTheBusAction): RideTheBusState {
  if (state.phase === "done") return state;

  if (action.type === "guess" && state.phase === "question") {
    const question = QUESTIONS[state.currentQuestion]!;
    if (state.deck.length === 0) return state;
    const [card, ...remaining] = state.deck;
    const correct = checkGuess(question, action.value, card!, state.revealedCards);
    const newDrinks = state.drinks + (correct ? 0 : 1);
    return {
      ...state,
      deck: remaining,
      currentReveal: card!,
      phase: "reveal",
      lastGuess: action.value,
      lastCorrect: correct,
      drinks: newDrinks,
    };
  }

  if (action.type === "nextQuestion" && state.phase === "reveal") {
    const newRevealed = [...state.revealedCards, state.currentReveal!];
    const nextQ = state.currentQuestion + 1;

    if (nextQ >= 4) {
      // Round done
      const newRoundsPlayed = state.roundsPlayed + 1;
      const isDone = newRoundsPlayed >= parseInt(state.settings.rounds, 10);
      return {
        ...state,
        revealedCards: newRevealed,
        currentQuestion: nextQ,
        phase: isDone ? "done" : "roundEnd",
        roundsPlayed: newRoundsPlayed,
        currentReveal: null,
      };
    }

    return {
      ...state,
      revealedCards: newRevealed,
      currentQuestion: nextQ,
      phase: "question",
      lastGuess: null,
      lastCorrect: null,
      currentReveal: null,
    };
  }

  if (action.type === "nextRound" && state.phase === "roundEnd") {
    // Reshuffle remaining deck or use seed
    const rng = mulberry32(state.rngSeed);
    const deck = shuffle(newDeck(), rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return {
      ...state,
      deck,
      revealedCards: [],
      currentQuestion: 0,
      phase: "question",
      lastGuess: null,
      lastCorrect: null,
      currentReveal: null,
      rngSeed: nextSeed,
    };
  }

  return state;
}

export function isTerminal(state: RideTheBusState): { score: number } | null {
  if (state.phase !== "done") return null;
  const maxDrinks = parseInt(state.settings.rounds, 10) * 4;
  const score = Math.max(0, Math.round(100 * (1 - state.drinks / maxDrinks)));
  return { score };
}
