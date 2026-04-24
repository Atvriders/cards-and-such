// Schafkopf – Bavarian trick-taking game (4 players, 32-card deck)
// Player vs 3 bots. Player is always the "solo" declarer for simplicity.
import type { Card, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SchafkopfSettings {
  botDifficulty: "easy" | "hard";
}

export type SchafkopfPhase = "playing" | "done";

export interface SchafkopfState {
  settings: SchafkopfSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: SchafkopfPhase;
  tricks: readonly number[];       // tricks won per seat
  points: readonly number[];       // card-point total per seat
  score: readonly [number, number]; // [player, bots]
  message: string;
}

export type SchafkopfAction =
  | { type: "play"; cardId: string };

// 32-card deck: 7-A in all 4 suits
const SCHAFKOPF_RANKS = [7, 8, 9, 10, 11, 12, 13, 1] as const; // 1=A, 10, K=13, Q=12, J=11
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

function schafkopfDeck(): Card[] {
  const cards: Card[] = [];
  for (const s of SUITS) {
    for (const r of SCHAFKOPF_RANKS) {
      cards.push({ suit: s, rank: r as Card["rank"], id: `sk-${s}${r}` });
    }
  }
  return cards;
}

// Trump order in Schafkopf (Rufspiel/Solo):
// Queens (Obers) trump: ♣Q > ♠Q > ♥Q > ♦Q
// Jacks (Unters) trump: ♣J > ♠J > ♥J > ♦J
// Then hearts trump suit: A,10,K,9,8,7
// Non-trump: A,10,K,9,8,7 in suit order
const TRUMP_SUIT: Suit = "♥"; // Hearts is trump suit (Herzrufsolo variant)
const TRUMP_QUEENS: Card["rank"] = 12; // Q
const TRUMP_JACKS: Card["rank"] = 11;  // J

function isTrump(card: Card): boolean {
  return card.rank === TRUMP_QUEENS || card.rank === TRUMP_JACKS || card.suit === TRUMP_SUIT;
}

function effectiveSuit(card: Card): Suit | "trump" {
  if (isTrump(card)) return "trump";
  return card.suit;
}

// Schafkopf card point values
function cardPoints(card: Card): number {
  if (card.rank === 1) return 11;  // Ace
  if (card.rank === 10) return 10;
  if (card.rank === 13) return 4;  // King
  if (card.rank === 12) return 3;  // Queen (Ober)
  if (card.rank === 11) return 2;  // Jack (Unter)
  return 0;
}

// Trump strength (higher = stronger)
function trumpStrength(card: Card): number {
  if (card.rank === TRUMP_QUEENS) {
    const order: Record<string, number> = { "♣": 100, "♠": 99, "♥": 98, "♦": 97 };
    return order[card.suit] ?? 90;
  }
  if (card.rank === TRUMP_JACKS) {
    const order: Record<string, number> = { "♣": 96, "♠": 95, "♥": 94, "♦": 93 };
    return order[card.suit] ?? 80;
  }
  // Hearts trump
  const rankOrder: Record<number, number> = { 1: 14, 10: 10, 13: 13, 9: 9, 8: 8, 7: 7 };
  return rankOrder[card.rank] ?? 0;
}

function nonTrumpStrength(card: Card): number {
  const rankOrder: Record<number, number> = { 1: 14, 10: 10, 13: 13, 9: 9, 8: 8, 7: 7 };
  return rankOrder[card.rank] ?? 0;
}

function cardStrength(card: Card, ledSuit: Suit | "trump"): number {
  if (isTrump(card)) return 1000 + trumpStrength(card);
  if (card.suit === ledSuit) return 100 + nonTrumpStrength(card);
  return nonTrumpStrength(card);
}

function trickWinner(trick: readonly { seat: number; card: Card }[]): number {
  const ledSuit = effectiveSuit(trick[0]!.card);
  return trick.reduce((best, cur) =>
    cardStrength(cur.card, ledSuit) > cardStrength(best.card, ledSuit) ? cur : best
  ).seat;
}

export function legalPlays(state: SchafkopfState, seat: number): Card[] {
  const hand = [...(state.hands[seat] ?? [])];
  const trick = state.currentTrick;
  if (trick.length === 0) return hand;

  const led = effectiveSuit(trick[0]!.card);
  const matching = hand.filter(c => effectiveSuit(c) === led);
  return matching.length > 0 ? matching : hand;
}

function botPlay(state: SchafkopfState, seat: number): Card {
  const legal = legalPlays(state, seat);
  if (legal.length === 1) return legal[0]!;
  const trick = state.currentTrick;
  const led = trick.length > 0 ? effectiveSuit(trick[0]!.card) : null;
  if (trick.length === 0) {
    // Lead lowest card
    return legal.reduce((lo, c) => cardStrength(c, effectiveSuit(c)) < cardStrength(lo, effectiveSuit(lo)) ? c : lo);
  }
  const bestSoFar = trick.reduce((b, cur) =>
    cardStrength(cur.card, led!) > cardStrength(b.card, led!) ? cur : b
  );
  const winCards = legal.filter(c => cardStrength(c, led!) > cardStrength(bestSoFar.card, led!));
  if (winCards.length > 0) {
    return winCards.reduce((lo, c) => cardStrength(c, led!) < cardStrength(lo, led!) ? c : lo);
  }
  return legal.reduce((lo, c) => cardStrength(c, led!) < cardStrength(lo, led!) ? c : lo);
}

function applyPlay(state: SchafkopfState, seat: number, card: Card, rng: () => number): SchafkopfState {
  const newHands = state.hands.map((h, i) =>
    i === seat ? h.filter(c => c.id !== card.id) : h
  );
  const newTrick = [...state.currentTrick, { seat, card }];
  let s: SchafkopfState = { ...state, hands: newHands, currentTrick: newTrick };

  if (newTrick.length === 4) {
    const winner = trickWinner(newTrick);
    const trickPts = newTrick.reduce((sum, e) => sum + cardPoints(e.card), 0);
    const newTricks = state.tricks.map((t, i) => i === winner ? t + 1 : t);
    const newPoints = state.points.map((p, i) => i === winner ? p + trickPts : p);
    s = { ...s, currentTrick: [], tricks: newTricks, points: newPoints, leadSeat: winner, turn: winner };

    if (newHands[0]!.length === 0) {
      const playerPts = newPoints[0]!;
      const botPts = newPoints[1]! + newPoints[2]! + newPoints[3]!;
      const playerWon = playerPts > botPts;
      const newScore: [number, number] = [state.score[0] + (playerWon ? 1 : 0), state.score[1] + (playerWon ? 0 : 1)];
      s = {
        ...s,
        score: newScore,
        phase: "done",
        message: playerWon
          ? `You win! ${playerPts} vs ${botPts} card-points.`
          : `Bots win. ${botPts} vs ${playerPts} card-points.`,
      };
    }
  } else {
    s = { ...s, turn: (seat + 1) % 4 };
  }
  return s;
}

export function reducer(state: SchafkopfState, action: SchafkopfAction): SchafkopfState {
  if (state.phase === "done") return state;
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const botRng = mulberry32(nextSeed);

  if (action.type === "play") {
    if (state.turn !== 0) return state;
    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;
    if (!legalPlays(state, 0).some(c => c.id === card.id)) return state;

    let s: SchafkopfState = { ...state, rngSeed: nextSeed };
    s = applyPlay(s, 0, card, botRng);
    while (s.phase === "playing" && s.turn !== 0) {
      const botCard = botPlay(s, s.turn);
      s = applyPlay(s, s.turn, botCard, botRng);
    }
    return s;
  }
  return state;
}

export function initialState(seed: number, settings: SchafkopfSettings): SchafkopfState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);
  const deck = shuffle(schafkopfDeck(), dealRng);
  const hands: Card[][] = [
    deck.slice(0, 8),
    deck.slice(8, 16),
    deck.slice(16, 24),
    deck.slice(24, 32),
  ];
  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands,
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "playing",
    tricks: [0, 0, 0, 0],
    points: [0, 0, 0, 0],
    score: [0, 0],
    message: "Play a card. Hearts + all Queens/Jacks are trump.",
  };
}

export function isTerminal(state: SchafkopfState): { score: number } | null {
  if (state.phase !== "done") return null;
  const diff = state.score[0] - state.score[1];
  return { score: Math.max(0, Math.min(100, 50 + diff * 25)) };
}
