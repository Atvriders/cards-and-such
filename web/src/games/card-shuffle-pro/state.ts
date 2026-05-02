import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Shuffle Pro: pure card-shuffle simulator. Each round: shuffle a fresh
// 52-card deck, deal 5 cards. Player predicts whether the NEXT (6th) card is
// red or black. 12 rounds. +1 point per correct guess.

export const ROUNDS = 12;
export const HAND_SIZE = 5;

export type Color = "red" | "black";
export type Suit = "S" | "H" | "D" | "C";

export interface Card {
  suit: Suit; // S/H/D/C
  rank: number; // 1..13
}

export interface CardShuffleProSettings {
  difficulty: "easy" | "normal";
}

export interface CardShuffleProState {
  rngSeed: number;
  rngCounter: number;
  settings: CardShuffleProSettings;
  round: number; // 1..ROUNDS
  hand: Card[]; // 5 visible cards
  next: Card; // hidden until reveal
  guess: Color | null;
  revealed: boolean;
  score: number;
  history: { hand: Card[]; next: Card; guess: Color | null; correct: boolean }[];
  phase: "guess" | "done";
}

export type CardShuffleProAction =
  | { type: "guess"; color: Color }
  | { type: "next" };

export function colorOf(c: Card): Color {
  return c.suit === "H" || c.suit === "D" ? "red" : "black";
}

export function buildDeck(): Card[] {
  const suits: Suit[] = ["S", "H", "D", "C"];
  const out: Card[] = [];
  for (const s of suits) for (let r = 1; r <= 13; r++) out.push({ suit: s, rank: r });
  return out;
}

export function shuffle(deck: Card[], seed: number, counter: number): Card[] {
  const rng = mulberry32(seed + counter * 104729);
  const arr = deck.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function dealRound(seed: number, counter: number): { hand: Card[]; next: Card } {
  const shuffled = shuffle(buildDeck(), seed, counter);
  return { hand: shuffled.slice(0, HAND_SIZE), next: shuffled[HAND_SIZE] };
}

export function initialState(seed: number, settings: CardShuffleProSettings): CardShuffleProState {
  const s = (seed >>> 0) || 1;
  const { hand, next } = dealRound(s, 0);
  return {
    rngSeed: s,
    rngCounter: 0,
    settings,
    round: 1,
    hand,
    next,
    guess: null,
    revealed: false,
    score: 0,
    history: [],
    phase: "guess",
  };
}

export function reducer(
  state: CardShuffleProState,
  action: CardShuffleProAction,
): CardShuffleProState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "guess": {
      if (state.revealed) return state;
      const correct = colorOf(state.next) === action.color;
      const entry = {
        hand: state.hand,
        next: state.next,
        guess: action.color,
        correct,
      };
      return {
        ...state,
        guess: action.color,
        revealed: true,
        score: state.score + (correct ? 1 : 0),
        history: [...state.history, entry],
      };
    }
    case "next": {
      if (!state.revealed) return state;
      if (state.round >= ROUNDS) {
        return { ...state, phase: "done" };
      }
      const counter = state.rngCounter + 1;
      const { hand, next } = dealRound(state.rngSeed, counter);
      return {
        ...state,
        round: state.round + 1,
        hand,
        next,
        guess: null,
        revealed: false,
        rngCounter: counter,
      };
    }
    default:
      return state;
  }
}

export function isTerminal(state: CardShuffleProState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
