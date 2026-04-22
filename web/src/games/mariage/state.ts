import type { Card, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Mariage (66): 24-card deck — 9, 10, J, Q, K, A of 4 suits
const MAR_RANKS = [9, 10, 11, 12, 13, 1] as const;
const SUITS: Suit[] = ["♣", "♠", "♥", "♦"];

export function mariageDeck(): Card[] {
  const cards: Card[] = [];
  for (const s of SUITS) {
    for (const r of MAR_RANKS) {
      cards.push({ suit: s, rank: r as Card["rank"], id: `ma-${s}${r}` });
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
  return 0;                    // 9
}

export function cardStrength(rank: Card["rank"]): number {
  if (rank === 1) return 6;
  if (rank === 10) return 5;
  if (rank === 13) return 4;
  if (rank === 12) return 3;
  if (rank === 11) return 2;
  return 1; // 9
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
  if (aTr && bTr) return cardStrength(a.card.rank) >= cardStrength(b.card.rank) ? a.seat : b.seat;
  if (aTr) return a.seat;
  if (bTr) return b.seat;
  if (b.card.suit === a.card.suit && cardStrength(b.card.rank) > cardStrength(a.card.rank)) return b.seat;
  return a.seat;
}

export type MariagePhase = "playing" | "done";

export interface MariageState {
  rngSeed: number;
  hands: readonly (readonly Card[])[];  // 2 seats
  stock: readonly Card[];
  trumpCard: Card;
  trumpSuit: Suit;
  currentTrick: readonly { seat: number; card: Card }[];
  wonCards: readonly (readonly Card[])[];
  scores: readonly number[];
  currentLeader: number;
  phase: MariagePhase;
  message: string;
}

function botPlay(hand: readonly Card[], trick: readonly { seat: number; card: Card }[], trumpSuit: Suit, stockEmpty: boolean): Card {
  if (trick.length === 0) {
    const trumps = hand.filter(c => isTrump(c, trumpSuit));
    if (trumps.length > 0) return trumps.reduce((hi, c) => cardStrength(c.rank) > cardStrength(hi.rank) ? c : hi);
    return hand.reduce((lo, c) => cardValue(c.rank) < cardValue(lo.rank) ? c : lo);
  }
  const ledCard = trick[0]!.card;
  if (stockEmpty) {
    const follow = hand.filter(c => c.suit === ledCard.suit);
    if (follow.length > 0) return follow.reduce((hi, c) => cardStrength(c.rank) > cardStrength(hi.rank) ? c : hi);
    const trumps = hand.filter(c => isTrump(c, trumpSuit));
    if (trumps.length > 0) return trumps.reduce((hi, c) => cardStrength(c.rank) > cardStrength(hi.rank) ? c : hi);
    return hand[0]!;
  }
  const canWin = hand.filter(c => {
    const bTr = isTrump(ledCard, trumpSuit);
    const cTr = isTrump(c, trumpSuit);
    if (bTr && cTr) return cardStrength(c.rank) > cardStrength(ledCard.rank);
    if (!bTr && cTr) return true;
    if (!bTr && !cTr && c.suit === ledCard.suit) return cardStrength(c.rank) > cardStrength(ledCard.rank);
    return false;
  });
  if (canWin.length > 0) return canWin[0]!;
  return hand.reduce((lo, c) => cardValue(c.rank) < cardValue(lo.rank) ? c : lo);
}

function draw(state: MariageState): MariageState {
  if (state.stock.length === 0) return state;
  const [p0Card, ...rest1] = state.stock;
  if (!p0Card) return state;
  const [p1Card, ...rest2] = rest1;
  if (!p1Card) {
    const winner = state.currentLeader;
    const loser = 1 - winner;
    const newHands = state.hands.map((h, i) => i === winner ? [...h, p0Card] : i === loser ? [...h, state.trumpCard] : h);
    return { ...state, hands: newHands as readonly (readonly Card[])[], stock: [] };
  }
  const winner = state.currentLeader;
  const loser = 1 - winner;
  const newHands = state.hands.map((h, i) => i === winner ? [...h, p0Card] : i === loser ? [...h, p1Card] : h);
  return { ...state, hands: newHands as readonly (readonly Card[])[], stock: rest2 };
}

function checkMarriageBonus(hand: readonly Card[], suit: Suit, trumpSuit: Suit): number {
  const hasK = hand.some(c => c.suit === suit && c.rank === 13);
  const hasQ = hand.some(c => c.suit === suit && c.rank === 12);
  if (hasK && hasQ) return suit === trumpSuit ? 40 : 20;
  return 0;
}

function checkWin(state: MariageState): MariageState | null {
  for (let seat = 0; seat < 2; seat++) {
    if (state.scores[seat]! >= 66) {
      return {
        ...state, phase: "done",
        message: seat === 0
          ? `You win! You scored ${state.scores[0]} pts (≥66).`
          : `Bot wins! Bot scored ${state.scores[1]} pts (≥66).`,
      };
    }
  }
  return null;
}

function runBot(state: MariageState): MariageState {
  let s = state;
  while (s.phase === "playing") {
    const tLen = s.currentTrick.length;
    const nextSeat = tLen === 0 ? s.currentLeader : 1 - s.currentTrick[0]!.seat;
    if (nextSeat === 0) break;

    const hand = s.hands[1]!;
    if (hand.length === 0) {
      s = { ...s, phase: "done", message: `Game over! You: ${s.scores[0]} pts, Bot: ${s.scores[1]} pts.` };
      break;
    }

    // Check marriage before leading
    let marriageBonus = 0;
    if (tLen === 0 && nextSeat === 1) {
      for (const suit of SUITS) {
        marriageBonus = Math.max(marriageBonus, checkMarriageBonus(hand, suit as Suit, s.trumpSuit));
      }
    }

    const stockEmpty = s.stock.length === 0;
    const card = botPlay(hand, s.currentTrick, s.trumpSuit, stockEmpty);
    const newHands = s.hands.map((h, i) => i === 1 ? h.filter(c => c.id !== card.id) : h);
    const newTrick = [...s.currentTrick, { seat: 1, card }];

    if (newTrick.length === 2) {
      const winner = trickWinner(newTrick, s.trumpSuit);
      const pts = newTrick.reduce((sum, e) => sum + cardValue(e.card.rank), 0);
      const newScores = s.scores.map((sc, i) => i === winner ? sc + pts + (i === 1 ? marriageBonus : 0) : sc) as [number, number];
      const newWon = s.wonCards.map((w, i) => i === winner ? [...w, ...newTrick.map(e => e.card)] : w);
      let ns: MariageState = {
        ...s, hands: newHands as readonly (readonly Card[])[],
        wonCards: newWon, scores: newScores, currentTrick: [], currentLeader: winner,
        message: winner === 0 ? `You won the trick! +${pts} pts.` : `Bot won the trick. +${pts} pts to bot.`,
      };
      const win = checkWin(ns);
      if (win) { s = win; break; }
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

export type MariageAction = { type: "play"; cardId: string };

export function reducer(state: MariageState, action: MariageAction): MariageState {
  if (state.phase === "done") return state;
  if (action.type !== "play") return state;

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

  // Check marriage bonus for player leading
  let marriageBonus = 0;
  if (state.currentTrick.length === 0) {
    for (const suit of SUITS) {
      marriageBonus = Math.max(marriageBonus, checkMarriageBonus(hand, suit as Suit, state.trumpSuit));
    }
  }

  const newHand = hand.filter(c => c.id !== card.id);
  const newHands = state.hands.map((h, i) => i === 0 ? newHand : h);
  const newTrick = [...state.currentTrick, { seat: 0, card }];

  if (newTrick.length === 2) {
    const winner = trickWinner(newTrick, state.trumpSuit);
    const pts = newTrick.reduce((sum, e) => sum + cardValue(e.card.rank), 0);
    const newScores = state.scores.map((sc, i) => i === winner ? sc + pts + (i === 0 ? marriageBonus : 0) : sc) as [number, number];
    const newWon = state.wonCards.map((w, i) => i === winner ? [...w, ...newTrick.map(e => e.card)] : w);
    let ns: MariageState = {
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
    const ns = { ...state, hands: newHands as readonly (readonly Card[])[], currentTrick: newTrick };
    return runBot(ns);
  }
}

export function initialState(seed: number): MariageState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const deck = shuffle(mariageDeck(), mulberry32(nextSeed));

  const hand0 = deck.slice(0, 6);
  const hand1 = deck.slice(6, 12);
  const trumpCard = deck[12]!;
  const stock = deck.slice(12);

  return {
    rngSeed: Math.floor(mulberry32(nextSeed)() * 2 ** 31),
    hands: [hand0, hand1],
    stock,
    trumpCard,
    trumpSuit: trumpCard.suit,
    currentTrick: [],
    wonCards: [[], []],
    scores: [0, 0],
    currentLeader: 0,
    phase: "playing",
    message: `Trump: ${trumpCard.suit}. Race to 66 points! K+Q same suit = marriage bonus (20 or 40 for trump). Click a card to lead.`,
  };
}

export function isTerminal(state: MariageState): { score: number } | null {
  if (state.phase !== "done") return null;
  const youWin = state.scores[0]! >= state.scores[1]!;
  return { score: youWin ? Math.min(100, 50 + state.scores[0]!) : Math.max(0, 50 - state.scores[1]!) };
}
