import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface VideoPokerSettings {
  betSize: "1" | "5";
  paytable: "9/6" | "8/5";
  handsPerSession: number;
}

export type VideoPokerPhase = "deal" | "hold" | "shown";

export interface HeldCard {
  card: Card;
  held: boolean;
}

export interface VideoPokerState {
  settings: VideoPokerSettings;
  rngSeed: number;
  credits: number;
  handsPlayed: number;
  phase: VideoPokerPhase;
  hand: HeldCard[];
  lastHandName: string;
  lastPayout: number;
}

export type VideoPokerAction =
  | { type: "deal" }
  | { type: "toggleHold"; index: number }
  | { type: "draw" };

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

export function initialState(seed: number, settings: VideoPokerSettings): VideoPokerState {
  const { rng, nextSeed } = advanceSeed(seed);
  // Pre-shuffle deck but don't deal yet
  const deck = shuffle(newDeck(1), rng);
  // Store in shoe for consistency but don't use until deal
  void deck;
  return {
    settings,
    rngSeed: nextSeed,
    credits: 100,
    handsPlayed: 0,
    phase: "deal",
    hand: [],
    lastHandName: "",
    lastPayout: 0,
  };
}

// Hand evaluation

function counts(hand: Card[]): number[] {
  const freq: Record<number, number> = {};
  for (const c of hand) {
    freq[c.rank] = (freq[c.rank] ?? 0) + 1;
  }
  return Object.values(freq).sort((a, b) => b - a);
}

function isFlush(hand: Card[]): boolean {
  const suit = hand[0]!.suit;
  return hand.every((c) => c.suit === suit);
}

function isStraight(hand: Card[]): boolean {
  const ranks = hand.map((c) => c.rank).sort((a, b) => a - b);
  // Normal straight
  if (ranks[4]! - ranks[0]! === 4 && new Set(ranks).size === 5) return true;
  // Ace-low straight A-2-3-4-5 (ranks: 1,2,3,4,5)
  if (JSON.stringify(ranks) === JSON.stringify([1, 2, 3, 4, 5])) return true;
  // Ace-high straight 10-J-Q-K-A (ranks: 1,10,11,12,13)
  if (JSON.stringify(ranks) === JSON.stringify([1, 10, 11, 12, 13])) return true;
  return false;
}

function isRoyalFlush(hand: Card[]): boolean {
  if (!isFlush(hand)) return false;
  const ranks = hand.map((c) => c.rank).sort((a, b) => a - b);
  return JSON.stringify(ranks) === JSON.stringify([1, 10, 11, 12, 13]);
}

function isStraightFlush(hand: Card[]): boolean {
  return isFlush(hand) && isStraight(hand) && !isRoyalFlush(hand);
}

function isFourOfAKind(hand: Card[]): boolean {
  return counts(hand)[0] === 4;
}

function isFullHouse(hand: Card[]): boolean {
  const c = counts(hand);
  return c[0] === 3 && c[1] === 2;
}

function isThreeOfAKind(hand: Card[]): boolean {
  const c = counts(hand);
  return c[0] === 3 && c[1] !== 2;
}

function isTwoPair(hand: Card[]): boolean {
  const c = counts(hand);
  return c[0] === 2 && c[1] === 2;
}

// Jacks or better: pair of J(11), Q(12), K(13), or A(1)
function isJacksOrBetter(hand: Card[]): boolean {
  const freq: Record<number, number> = {};
  for (const c of hand) {
    freq[c.rank] = (freq[c.rank] ?? 0) + 1;
  }
  for (const [rankStr, cnt] of Object.entries(freq)) {
    const rank = parseInt(rankStr, 10);
    if (cnt >= 2 && (rank === 1 || rank >= 11)) return true;
  }
  return false;
}

export interface HandResult {
  name: string;
  multiplier: number;
}

export function evaluateHand(hand: Card[], paytable: "9/6" | "8/5"): HandResult {
  const fullHouseMult = paytable === "9/6" ? 9 : 8;
  const flushMult = paytable === "9/6" ? 6 : 5;

  if (isRoyalFlush(hand)) return { name: "Royal Flush", multiplier: 800 };
  if (isStraightFlush(hand)) return { name: "Straight Flush", multiplier: 50 };
  if (isFourOfAKind(hand)) return { name: "Four of a Kind", multiplier: 25 };
  if (isFullHouse(hand)) return { name: "Full House", multiplier: fullHouseMult };
  if (isFlush(hand)) return { name: "Flush", multiplier: flushMult };
  if (isStraight(hand)) return { name: "Straight", multiplier: 4 };
  if (isThreeOfAKind(hand)) return { name: "Three of a Kind", multiplier: 3 };
  if (isTwoPair(hand)) return { name: "Two Pair", multiplier: 2 };
  if (isJacksOrBetter(hand)) return { name: "Jacks or Better", multiplier: 1 };
  return { name: "", multiplier: 0 };
}

export function reducer(state: VideoPokerState, action: VideoPokerAction): VideoPokerState {
  switch (action.type) {
    case "deal": {
      if (state.phase !== "deal" && state.phase !== "shown") return state;
      if (state.credits <= 0) return state;
      if (state.handsPlayed >= state.settings.handsPerSession) return state;

      const bet = parseInt(state.settings.betSize, 10);
      if (state.credits < bet) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const deck = shuffle(newDeck(1), rng);
      const { drawn } = deal(deck, 5);

      const hand: HeldCard[] = drawn.map((card) => ({ card, held: false }));

      return {
        ...state,
        rngSeed: nextSeed,
        credits: state.credits - bet,
        phase: "hold",
        hand,
        lastHandName: "",
        lastPayout: 0,
      };
    }

    case "toggleHold": {
      if (state.phase !== "hold") return state;
      const { index } = action;
      if (index < 0 || index >= state.hand.length) return state;

      const newHand = state.hand.map((hc, i) =>
        i === index ? { ...hc, held: !hc.held } : hc
      );
      return { ...state, hand: newHand };
    }

    case "draw": {
      if (state.phase !== "hold") return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const deck = shuffle(newDeck(1), rng);
      // Deal from fresh deck; held cards stay, non-held replaced
      const discardCount = state.hand.filter((hc) => !hc.held).length;
      const { drawn: replacements } = deal(deck, discardCount);

      let replIdx = 0;
      const newHand: HeldCard[] = state.hand.map((hc) => {
        if (hc.held) return hc;
        const card = replacements[replIdx++]!;
        return { card, held: false };
      });

      const finalCards = newHand.map((hc) => hc.card);
      const result = evaluateHand(finalCards, state.settings.paytable);
      const bet = parseInt(state.settings.betSize, 10);
      const payout = result.multiplier * bet;

      return {
        ...state,
        rngSeed: nextSeed,
        credits: state.credits + payout,
        handsPlayed: state.handsPlayed + 1,
        phase: "shown",
        hand: newHand,
        lastHandName: result.name,
        lastPayout: payout,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: VideoPokerState): { score: number } | null {
  if (state.phase === "hold") return null; // mid-hand
  if (state.credits <= 0 || state.handsPlayed >= state.settings.handsPerSession) {
    return { score: state.credits };
  }
  return null;
}
