import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SpeedSettings {
  duration: "60" | "90" | "120";
}

export type SpeedPhase = "playing" | "done";

export interface SpeedState {
  settings: SpeedSettings;
  hand: readonly Card[];
  piles: readonly [readonly Card[], readonly Card[]]; // two central piles
  stock: readonly Card[];
  cardsPlayed: number;
  secondsLeft: number;
  phase: SpeedPhase;
  rngSeed: number;
}

export type SpeedAction =
  | { type: "play"; cardId: string; pileIndex: 0 | 1 }
  | { type: "tick" }
  | { type: "start" };

// ── helpers ────────────────────────────────────────────────────────────────────

const HAND_SIZE = 5;

/** Ranks are ±1 wrapping: A(1)↔2 and K(13)↔A(1) treated linearly, plus Q↔A via K(13)↔A wraps. */
function isAdjacent(r1: Rank, r2: Rank): boolean {
  const diff = Math.abs(r1 - r2);
  return diff === 1 || diff === 12; // diff 12 handles A(1) and K(13)
}

export function canPlay(card: Card, pile: readonly Card[]): boolean {
  if (pile.length === 0) return true;
  const top = pile[pile.length - 1]!;
  return isAdjacent(card.rank, top.rank);
}

// ── initialState ───────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: SpeedSettings): SpeedState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  const hand = deck.slice(0, HAND_SIZE);
  const pile0 = [deck[5]!];
  const pile1 = [deck[6]!];
  const stock = deck.slice(7);

  return {
    settings,
    hand,
    piles: [pile0, pile1],
    stock,
    cardsPlayed: 0,
    secondsLeft: Number(settings.duration),
    phase: "playing",
    rngSeed: nextSeed,
  };
}

// ── reducer ────────────────────────────────────────────────────────────────────

export function reducer(state: SpeedState, action: SpeedAction): SpeedState {
  if (action.type === "tick") {
    if (state.phase !== "playing") return state;
    const newSeconds = state.secondsLeft - 1;
    if (newSeconds <= 0) {
      return { ...state, secondsLeft: 0, phase: "done" };
    }
    return { ...state, secondsLeft: newSeconds };
  }

  if (action.type === "play") {
    if (state.phase !== "playing") return state;
    const { cardId, pileIndex } = action;
    const card = state.hand.find(c => c.id === cardId);
    if (!card) return state;

    const targetPile = state.piles[pileIndex]!;
    if (!canPlay(card, targetPile)) return state;

    // Remove card from hand
    const newHand = state.hand.filter(c => c.id !== cardId);

    // Draw from stock if available
    let newStock = [...state.stock];
    let filledHand = [...newHand];
    if (newStock.length > 0) {
      filledHand = [...filledHand, newStock[0]!];
      newStock = newStock.slice(1);
    }

    const newPile = [...targetPile, card];
    const newPiles: [readonly Card[], readonly Card[]] = [
      pileIndex === 0 ? newPile : state.piles[0]!,
      pileIndex === 1 ? newPile : state.piles[1]!,
    ];

    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    const cardsPlayed = state.cardsPlayed + 1;
    const phase: SpeedPhase = filledHand.length === 0 && newStock.length === 0 ? "done" : "playing";

    return {
      ...state,
      hand: filledHand,
      piles: newPiles,
      stock: newStock,
      cardsPlayed,
      phase,
      rngSeed: nextSeed,
    };
  }

  if (action.type === "start") {
    // restart — same as initial but with current seed
    return initialState(state.rngSeed, state.settings);
  }

  return state;
}

// ── isTerminal ─────────────────────────────────────────────────────────────────

export function isTerminal(state: SpeedState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.cardsPlayed };
}
