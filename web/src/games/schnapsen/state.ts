import type { Card, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Schnapsen: 20-card deck — J, Q, K, 10, A of 4 suits
const SCHNAP_RANKS = [11, 12, 13, 10, 1] as const;
const SUITS: Suit[] = ["♣", "♠", "♥", "♦"];

export function schnapsenDeck(): Card[] {
  const cards: Card[] = [];
  for (const s of SUITS) {
    for (const r of SCHNAP_RANKS) {
      cards.push({ suit: s, rank: r as Card["rank"], id: `sn-${s}${r}` });
    }
  }
  return cards;
}

export function cardValue(rank: Card["rank"]): number {
  if (rank === 1) return 11;   // Ace
  if (rank === 10) return 10;
  if (rank === 13) return 4;   // King
  if (rank === 12) return 3;   // Queen
  if (rank === 11) return 2;   // Jack
  return 0;
}

export function trumpStrength(rank: Card["rank"]): number {
  if (rank === 1) return 5;
  if (rank === 10) return 4;
  if (rank === 13) return 3;
  if (rank === 12) return 2;
  return 1; // Jack
}

export function offStrength(rank: Card["rank"]): number {
  return trumpStrength(rank); // same ordering off-suit
}

export function isTrump(card: Card, trumpSuit: Suit): boolean {
  return card.suit === trumpSuit;
}

export function trickWinner(
  trick: readonly { seat: number; card: Card }[],
  trumpSuit: Suit
): number {
  const a = trick[0]!;
  const b = trick[1]!;
  const aTr = isTrump(a.card, trumpSuit);
  const bTr = isTrump(b.card, trumpSuit);
  if (aTr && bTr) return trumpStrength(a.card.rank) >= trumpStrength(b.card.rank) ? a.seat : b.seat;
  if (aTr) return a.seat;
  if (bTr) return b.seat;
  // Both off-suit: led card wins unless follower matches led suit and is higher
  if (b.card.suit === a.card.suit && offStrength(b.card.rank) > offStrength(a.card.rank)) return b.seat;
  return a.seat;
}

// Check for marriage (K+Q of same suit)
export function marriageBonus(hand: readonly Card[], trumpSuit: Suit): { suit: Suit; bonus: number } | null {
  for (const suit of SUITS) {
    const hasK = hand.some(c => c.suit === suit && c.rank === 13);
    const hasQ = hand.some(c => c.suit === suit && c.rank === 12);
    if (hasK && hasQ) return { suit, bonus: suit === trumpSuit ? 40 : 20 };
  }
  return null;
}

export type SchnapsenPhase = "playing" | "done";

export interface SchnapsenState {
  rngSeed: number;
  hands: readonly (readonly Card[])[];  // 2 seats
  stock: readonly Card[];
  trumpCard: Card;  // turned-up trump
  trumpSuit: Suit;
  currentTrick: readonly { seat: number; card: Card }[];
  wonCards: readonly (readonly Card[])[];
  scores: readonly number[];   // accumulated points per seat
  marriageDeclared: boolean;
  currentLeader: number;
  phase: SchnapsenPhase;
  message: string;
}

function botPlay(hand: readonly Card[], trick: readonly { seat: number; card: Card }[], trumpSuit: Suit, stockEmpty: boolean): Card {
  if (trick.length === 0) {
    // Lead highest-value trump if available, else lowest card
    const trumps = hand.filter(c => isTrump(c, trumpSuit));
    if (trumps.length > 0) return trumps.reduce((hi, c) => trumpStrength(c.rank) > trumpStrength(hi.rank) ? c : hi);
    return hand.reduce((lo, c) => cardValue(c.rank) < cardValue(lo.rank) ? c : lo);
  }
  const ledCard = trick[0]!.card;
  if (stockEmpty) {
    // Must follow suit or trump
    const follow = hand.filter(c => c.suit === ledCard.suit);
    if (follow.length > 0) return follow.reduce((hi, c) => offStrength(c.rank) > offStrength(hi.rank) ? c : hi);
    const trumps = hand.filter(c => isTrump(c, trumpSuit));
    if (trumps.length > 0) return trumps.reduce((hi, c) => trumpStrength(c.rank) > trumpStrength(hi.rank) ? c : hi);
    return hand[0]!;
  }
  // Stock not empty: play any card
  const canWin = hand.filter(c => {
    const bTr = isTrump(ledCard, trumpSuit);
    const cTr = isTrump(c, trumpSuit);
    if (bTr && cTr) return trumpStrength(c.rank) > trumpStrength(ledCard.rank);
    if (!bTr && cTr) return true;
    if (!bTr && !cTr && c.suit === ledCard.suit) return offStrength(c.rank) > offStrength(ledCard.rank);
    return false;
  });
  if (canWin.length > 0) return canWin[0]!;
  return hand.reduce((lo, c) => cardValue(c.rank) < cardValue(lo.rank) ? c : lo);
}

function draw(state: SchnapsenState): SchnapsenState {
  if (state.stock.length === 0) return state;
  const [p0Card, ...rest1] = state.stock;
  if (!p0Card) return state;
  const [p1Card, ...rest2] = rest1;
  if (!p1Card) {
    // Only one card left — winner gets trump card
    const newHands = state.hands.map((h, i) => i === state.currentLeader ? [...h, p0Card] : [...h, state.trumpCard]);
    return { ...state, hands: newHands as readonly (readonly Card[])[], stock: [] };
  }
  const winner = state.currentLeader;
  const loser = 1 - winner;
  const newHands = state.hands.map((h, i) => i === winner ? [...h, p0Card] : i === loser ? [...h, p1Card] : h);
  return { ...state, hands: newHands as readonly (readonly Card[])[], stock: rest2 };
}

function checkWin(state: SchnapsenState): SchnapsenState | null {
  for (let seat = 0; seat < 2; seat++) {
    if (state.scores[seat]! >= 66) {
      const youWin = seat === 0;
      return {
        ...state,
        phase: "done",
        message: youWin
          ? `You win! Your score: ${state.scores[0]} pts (≥66).`
          : `Bot wins! Bot score: ${state.scores[1]} pts (≥66).`,
      };
    }
  }
  return null;
}

function runBot(state: SchnapsenState): SchnapsenState {
  let s = state;
  while (s.phase === "playing") {
    const tLen = s.currentTrick.length;
    let nextSeat: number;
    if (tLen === 0) nextSeat = s.currentLeader;
    else nextSeat = 1 - s.currentTrick[0]!.seat;

    if (nextSeat === 0) break;

    const hand = s.hands[1]!;
    if (hand.length === 0) {
      s = { ...s, phase: "done", message: `Game over! You: ${s.scores[0]} pts, Bot: ${s.scores[1]} pts.` };
      break;
    }

    const stockEmpty = s.stock.length === 0;
    const card = botPlay(hand, s.currentTrick, s.trumpSuit, stockEmpty);
    const newHands = s.hands.map((h, i) => i === 1 ? h.filter(c => c.id !== card.id) : h);
    const newTrick = [...s.currentTrick, { seat: 1, card }];

    if (newTrick.length === 2) {
      const winner = trickWinner(newTrick, s.trumpSuit);
      const pts = newTrick.reduce((sum, e) => sum + cardValue(e.card.rank), 0);
      const newScores = s.scores.map((sc, i) => i === winner ? sc + pts : sc) as [number, number];
      const newWon = s.wonCards.map((w, i) => i === winner ? [...w, ...newTrick.map(e => e.card)] : w);
      let ns: SchnapsenState = {
        ...s, hands: newHands as readonly (readonly Card[])[],
        wonCards: newWon, scores: newScores, currentTrick: [], currentLeader: winner,
        message: winner === 0 ? `You won the trick! +${pts} pts.` : `Bot won the trick. +${pts} pts to bot.`,
      };
      const win = checkWin(ns);
      if (win) { s = win; break; }
      // Draw cards
      if (ns.stock.length > 0) ns = draw(ns);
      if (ns.hands[0]!.length === 0 && ns.hands[1]!.length === 0) {
        ns = { ...ns, phase: "done", message: `Game over! You: ${ns.scores[0]} pts, Bot: ${ns.scores[1]} pts.` };
      }
      s = ns;
    } else {
      s = { ...s, hands: newHands as readonly (readonly Card[])[], currentTrick: newTrick };
    }
  }
  return s;
}

export type SchnapsenAction =
  | { type: "play"; cardId: string }
  | { type: "marriage" };

export function reducer(state: SchnapsenState, action: SchnapsenAction): SchnapsenState {
  if (state.phase === "done") return state;

  if (action.type === "play") {
    const hand = state.hands[0]!;
    const card = hand.find(c => c.id === action.cardId);
    if (!card) return state;

    const stockEmpty = state.stock.length === 0;
    if (stockEmpty && state.currentTrick.length > 0) {
      const ledCard = state.currentTrick[0]!.card;
      const follow = hand.filter(c => c.suit === ledCard.suit);
      const trumps = hand.filter(c => isTrump(c, state.trumpSuit));
      if (follow.length > 0 && card.suit !== ledCard.suit) return state;
      if (follow.length === 0 && trumps.length > 0 && !isTrump(card, state.trumpSuit)) return state;
    }

    const newHand = hand.filter(c => c.id !== card.id);
    const newHands = state.hands.map((h, i) => i === 0 ? newHand : h);
    const newTrick = [...state.currentTrick, { seat: 0, card }];

    if (newTrick.length === 2) {
      const winner = trickWinner(newTrick, state.trumpSuit);
      const pts = newTrick.reduce((sum, e) => sum + cardValue(e.card.rank), 0);
      const newScores = state.scores.map((sc, i) => i === winner ? sc + pts : sc) as [number, number];
      const newWon = state.wonCards.map((w, i) => i === winner ? [...w, ...newTrick.map(e => e.card)] : w);
      let ns: SchnapsenState = {
        ...state, hands: newHands as readonly (readonly Card[])[],
        wonCards: newWon, scores: newScores, currentTrick: [], currentLeader: winner,
        message: winner === 0 ? `You won the trick! +${pts} pts.` : `Bot won the trick. +${pts} pts to bot.`,
      };
      const win = checkWin(ns);
      if (win) return win;
      if (ns.stock.length > 0) ns = draw(ns);
      if (ns.hands[0]!.length === 0 && ns.hands[1]!.length === 0) {
        return { ...ns, phase: "done", message: `Game over! You: ${ns.scores[0]} pts, Bot: ${ns.scores[1]} pts.` };
      }
      return runBot(ns);
    } else {
      // Player led, bot responds
      let ns = { ...state, hands: newHands as readonly (readonly Card[])[], currentTrick: newTrick };
      return runBot(ns);
    }
  }

  return state;
}

export function initialState(seed: number): SchnapsenState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const deck = shuffle(schnapsenDeck(), mulberry32(nextSeed));

  const hand0 = deck.slice(0, 5);
  const hand1 = deck.slice(5, 10);
  const trumpCard = deck[10]!;
  const stock = deck.slice(10); // trump card is at bottom of stock

  return {
    rngSeed: Math.floor(mulberry32(nextSeed)() * 2 ** 31),
    hands: [hand0, hand1],
    stock,
    trumpCard,
    trumpSuit: trumpCard.suit,
    currentTrick: [],
    wonCards: [[], []],
    scores: [0, 0],
    marriageDeclared: false,
    currentLeader: 0,
    phase: "playing",
    message: `Trump: ${trumpCard.suit} (${trumpCard.suit}${trumpCard.rank === 1 ? "A" : trumpCard.rank === 13 ? "K" : trumpCard.rank === 12 ? "Q" : trumpCard.rank === 11 ? "J" : trumpCard.rank}). First to 66 points wins! Click a card to lead.`,
  };
}

export function isTerminal(state: SchnapsenState): { score: number } | null {
  if (state.phase !== "done") return null;
  const youWin = state.scores[0]! >= state.scores[1]!;
  return { score: youWin ? Math.min(100, 50 + state.scores[0]!) : Math.max(0, 50 - state.scores[1]!) };
}
