import type { Card, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Preferans: 32-card deck — 7, 8, 9, 10, J, Q, K, A of 4 suits
const PREF_RANKS = [7, 8, 9, 10, 11, 12, 13, 1] as const;
const SUITS: Suit[] = ["♣", "♠", "♥", "♦"];

export function preferansDeck(): Card[] {
  const cards: Card[] = [];
  for (const s of SUITS) {
    for (const r of PREF_RANKS) {
      cards.push({ suit: s, rank: r as Card["rank"], id: `pf-${s}${r}` });
    }
  }
  return cards;
}

export function cardValue(rank: Card["rank"]): number {
  if (rank === 1) return 11;
  if (rank === 10) return 10;
  if (rank === 13) return 4;
  if (rank === 12) return 3;
  if (rank === 11) return 2;
  return 0;
}

export function cardStrength(rank: Card["rank"]): number {
  if (rank === 1) return 8;
  if (rank === 13) return 7;
  if (rank === 12) return 6;
  if (rank === 11) return 5;
  if (rank === 10) return 4;
  if (rank === 9) return 3;
  if (rank === 8) return 2;
  return 1; // 7
}

export function isTrump(card: Card, trumpSuit: Suit): boolean {
  return card.suit === trumpSuit;
}

export function trickWinner(
  trick: readonly { seat: number; card: Card }[],
  trumpSuit: Suit
): number {
  const ledSuit = trick[0]!.card.suit;
  return trick.reduce((best, cur) => {
    const b = best.card;
    const c = cur.card;
    const bTr = isTrump(b, trumpSuit);
    const cTr = isTrump(c, trumpSuit);
    if (bTr && cTr) return cardStrength(c.rank) > cardStrength(b.rank) ? cur : best;
    if (cTr && !bTr) return cur;
    if (bTr && !cTr) return best;
    const bLed = b.suit === ledSuit;
    const cLed = c.suit === ledSuit;
    if (bLed && !cLed) return best;
    if (cLed && !bLed) return cur;
    if (bLed && cLed) return cardStrength(c.rank) > cardStrength(b.rank) ? cur : best;
    return best;
  }).seat;
}

export type PrefPhase = "bidding" | "talon" | "playing" | "done";

export interface PrefState {
  rngSeed: number;
  hands: readonly (readonly Card[])[];   // 3 seats
  talon: readonly Card[];                 // 2-card widow
  trumpSuit: Suit | null;
  declarer: number | null;
  currentTrick: readonly { seat: number; card: Card }[];
  wonCards: readonly (readonly Card[])[];
  trickCount: number;
  currentLeader: number;
  phase: PrefPhase;
  message: string;
  playerBid: boolean | null;   // null = not decided, true = bid, false = passed
  contractTricks: number;      // how many tricks declarer promises
}

function handScore(hand: readonly Card[], potentialTrump: Suit): number {
  return hand.reduce((s, c) => {
    if (isTrump(c, potentialTrump)) return s + cardValue(c.rank) + 5;
    return s + cardValue(c.rank);
  }, 0);
}

function botPlay(hand: readonly Card[], trick: readonly { seat: number; card: Card }[], trumpSuit: Suit): Card {
  if (trick.length === 0) {
    const trumps = hand.filter(c => isTrump(c, trumpSuit));
    if (trumps.length >= 2) return trumps.reduce((hi, c) => cardStrength(c.rank) > cardStrength(hi.rank) ? c : hi);
    const nonTr = hand.filter(c => !isTrump(c, trumpSuit));
    const pool = nonTr.length > 0 ? nonTr : [...hand];
    return pool.reduce((lo, c) => cardValue(c.rank) < cardValue(lo.rank) ? c : lo);
  }
  const ledCard = trick[0]!.card;
  const ledTr = isTrump(ledCard, trumpSuit);
  const follow = hand.filter(c =>
    ledTr ? isTrump(c, trumpSuit) : (!isTrump(c, trumpSuit) && c.suit === ledCard.suit)
  );
  const pool = follow.length > 0 ? follow : [...hand];
  return pool.reduce((lo, c) => cardValue(c.rank) < cardValue(lo.rank) ? c : lo);
}

function runBots(state: PrefState): PrefState {
  if (!state.trumpSuit) return state;
  let s = state;
  while (s.phase === "playing") {
    const tLen = s.currentTrick.length;
    let nextSeat: number;
    if (tLen === 0) nextSeat = s.currentLeader;
    else nextSeat = (s.currentTrick[tLen - 1]!.seat + 1) % 3;

    if (nextSeat === 0) break;

    const hand = s.hands[nextSeat]!;
    if (hand.length === 0) break;

    const card = botPlay(hand, s.currentTrick, s.trumpSuit!);
    const newHands = s.hands.map((h, i) => i === nextSeat ? h.filter(c => c.id !== card.id) : h);
    const newTrick = [...s.currentTrick, { seat: nextSeat, card }];

    if (newTrick.length === 3) {
      const winner = trickWinner(newTrick, s.trumpSuit!);
      const newWon = s.wonCards.map((w, i) => i === winner ? [...w, ...newTrick.map(e => e.card)] : w);
      const done = newHands[0]!.length === 0;
      if (done) {
        const decl = s.declarer ?? 0;
        const declTricks = newWon[decl]!.length / 3; // each trick = 3 cards
        const youWin = decl === 0 ? declTricks >= s.contractTricks : declTricks < s.contractTricks;
        const msg = youWin
          ? `You win! Declarer (Seat ${decl + 1}) took ${declTricks} tricks vs contract ${s.contractTricks}.`
          : `Declarer wins. Took ${declTricks}/${s.contractTricks} tricks.`;
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

export type PrefAction =
  | { type: "bid" }
  | { type: "pass" }
  | { type: "play"; cardId: string };

export function reducer(state: PrefState, action: PrefAction): PrefState {
  if (state.phase === "done") return state;

  if (action.type === "bid" && state.phase === "bidding") {
    // Player bids — becomes declarer, picks best trump from talon perspective
    const allCards = [...state.hands[0]!, ...state.talon];
    const bestTrump = SUITS.reduce((best, suit) =>
      handScore(allCards.filter(c => c.suit === suit), suit) > handScore(allCards.filter(c => c.suit === best), best) ? suit : best
    );
    // Player gets talon cards, discards last 2 of hand
    const mergedHand = [...state.hands[0]!, ...state.talon];
    const sorted = [...mergedHand].sort((a, b) => {
      const aVal = a.suit === bestTrump ? cardValue(a.rank) + 20 : cardValue(a.rank);
      const bVal = b.suit === bestTrump ? cardValue(b.rank) + 20 : cardValue(b.rank);
      return bVal - aVal;
    });
    const newHand0 = sorted.slice(0, 10);
    return runBots({
      ...state,
      hands: [newHand0, state.hands[1]!, state.hands[2]!] as readonly (readonly Card[])[],
      trumpSuit: bestTrump,
      declarer: 0,
      contractTricks: 6,
      phase: "playing",
      currentLeader: 0,
      message: `You bid! Trump: ${bestTrump}. Contract: 6 tricks. Play against the bots.`,
    });
  }

  if (action.type === "pass" && state.phase === "bidding") {
    // Bots compete — strongest hand bot becomes declarer
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const botScores = [1, 2].map(i => {
      const best = SUITS.reduce((b, s) =>
        handScore(state.hands[i]!.filter(c => c.suit === s), s) > handScore(state.hands[i]!.filter(c => c.suit === b), b) ? s : b
      );
      return { seat: i, trump: best, score: handScore(state.hands[i]!, best) };
    });
    const winner = botScores.reduce((a, b) => b.score > a.score ? b : a);
    const decl = winner.seat;
    const trumpSuit = winner.trump;
    // Bot declarer takes talon
    const mergedHand = [...state.hands[decl]!, ...state.talon];
    const sorted = [...mergedHand].sort((a, b) => {
      const aV = a.suit === trumpSuit ? cardValue(a.rank) + 20 : cardValue(a.rank);
      const bV = b.suit === trumpSuit ? cardValue(b.rank) + 20 : cardValue(b.rank);
      return bV - aV;
    });
    const newHand = sorted.slice(0, 10);
    const newHands = state.hands.map((h, i) => i === decl ? newHand : h);
    return runBots({
      ...state,
      rngSeed: nextSeed,
      hands: newHands as readonly (readonly Card[])[],
      trumpSuit,
      declarer: decl,
      contractTricks: 6,
      phase: "playing",
      currentLeader: 0,
      message: `Seat ${decl + 1} bid. Trump: ${trumpSuit}. Contract: 6 tricks. Help defend!`,
    });
  }

  if (action.type === "play" && state.phase === "playing" && state.trumpSuit) {
    const hand = state.hands[0]!;
    const card = hand.find(c => c.id === action.cardId);
    if (!card) return state;

    // Follow suit rule
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

    let s: PrefState;
    if (newTrick.length === 3) {
      const winner = trickWinner(newTrick, state.trumpSuit);
      const newWon = state.wonCards.map((w, i) => i === winner ? [...w, ...newTrick.map(e => e.card)] : w);
      if (newHand.length === 0) {
        const decl = state.declarer ?? 0;
        const declTricks = newWon[decl]!.length / 3;
        const youWin = decl === 0 ? declTricks >= state.contractTricks : declTricks < state.contractTricks;
        const msg = youWin
          ? `You win! Declarer took ${declTricks} tricks vs contract ${state.contractTricks}.`
          : `You lose. Declarer took ${declTricks}/${state.contractTricks} tricks.`;
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

export function initialState(seed: number): PrefState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const deck = shuffle(preferansDeck(), mulberry32(nextSeed));

  const hand0 = deck.slice(0, 10);
  const hand1 = deck.slice(10, 20);
  const hand2 = deck.slice(20, 30);
  const talon = deck.slice(30, 32);

  return {
    rngSeed: Math.floor(mulberry32(nextSeed)() * 2 ** 31),
    hands: [hand0, hand1, hand2],
    talon,
    trumpSuit: null,
    declarer: null,
    currentTrick: [],
    wonCards: [[], [], []],
    trickCount: 0,
    currentLeader: 0,
    contractTricks: 6,
    phase: "bidding",
    playerBid: null,
    message: "Preferans: 3 players, 10 tricks. Bid to become declarer (pick up talon, name trump, contract 6 tricks), or pass and defend.",
  };
}

export function isTerminal(state: PrefState): { score: number } | null {
  if (state.phase !== "done") return null;
  const decl = state.declarer ?? 0;
  const declTricks = state.wonCards[decl]!.length / 3;
  if (decl === 0) {
    return { score: declTricks >= state.contractTricks ? Math.min(100, 50 + declTricks * 5) : Math.max(0, 50 - state.contractTricks * 5) };
  }
  // Player was defender
  const defTricks = (state.wonCards[0]!.length + state.wonCards[(decl === 1 ? 2 : 1)]!.length) / 3;
  return { score: declTricks < state.contractTricks ? Math.min(100, 50 + defTricks * 5) : Math.max(0, 50 - defTricks * 5) };
}
