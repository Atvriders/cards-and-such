import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// German Whist — 2-player trick-taking.
// Phase 1: 13 tricks; winner takes face-up stock top, loser takes next (hidden).
// Phase 2: play remaining 13 cards, score tricks taken.

export interface GermanWhistSettings {
  botDifficulty: "easy" | "hard";
}

export type GermanWhistPhase = "phase1" | "phase2" | "done";

export interface GermanWhistState {
  settings: GermanWhistSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];   // [player, bot]
  stock: readonly Card[];                // remaining stock
  stockTop: Card | null;                  // face-up card (phase 1)
  trumpSuit: Suit;
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: GermanWhistPhase;
  tricksTaken: readonly number[];         // [player, bot] — phase 2 only
  phase1Tricks: number;                   // tricks played in phase 1
  phase2Tricks: number;
  finalScores: readonly number[] | null;
  message: string;
}

export type GermanWhistAction = { type: "play"; cardId: string };

// ── helpers ──────────────────────────────────────────────────────────────────

function ledSuit(trick: readonly { seat: number; card: Card }[]): Suit | null {
  return trick.length > 0 ? trick[0]!.card.suit : null;
}

function trickWinner(trick: readonly { seat: number; card: Card }[], trump: Suit): number {
  const led = ledSuit(trick)!;
  const trumps = trick.filter(e => e.card.suit === trump);
  if (trumps.length > 0) return trumps.reduce((b, c) => c.card.rank > b.card.rank ? c : b).seat;
  return trick.filter(e => e.card.suit === led).reduce((b, c) => c.card.rank > b.card.rank ? c : b).seat;
}

export function legalPlays(state: GermanWhistState, seat: number): Card[] {
  const hand = state.hands[seat]!;
  if (hand.length === 0) return [];
  const trick = state.currentTrick;
  if (trick.length === 0) return [...hand];
  const led = ledSuit(trick)!;
  const suitCards = hand.filter(c => c.suit === led);
  return suitCards.length > 0 ? suitCards : [...hand];
}

// ── bot play ─────────────────────────────────────────────────────────────────

function botPlay(state: GermanWhistState, rng: () => number): Card {
  void rng;
  const legal = legalPlays(state, 1);
  if (legal.length === 1) return legal[0]!;
  const trick = state.currentTrick;
  const trump = state.trumpSuit;

  if (trick.length === 0) {
    // Lead highest card
    return legal.reduce((hi, c) => {
      if (c.suit === trump && legal[0]!.suit !== trump) return c;
      return c.rank > hi.rank ? c : hi;
    });
  }

  const winner = trickWinner(trick, trump);
  const winnerCard = trick.find(e => e.seat === winner)!.card;
  const winning = winner === 1;

  if (winning) return legal.reduce((lo, c) => c.rank < lo.rank ? c : lo);

  // Try to beat
  const led = ledSuit(trick)!;
  const follow = legal.filter(c => c.suit === led);
  if (follow.length > 0) {
    const above = follow.filter(c => c.rank > winnerCard.rank && winnerCard.suit === led);
    if (above.length > 0) return above.reduce((lo, c) => c.rank < lo.rank ? c : lo);
    return follow.reduce((lo, c) => c.rank < lo.rank ? c : lo);
  }
  const trumpCards = legal.filter(c => c.suit === trump);
  if (trumpCards.length > 0) return trumpCards.reduce((lo, c) => c.rank < lo.rank ? c : lo);
  return legal.reduce((lo, c) => c.rank < lo.rank ? c : lo);
}

// ── applyCard ─────────────────────────────────────────────────────────────────

function applyCard(state: GermanWhistState, seat: number, card: Card): GermanWhistState {
  const newHands = state.hands.map((h, i) => i === seat ? h.filter(c => c.id !== card.id) : h);
  const newTrick = [...state.currentTrick, { seat, card }];
  let s: GermanWhistState = { ...state, hands: newHands, currentTrick: newTrick };

  if (newTrick.length === 2) {
    const winner = trickWinner(newTrick, state.trumpSuit);
    const loser = winner === 0 ? 1 : 0;

    if (state.phase === "phase1") {
      // Winner gets stockTop, loser gets next stock card
      const stock = [...state.stock];
      const newHands2 = s.hands.map(h => [...h]) as Card[][];

      if (state.stockTop) newHands2[winner]!.push(state.stockTop);
      const nextTop = stock.length > 0 ? stock.shift()! : null;
      if (nextTop && stock.length > 0) {
        newHands2[loser]!.push(stock.shift()!);
      } else if (stock.length > 0) {
        newHands2[loser]!.push(stock.shift()!);
      }

      const newStockTop = stock.length > 0 ? stock[0]! : null;
      const remaining = stock.length > 0 ? stock.slice(1) : [];
      const phase1Tricks = state.phase1Tricks + 1;
      const newPhase: GermanWhistPhase = remaining.length === 0 && !newStockTop ? "phase2" : "phase1";

      s = {
        ...s,
        hands: newHands2,
        stock: remaining,
        stockTop: newStockTop,
        currentTrick: [],
        leadSeat: winner,
        turn: winner,
        phase: newPhase,
        phase1Tricks,
        message: `${winner === 0 ? "You" : "Bot"} won the trick!`,
      };
    } else {
      // Phase 2 — score tricks
      const newTricksTaken = state.tricksTaken.map((t, i) => i === winner ? t + 1 : t);
      const phase2Tricks = state.phase2Tricks + 1;

      if (phase2Tricks === 13) {
        s = {
          ...s,
          currentTrick: [],
          tricksTaken: newTricksTaken,
          phase2Tricks,
          leadSeat: winner,
          turn: winner,
          phase: "done",
          finalScores: [newTricksTaken[0]!, newTricksTaken[1]!],
          message: `Game over! You: ${newTricksTaken[0]} tricks, Bot: ${newTricksTaken[1]} tricks.`,
        };
      } else {
        s = {
          ...s,
          currentTrick: [],
          tricksTaken: newTricksTaken,
          phase2Tricks,
          leadSeat: winner,
          turn: winner,
          message: `${winner === 0 ? "You" : "Bot"} won the trick!`,
        };
      }
    }
  } else {
    s = { ...s, turn: seat === 0 ? 1 : 0 };
  }

  return s;
}

// ── reducer ───────────────────────────────────────────────────────────────────

export function reducer(state: GermanWhistState, action: GermanWhistAction): GermanWhistState {
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

  let s: GermanWhistState = { ...state, rngSeed: nextSeed };
  s = applyCard(s, 0, card);

  // Bot plays
  while (s.phase !== "done" && s.turn === 1 && s.hands[1]!.length > 0) {
    const botCard = botPlay(s, botRng);
    s = applyCard(s, 1, botCard);
  }

  return s;
}

// ── initialState ──────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: GermanWhistSettings): GermanWhistState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const deck = shuffle(newDeck(), dealRng);
  const playerHand = deck.slice(0, 13);
  const botHand = deck.slice(13, 26);
  const remaining = deck.slice(26);
  const stockTop = remaining[0]!;
  const stock = remaining.slice(1);
  const trumpSuit = stockTop.suit;

  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands: [playerHand, botHand],
    stock,
    stockTop,
    trumpSuit,
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "phase1",
    tricksTaken: [0, 0],
    phase1Tricks: 0,
    phase2Tricks: 0,
    finalScores: null,
    message: `Trump: ${trumpSuit}. Win the trick to take the face-up stock card.`,
  };
}

// ── isTerminal ────────────────────────────────────────────────────────────────

export function isTerminal(state: GermanWhistState): { score: number } | null {
  if (state.phase !== "done" || !state.finalScores) return null;
  const p = state.finalScores[0]!;
  const b = state.finalScores[1]!;
  if (p > b) return { score: 100 };
  if (p < b) return { score: 0 };
  return { score: 50 };
}
