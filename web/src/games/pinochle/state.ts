import type { Card, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PinochleSettings {
  botDifficulty: "easy" | "standard";
}

export type PinochlePhase = "playing" | "done";

// Pinochle deck: two copies of 9,J,Q,K,A,10 of each suit (48 cards)
// Ranks: 9=9, J=11, Q=12, K=13, A=1, 10=10
// Trick-taking order (low to high): 9, J, Q, K, 10, A

export const PINOCHLE_RANKS = [9, 11, 12, 13, 10, 1] as const;
type PinochleRank = (typeof PINOCHLE_RANKS)[number];

// Rank order for trick-winning (9 lowest, A highest)
const TRICK_ORDER: Record<number, number> = { 9: 0, 11: 1, 12: 2, 13: 3, 10: 4, 1: 5 };

// Counter values for scoring
export function counterValue(rank: number): number {
  if (rank === 1) return 11;  // A
  if (rank === 10) return 10;
  if (rank === 13) return 4;  // K
  if (rank === 12) return 3;  // Q
  if (rank === 11) return 2;  // J
  return 0; // 9
}

export function makePinochleDeck(): Card[] {
  const suits: Suit[] = ["♠", "♥", "♦", "♣"];
  const cards: Card[] = [];
  for (let copy = 0; copy < 2; copy++) {
    for (const s of suits) {
      for (const r of PINOCHLE_RANKS) {
        cards.push({ suit: s, rank: r as Card["rank"], id: `${copy}-${s}${r}` });
      }
    }
  }
  return cards;
}

export interface Meld {
  name: string;
  value: number;
}

export function computeMelds(hand: readonly Card[], trump: Suit): Meld[] {
  const melds: Meld[] = [];

  // Helper
  const hasSuit = (suit: Suit, rank: number) => hand.some(c => c.suit === suit && c.rank === rank);
  const countSuit = (suit: Suit, rank: number) => hand.filter(c => c.suit === suit && c.rank === rank).length;

  // Run in trump (A, K, Q, J, 10 of trump) = 150
  if (hasSuit(trump, 1) && hasSuit(trump, 13) && hasSuit(trump, 12) && hasSuit(trump, 11) && hasSuit(trump, 10)) {
    melds.push({ name: `Run (${trump})`, value: 150 });
  }

  // Pinochle: Q♠ + J♦ = 40
  if (hasSuit("♠", 12) && hasSuit("♦", 11)) {
    melds.push({ name: "Pinochle (Q♠+J♦)", value: 40 });
  }

  // Four Aces = 100
  if (["♠", "♥", "♦", "♣"].every(s => hasSuit(s as Suit, 1))) {
    melds.push({ name: "Four Aces", value: 100 });
  }

  // Four Kings = 80
  if (["♠", "♥", "♦", "♣"].every(s => hasSuit(s as Suit, 13))) {
    melds.push({ name: "Four Kings", value: 80 });
  }

  // Four Queens = 60
  if (["♠", "♥", "♦", "♣"].every(s => hasSuit(s as Suit, 12))) {
    melds.push({ name: "Four Queens", value: 60 });
  }

  // Four Jacks = 40
  if (["♠", "♥", "♦", "♣"].every(s => hasSuit(s as Suit, 11))) {
    melds.push({ name: "Four Jacks", value: 40 });
  }

  // Marriage in trump = 40 (K+Q same suit, trump suit)
  if (hasSuit(trump, 13) && hasSuit(trump, 12)) {
    melds.push({ name: `Marriage in trump (${trump})`, value: 40 });
  }

  // Marriage in non-trump = 20 each
  const suits: Suit[] = ["♠", "♥", "♦", "♣"];
  for (const s of suits) {
    if (s !== trump && hasSuit(s, 13) && hasSuit(s, 12)) {
      melds.push({ name: `Marriage (${s})`, value: 20 });
    }
  }

  // Double pinochle: 2× Q♠ + 2× J♦ = 80 (bonus, simplified)
  if (countSuit("♠", 12) >= 2 && countSuit("♦", 11) >= 2) {
    melds.push({ name: "Double Pinochle", value: 80 });
  }

  return melds;
}

export interface PinochleState {
  settings: PinochleSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];   // 4 seats
  trumpSuit: Suit;
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: PinochlePhase;
  tricksTaken: readonly number[];        // per seat
  takenCards: readonly (readonly Card[])[];  // for counter scoring
  tricksPlayed: number;
  meldsByTeam: readonly [number, number]; // meld points for each team
  finalScores: readonly [number, number] | null;  // [team0, team1] counter+meld points
}

export type PinochleAction = { type: "play"; cardId: string };

// ── Trump selection ───────────────────────────────────────────────────────────

function chooseTrump(hand: readonly Card[]): Suit {
  const suits: Suit[] = ["♠", "♥", "♦", "♣"];
  let bestSuit: Suit = "♥";
  let bestCount = 0;
  for (const s of suits) {
    const count = hand.filter(c => c.suit === s).length;
    if (count > bestCount) { bestCount = count; bestSuit = s; }
  }
  return bestSuit;
}

// ── Trick resolution ──────────────────────────────────────────────────────────

function trickRank(card: Card, trump: Suit, led: Suit): number {
  const base = TRICK_ORDER[card.rank] ?? 0;
  if (card.suit === trump) return base + 100;
  if (card.suit === led) return base + 50;
  return 0; // off-suit non-trump can't win
}

function trickWinner(trick: readonly { seat: number; card: Card }[], trump: Suit): number {
  const led = trick[0]!.card.suit;
  return trick.reduce((best, cur) => {
    return trickRank(cur.card, trump, led) > trickRank(best.card, trump, led) ? cur : best;
  }).seat;
}

export function legalPlays(state: PinochleState, seat: number): Card[] {
  const hand = state.hands[seat]!;
  if (hand.length === 0) return [];
  const trick = state.currentTrick;
  if (trick.length === 0) return [...hand];
  const led = trick[0]!.card.suit;
  const suitCards = hand.filter(c => c.suit === led);
  if (suitCards.length > 0) return suitCards;
  const trumpCards = hand.filter(c => c.suit === state.trumpSuit);
  if (trumpCards.length > 0) return trumpCards;
  return [...hand];
}

// ── Bot play ──────────────────────────────────────────────────────────────────

function botPlay(state: PinochleState, seat: number, _rng: () => number): Card {
  const legal = legalPlays(state, seat);
  if (legal.length === 1) return legal[0]!;
  const trick = state.currentTrick;
  if (trick.length === 0) {
    return legal.reduce((lo, c) => (TRICK_ORDER[c.rank] ?? 0) < (TRICK_ORDER[lo.rank] ?? 0) ? c : lo);
  }
  const winner = trickWinner(trick, state.trumpSuit);
  const team = (s: number) => s % 2;
  if (team(winner) === team(seat)) {
    return legal.reduce((lo, c) => (TRICK_ORDER[c.rank] ?? 0) < (TRICK_ORDER[lo.rank] ?? 0) ? c : lo);
  }
  const led = trick[0]!.card.suit;
  const bestRank = trickRank(trick.find(e => e.seat === winner)!.card, state.trumpSuit, led);
  const beating = legal.filter(c => trickRank(c, state.trumpSuit, led) > bestRank);
  if (beating.length > 0) return beating.reduce((lo, c) => (TRICK_ORDER[c.rank] ?? 0) < (TRICK_ORDER[lo.rank] ?? 0) ? c : lo);
  return legal.reduce((lo, c) => (TRICK_ORDER[c.rank] ?? 0) < (TRICK_ORDER[lo.rank] ?? 0) ? c : lo);
}

// ── applyCard ─────────────────────────────────────────────────────────────────

function applyCard(state: PinochleState, seat: number, card: Card, _rng: () => number): PinochleState {
  const newHands = state.hands.map((h, i) =>
    i === seat ? h.filter(c => c.id !== card.id) : h
  );
  const newTrick = [...state.currentTrick, { seat, card }];
  let s: PinochleState = { ...state, hands: newHands, currentTrick: newTrick };

  if (newTrick.length === 4) {
    const winner = trickWinner(newTrick, state.trumpSuit);
    const newTricksTaken = state.tricksTaken.map((t, i) => i === winner ? t + 1 : t);
    const trickCards = newTrick.map(e => e.card);
    const newTakenCards = state.takenCards.map((tc, i) =>
      i === winner ? [...tc, ...trickCards] : tc
    );
    const tricksPlayed = state.tricksPlayed + 1;

    s = { ...s, currentTrick: [], tricksTaken: newTricksTaken, takenCards: newTakenCards, tricksPlayed, leadSeat: winner, turn: winner };

    if (tricksPlayed === 12) {
      // Compute counter points
      const counterPoints = (cards: readonly Card[]) => cards.reduce((sum, c) => sum + counterValue(c.rank), 0);
      const team0Counters = counterPoints(newTakenCards[0]!) + counterPoints(newTakenCards[2]!);
      const team1Counters = counterPoints(newTakenCards[1]!) + counterPoints(newTakenCards[3]!);

      const team0Melds = state.meldsByTeam[0];
      const team1Melds = state.meldsByTeam[1];

      const finalScores: [number, number] = [
        team0Counters + team0Melds,
        team1Counters + team1Melds,
      ];

      s = { ...s, phase: "done", finalScores };
    }
  } else {
    s = { ...s, turn: (seat + 1) % 4 };
  }

  return s;
}

// ── reducer ───────────────────────────────────────────────────────────────────

export function reducer(state: PinochleState, action: PinochleAction): PinochleState {
  if (state.phase === "done") return state;
  if (action.type !== "play") return state;
  if (state.turn !== 0) return state;

  const card = state.hands[0]!.find(c => c.id === action.cardId);
  if (!card) return state;
  const legal = legalPlays(state, 0);
  if (!legal.some(c => c.id === card.id)) return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const botRng = mulberry32(nextSeed);

  let s: PinochleState = { ...state, rngSeed: nextSeed };
  s = applyCard(s, 0, card, botRng);

  while (s.phase !== "done" && s.turn !== 0) {
    if (s.hands[s.turn]!.length === 0) break;
    const botCard = botPlay(s, s.turn, botRng);
    s = applyCard(s, s.turn, botCard, botRng);
  }

  return s;
}

// ── initialState ──────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: PinochleSettings): PinochleState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const deck = shuffle(makePinochleDeck(), dealRng);
  const hands: Card[][] = [
    deck.slice(0, 12),
    deck.slice(12, 24),
    deck.slice(24, 36),
    deck.slice(36, 48),
  ];

  // Auto-declare trump based on bot 1's strongest suit (simplified)
  const trumpSuit = chooseTrump(hands[1]!);

  // Compute melds for each team
  const team0Melds = computeMelds(hands[0]!, trumpSuit).reduce((s, m) => s + m.value, 0)
    + computeMelds(hands[2]!, trumpSuit).reduce((s, m) => s + m.value, 0);
  const team1Melds = computeMelds(hands[1]!, trumpSuit).reduce((s, m) => s + m.value, 0)
    + computeMelds(hands[3]!, trumpSuit).reduce((s, m) => s + m.value, 0);

  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands,
    trumpSuit,
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "playing",
    tricksTaken: [0, 0, 0, 0],
    takenCards: [[], [], [], []],
    tricksPlayed: 0,
    meldsByTeam: [team0Melds, team1Melds],
    finalScores: null,
  };
}

// ── isTerminal ────────────────────────────────────────────────────────────────

export function isTerminal(state: PinochleState): { score: number } | null {
  if (state.phase !== "done" || !state.finalScores) return null;
  const team0 = state.finalScores[0];
  const team1 = state.finalScores[1];
  if (team0 > team1) return { score: 100 };
  if (team0 < team1) return { score: 0 };
  return { score: 50 };
}
