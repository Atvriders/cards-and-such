import type { Card, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// 32-card deck: 7-A of 4 suits
const BEL_RANKS = [7, 8, 9, 10, 11, 12, 13, 1] as const;
const SUITS: Suit[] = ["♣", "♠", "♥", "♦"];

export function beloteDeck(): Card[] {
  const cards: Card[] = [];
  for (const s of SUITS) {
    for (const r of BEL_RANKS) {
      cards.push({ suit: s, rank: r as Card["rank"], id: `be-${s}${r}` });
    }
  }
  return cards;
}

export function cardValue(rank: Card["rank"], isTrumpCard: boolean): number {
  if (isTrumpCard) {
    if (rank === 11) return 20;  // Jass
    if (rank === 9) return 14;   // Menel
    if (rank === 1) return 11;
    if (rank === 10) return 10;
    if (rank === 13) return 4;
    if (rank === 12) return 3;
    return 0;
  }
  if (rank === 1) return 11;
  if (rank === 10) return 10;
  if (rank === 13) return 4;
  if (rank === 12) return 3;
  if (rank === 11) return 2;
  return 0;
}

export function isTrump(card: Card, trumpSuit: Suit): boolean {
  return card.suit === trumpSuit;
}

export function trumpStrength(rank: Card["rank"]): number {
  if (rank === 11) return 8; // Jass
  if (rank === 9) return 7;  // Menel
  if (rank === 1) return 6;
  if (rank === 10) return 5;
  if (rank === 13) return 4;
  if (rank === 12) return 3;
  if (rank === 8) return 2;
  return 1; // 7
}

export function offStrength(rank: Card["rank"]): number {
  if (rank === 1) return 7;
  if (rank === 10) return 6;
  if (rank === 13) return 5;
  if (rank === 12) return 4;
  if (rank === 11) return 3;
  if (rank === 9) return 2;
  if (rank === 8) return 1;
  return 0; // 7
}

export function trickWinner(
  trick: readonly { seat: number; card: Card }[],
  trumpSuit: Suit
): number {
  const ledCard = trick[0]!.card;
  const ledTr = isTrump(ledCard, trumpSuit);
  const ledSuit = ledCard.suit;

  return trick.reduce((best, cur) => {
    const b = best.card;
    const c = cur.card;
    const bTr = isTrump(b, trumpSuit);
    const cTr = isTrump(c, trumpSuit);

    if (bTr && cTr) return trumpStrength(c.rank) > trumpStrength(b.rank) ? cur : best;
    if (cTr && !bTr) return cur;
    if (bTr && !cTr) return best;
    const bLed = !ledTr && b.suit === ledSuit;
    const cLed = !ledTr && c.suit === ledSuit;
    if (bLed && !cLed) return best;
    if (cLed && !bLed) return cur;
    if (bLed && cLed) return offStrength(c.rank) > offStrength(b.rank) ? cur : best;
    return best;
  }).seat;
}

export type BelotePhase = "bidding" | "playing" | "done";

export interface BeloteState {
  rngSeed: number;
  hands: readonly (readonly Card[])[];  // 4 seats
  turnUpCard: Card;
  trumpSuit: Suit | null;
  declarerTeam: number | null;  // 0 = seats 0+2, 1 = seats 1+3
  currentTrick: readonly { seat: number; card: Card }[];
  wonCards: readonly (readonly Card[])[];
  trickCount: number;
  currentLeader: number;
  phase: BelotePhase;
  message: string;
}

function handStrength(hand: readonly Card[], potentialTrump: Suit): number {
  return hand.reduce((sum, c) => {
    if (c.suit === potentialTrump) {
      return sum + cardValue(c.rank, true);
    }
    return sum + Math.floor(cardValue(c.rank, false) / 3);
  }, 0);
}

function botPlay(hand: readonly Card[], trick: readonly { seat: number; card: Card }[], trumpSuit: Suit): Card {
  if (trick.length === 0) {
    const trumps = hand.filter(c => isTrump(c, trumpSuit));
    if (trumps.length >= 3) {
      return trumps.reduce((hi, c) => trumpStrength(c.rank) > trumpStrength(hi.rank) ? c : hi);
    }
    const nonTr = hand.filter(c => !isTrump(c, trumpSuit));
    const pool = nonTr.length > 0 ? nonTr : [...hand];
    return pool.reduce((lo, c) => cardValue(c.rank, false) < cardValue(lo.rank, false) ? c : lo);
  }
  const ledCard = trick[0]!.card;
  const ledTr = isTrump(ledCard, trumpSuit);
  const follow = hand.filter(c =>
    ledTr ? isTrump(c, trumpSuit) : (!isTrump(c, trumpSuit) && c.suit === ledCard.suit)
  );
  const pool = follow.length > 0 ? follow : [...hand];
  return pool.reduce((lo, c) => cardValue(c.rank, isTrump(lo, trumpSuit)) < cardValue(lo.rank, isTrump(lo, trumpSuit)) ? c : lo);
}

function runBots(state: BeloteState): BeloteState {
  if (!state.trumpSuit) return state;
  let s = state;
  while (s.phase === "playing") {
    const tLen = s.currentTrick.length;
    let nextSeat: number;
    if (tLen === 0) nextSeat = s.currentLeader;
    else nextSeat = (s.currentTrick[tLen - 1]!.seat + 1) % 4;

    if (nextSeat === 0) break;

    const hand = s.hands[nextSeat]!;
    if (hand.length === 0) break;
    const card = botPlay(hand, s.currentTrick, s.trumpSuit!);
    const newHands = s.hands.map((h, i) => i === nextSeat ? h.filter(c => c.id !== card.id) : h);
    const newTrick = [...s.currentTrick, { seat: nextSeat, card }];

    if (newTrick.length === 4) {
      const winner = trickWinner(newTrick, s.trumpSuit!);
      const newWon = s.wonCards.map((w, i) => i === winner ? [...w, ...newTrick.map(e => e.card)] : w);
      const done = newHands[0]!.length === 0;
      if (done) {
        const pts02 = newWon[0]!.concat(newWon[2]!).reduce((sum, c) => sum + cardValue(c.rank, isTrump(c, s.trumpSuit!)), 0)
          + (winner % 2 === 0 ? 10 : 0);
        const pts13 = newWon[1]!.concat(newWon[3]!).reduce((sum, c) => sum + cardValue(c.rank, isTrump(c, s.trumpSuit!)), 0)
          + (winner % 2 !== 0 ? 10 : 0);
        const declWins = s.declarerTeam === 0 ? pts02 >= 82 : pts13 >= 82;
        const youWin = (s.declarerTeam === 0 && pts02 >= 82) || (s.declarerTeam === 1 && pts13 >= 82)
          ? (s.declarerTeam === 0 || s.declarerTeam === null)
          : !(s.declarerTeam === 0);
        void declWins;
        const msg = youWin
          ? `Your team wins! You+S3: ${pts02}, Opp: ${pts13}.`
          : `Opponents win. ${pts13}–${pts02}.`;
        s = { ...s, hands: newHands as readonly (readonly Card[])[], wonCards: newWon, currentTrick: [], phase: "done", message: msg };
        break;
      } else {
        s = {
          ...s, hands: newHands as readonly (readonly Card[])[],
          wonCards: newWon, currentTrick: [], currentLeader: winner, trickCount: s.trickCount + 1,
          message: winner === 0 ? "You won the trick!" : `Seat ${winner + 1} won the trick.`,
        };
      }
    } else {
      s = { ...s, hands: newHands as readonly (readonly Card[])[], currentTrick: newTrick };
    }
  }
  return s;
}

export type BeloteAction =
  | { type: "accept" }
  | { type: "pass" }
  | { type: "play"; cardId: string };

export function reducer(state: BeloteState, action: BeloteAction): BeloteState {
  if (state.phase === "done") return state;

  if (action.type === "accept" && state.phase === "bidding") {
    // Player accepts trump = turned up card's suit
    const trumpSuit = state.turnUpCard.suit;
    const s = runBots({
      ...state,
      trumpSuit,
      declarerTeam: 0, // player's team is declarer
      phase: "playing",
      currentLeader: 0,
      message: `Trump is ${trumpSuit}! You accepted. Play starts. You + S3 vs S2 + S4.`,
    });
    return s;
  }

  if (action.type === "pass" && state.phase === "bidding") {
    // Bots auto-accept based on hand strength; strongest non-player bot accepts
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const potentialTrump = state.turnUpCard.suit;
    const strengths = [1, 2, 3].map(i => ({ seat: i, str: handStrength(state.hands[i]!, potentialTrump) }));
    const acceptor = strengths.reduce((best, cur) => cur.str > best.str ? cur : best);
    const trumpSuit = potentialTrump;
    const declarerTeam = acceptor.seat % 2 === 0 ? 0 : 1;
    return runBots({
      ...state,
      rngSeed: nextSeed,
      trumpSuit,
      declarerTeam,
      phase: "playing",
      currentLeader: 0,
      message: `Seat ${acceptor.seat + 1} accepted trump ${trumpSuit}. Play starts!`,
    });
  }

  if (action.type === "play" && state.phase === "playing" && state.trumpSuit) {
    const hand = state.hands[0]!;
    const card = hand.find(c => c.id === action.cardId);
    if (!card) return state;

    const trick = state.currentTrick;
    if (trick.length > 0) {
      const ledCard = trick[0]!.card;
      const ledTr = isTrump(ledCard, state.trumpSuit);
      const must = hand.filter(c =>
        ledTr ? isTrump(c, state.trumpSuit!) : (!isTrump(c, state.trumpSuit!) && c.suit === ledCard.suit)
      );
      if (must.length > 0 && !must.find(c => c.id === card.id)) return state;
    }

    const newHand = hand.filter(c => c.id !== card.id);
    const newHands = state.hands.map((h, i) => i === 0 ? newHand : h);
    const newTrick = [...trick, { seat: 0, card }];

    let s: BeloteState;
    if (newTrick.length === 4) {
      const winner = trickWinner(newTrick, state.trumpSuit);
      const newWon = state.wonCards.map((w, i) => i === winner ? [...w, ...newTrick.map(e => e.card)] : w);
      if (newHand.length === 0) {
        const pts02 = newWon[0]!.concat(newWon[2]!).reduce((sum, c) => sum + cardValue(c.rank, isTrump(c, state.trumpSuit!)), 0)
          + (winner % 2 === 0 ? 10 : 0);
        const pts13 = newWon[1]!.concat(newWon[3]!).reduce((sum, c) => sum + cardValue(c.rank, isTrump(c, state.trumpSuit!)), 0)
          + (winner % 2 !== 0 ? 10 : 0);
        const youWin = pts02 >= 82;
        const msg = youWin
          ? `Your team wins! You+S3: ${pts02}, Opp: ${pts13}.`
          : `Opponents win. ${pts13}–${pts02}.`;
        s = { ...state, hands: newHands as readonly (readonly Card[])[], wonCards: newWon, currentTrick: [], phase: "done", message: msg };
      } else {
        s = {
          ...state, hands: newHands as readonly (readonly Card[])[],
          wonCards: newWon, currentTrick: [], currentLeader: winner, trickCount: state.trickCount + 1,
          message: winner === 0 ? "You won the trick!" : `Seat ${winner + 1} won the trick.`,
        };
        s = runBots(s);
      }
    } else {
      s = { ...state, hands: newHands as readonly (readonly Card[])[], currentTrick: newTrick };
      s = runBots(s);
    }
    return s;
  }

  return state;
}

export function initialState(seed: number): BeloteState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const deck = shuffle(beloteDeck(), mulberry32(nextSeed));

  const hand0 = deck.slice(0, 8);
  const hand1 = deck.slice(8, 16);
  const hand2 = deck.slice(16, 24);
  const hand3 = deck.slice(24, 32);
  const turnUpCard = hand1[0]!; // first card to seat 1

  return {
    rngSeed: Math.floor(mulberry32(nextSeed)() * 2 ** 31),
    hands: [hand0, hand1, hand2, hand3],
    turnUpCard,
    trumpSuit: null,
    declarerTeam: null,
    currentTrick: [],
    wonCards: [[], [], [], []],
    trickCount: 0,
    currentLeader: 0,
    phase: "bidding",
    message: `Turn-up card: ${turnUpCard.suit} ${turnUpCard.rank === 1 ? "A" : turnUpCard.rank === 11 ? "J" : turnUpCard.rank === 12 ? "Q" : turnUpCard.rank === 13 ? "K" : turnUpCard.rank}. Accept this trump suit, or pass?`,
  };
}

export function isTerminal(state: BeloteState): { score: number } | null {
  if (state.phase !== "done") return null;
  const { wonCards, trumpSuit } = state;
  if (!trumpSuit) return { score: 50 };
  const pts02 = wonCards[0]!.concat(wonCards[2]!).reduce((sum, c) => sum + cardValue(c.rank, isTrump(c, trumpSuit)), 0);
  const pts13 = wonCards[1]!.concat(wonCards[3]!).reduce((sum, c) => sum + cardValue(c.rank, isTrump(c, trumpSuit)), 0);
  return { score: Math.max(0, Math.min(100, 50 + (pts02 - pts13))) };
}
