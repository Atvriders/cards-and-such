import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Agram — West African trick-taking for 2 players.
// 40-card deck (remove 5s and 10s). No trump. 5 tricks dealt (5 cards each).
// Must follow suit. Highest of led suit wins. Winner of the LAST trick wins the hand.

export interface AgramSettings {
  placeholder: "none";
}

export type AgramPhase = "playing" | "done";

export interface AgramState {
  settings: AgramSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];  // [player, bot]
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: AgramPhase;
  tricksPlayed: number;
  lastTrickWinner: number;
  message: string;
}

export type AgramAction = { type: "play"; cardId: string };

// ── helpers ──────────────────────────────────────────────────────────────────

function ledSuit(trick: readonly { seat: number; card: Card }[]): Suit | null {
  return trick.length > 0 ? trick[0]!.card.suit : null;
}

function trickWinner(trick: readonly { seat: number; card: Card }[]): number {
  const led = ledSuit(trick)!;
  // Only led-suit cards can win; no trump
  const contestants = trick.filter(e => e.card.suit === led);
  return contestants.reduce((b, c) => c.card.rank > b.card.rank ? c : b).seat;
}

export function legalPlays(state: AgramState, seat: number): Card[] {
  const hand = state.hands[seat]!;
  if (hand.length === 0) return [];
  const trick = state.currentTrick;
  if (trick.length === 0) return [...hand];
  const led = ledSuit(trick)!;
  const suitCards = hand.filter(c => c.suit === led);
  return suitCards.length > 0 ? suitCards : [...hand];
}

// ── bot logic ─────────────────────────────────────────────────────────────────

function botPlay(state: AgramState): Card {
  const legal = legalPlays(state, 1);
  if (legal.length === 1) return legal[0]!;
  const trick = state.currentTrick;

  if (trick.length === 0) {
    // Lead highest card
    return legal.reduce((hi, c) => c.rank > hi.rank ? c : hi);
  }

  const winner = trickWinner(trick);
  const winning = winner === 1;

  // On the last trick, play to win; on others, try to conserve high cards
  const isLastTrick = state.hands[0]!.length === 1;
  if (isLastTrick) {
    // Try to beat
    const led = ledSuit(trick)!;
    const follow = legal.filter(c => c.suit === led);
    if (follow.length > 0) {
      const winnerCard = trick.find(e => e.seat === winner)!.card;
      const above = follow.filter(c => c.rank > winnerCard.rank);
      if (above.length > 0) return above.reduce((lo, c) => c.rank < lo.rank ? c : lo);
      return follow.reduce((lo, c) => c.rank < lo.rank ? c : lo);
    }
    return legal[0]!;
  }

  // Not last trick — if winning, throw low; if losing, try to beat
  if (winning) return legal.reduce((lo, c) => c.rank < lo.rank ? c : lo);

  const led = ledSuit(trick)!;
  const follow = legal.filter(c => c.suit === led);
  if (follow.length > 0) {
    const winnerCard = trick.find(e => e.seat === winner)!.card;
    const above = follow.filter(c => c.rank > winnerCard.rank);
    if (above.length > 0) return above.reduce((lo, c) => c.rank < lo.rank ? c : lo);
    return follow.reduce((lo, c) => c.rank < lo.rank ? c : lo);
  }
  return legal.reduce((lo, c) => c.rank < lo.rank ? c : lo);
}

// ── applyCard ─────────────────────────────────────────────────────────────────

function applyCard(state: AgramState, seat: number, card: Card): AgramState {
  const newHands = state.hands.map((h, i) => i === seat ? h.filter(c => c.id !== card.id) : h);
  const newTrick = [...state.currentTrick, { seat, card }];
  let s: AgramState = { ...state, hands: newHands, currentTrick: newTrick };

  if (newTrick.length === 2) {
    const winner = trickWinner(newTrick);
    const tricksPlayed = state.tricksPlayed + 1;
    const isLastTrick = tricksPlayed === 5;

    if (isLastTrick) {
      s = {
        ...s,
        currentTrick: [],
        tricksPlayed,
        lastTrickWinner: winner,
        leadSeat: winner,
        turn: winner,
        phase: "done",
        message: `${winner === 0 ? "You" : "Bot"} won the last trick — ${winner === 0 ? "you win" : "bot wins"}!`,
      };
    } else {
      s = {
        ...s,
        currentTrick: [],
        tricksPlayed,
        lastTrickWinner: winner,
        leadSeat: winner,
        turn: winner,
        message: `${winner === 0 ? "You" : "Bot"} won trick ${tricksPlayed}. ${tricksPlayed === 4 ? "Last trick next!" : ""}`,
      };
    }
  } else {
    s = { ...s, turn: seat === 0 ? 1 : 0 };
  }

  return s;
}

// ── reducer ───────────────────────────────────────────────────────────────────

export function reducer(state: AgramState, action: AgramAction): AgramState {
  if (state.phase === "done") return state;
  if (action.type !== "play") return state;
  if (state.turn !== 0) return state;

  const card = state.hands[0]!.find(c => c.id === action.cardId);
  if (!card) return state;
  const legal = legalPlays(state, 0);
  if (!legal.some(c => c.id === card.id)) return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  let s: AgramState = { ...state, rngSeed: nextSeed };
  s = applyCard(s, 0, card);

  while (s.phase !== "done" && s.turn === 1) {
    const botCard = botPlay(s);
    s = applyCard(s, 1, botCard);
  }

  return s;
}

// ── initialState ──────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: AgramSettings): AgramState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  // 40-card deck: remove 5s (rank 5) and 10s (rank 10)
  const deck = shuffle(
    newDeck().filter(c => c.rank !== 5 && c.rank !== 10),
    dealRng
  );
  const playerHand = deck.slice(0, 5);
  const botHand = deck.slice(5, 10);

  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands: [playerHand, botHand],
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "playing",
    tricksPlayed: 0,
    lastTrickWinner: -1,
    message: "No trump. Win the last trick to win!",
  };
}

// ── isTerminal ────────────────────────────────────────────────────────────────

export function isTerminal(state: AgramState): { score: number } | null {
  if (state.phase !== "done") return null;
  if (state.lastTrickWinner === 0) return { score: 100 };
  return { score: 0 };
}
