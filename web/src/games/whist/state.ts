import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface WhistSettings {
  botBidding: "conservative" | "balanced";
}

export type WhistPhase = "playing" | "done";

export interface WhistState {
  settings: WhistSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];      // 4 seats
  trumpSuit: Suit;
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: WhistPhase;
  tricksTaken: readonly number[];           // per seat
  tricksPlayed: number;
  finalScores: readonly number[] | null;    // team scores (team 0: seats 0&2, team 1: seats 1&3)
}

export type WhistAction = { type: "play"; cardId: string };

// ── helpers ──────────────────────────────────────────────────────────────────

function ledSuit(trick: readonly { seat: number; card: Card }[]): Suit | null {
  return trick.length > 0 ? trick[0]!.card.suit : null;
}

function trickWinner(
  trick: readonly { seat: number; card: Card }[],
  trump: Suit,
): number {
  const led = ledSuit(trick)!;
  const trumpCards = trick.filter(e => e.card.suit === trump);
  if (trumpCards.length > 0) {
    return trumpCards.reduce((b, c) => c.card.rank > b.card.rank ? c : b).seat;
  }
  return trick
    .filter(e => e.card.suit === led)
    .reduce((b, c) => c.card.rank > b.card.rank ? c : b).seat;
}

export function legalPlays(state: WhistState, seat: number): Card[] {
  const hand = state.hands[seat]!;
  if (hand.length === 0) return [];
  const trick = state.currentTrick;
  if (trick.length === 0) return [...hand];
  const led = ledSuit(trick)!;
  const suitCards = hand.filter(c => c.suit === led);
  return suitCards.length > 0 ? suitCards : [...hand];
}

// ── bot play ─────────────────────────────────────────────────────────────────

function botPlay(state: WhistState, seat: number, _rng: () => number): Card {
  const legal = legalPlays(state, seat);
  if (legal.length === 1) return legal[0]!;
  const trick = state.currentTrick;
  const trump = state.trumpSuit;

  if (trick.length === 0) {
    // Lead: prefer trump if conservative, else lead lowest
    const style = state.settings.botBidding;
    const trumpCards = legal.filter(c => c.suit === trump);
    if (style === "conservative" && trumpCards.length > 0) {
      return trumpCards.reduce((lo, c) => c.rank < lo.rank ? c : lo);
    }
    return legal.reduce((lo, c) => c.rank < lo.rank ? c : lo);
  }

  const winner = trickWinner(trick, trump);
  const winnerCard = trick.find(e => e.seat === winner)!.card;
  const teamOf = (s: number) => s % 2;
  const teamWinning = teamOf(winner) === teamOf(seat);

  if (teamWinning) {
    // Partner is winning — play low
    return legal.reduce((lo, c) => c.rank < lo.rank ? c : lo);
  }

  // Try to win with lowest winning card
  const led = ledSuit(trick)!;
  const canFollow = legal.some(c => c.suit === led);
  if (canFollow) {
    const follow = legal.filter(c => c.suit === led);
    const above = follow.filter(c => c.rank > winnerCard.rank && winnerCard.suit === led);
    if (above.length > 0) return above.reduce((lo, c) => c.rank < lo.rank ? c : lo);
    return follow.reduce((lo, c) => c.rank < lo.rank ? c : lo);
  }
  // Off-suit: play trump to win if possible
  const trumpCards = legal.filter(c => c.suit === trump);
  if (trumpCards.length > 0) {
    const trumpWinner = trick.filter(e => e.card.suit === trump);
    if (trumpWinner.length === 0) {
      return trumpCards.reduce((lo, c) => c.rank < lo.rank ? c : lo);
    }
    const highTrump = trumpWinner.reduce((b, c) => c.card.rank > b.card.rank ? c : b).card.rank;
    const aboveTrump = trumpCards.filter(c => c.rank > highTrump);
    if (aboveTrump.length > 0) return aboveTrump.reduce((lo, c) => c.rank < lo.rank ? c : lo);
  }
  return legal.reduce((lo, c) => c.rank < lo.rank ? c : lo);
}

// ── applyCard ─────────────────────────────────────────────────────────────────

function applyCard(state: WhistState, seat: number, card: Card, _rng: () => number): WhistState {
  const newHands = state.hands.map((h, i) =>
    i === seat ? h.filter(c => c.id !== card.id) : h
  );
  const newTrick = [...state.currentTrick, { seat, card }];
  let s: WhistState = { ...state, hands: newHands, currentTrick: newTrick };

  if (newTrick.length === 4) {
    const winner = trickWinner(newTrick, state.trumpSuit);
    const newTricksTaken = state.tricksTaken.map((t, i) => i === winner ? t + 1 : t);
    const tricksPlayed = state.tricksPlayed + 1;

    s = { ...s, currentTrick: [], tricksTaken: newTricksTaken, tricksPlayed, leadSeat: winner, turn: winner };

    if (tricksPlayed === 13) {
      // Compute team scores (tricks above 6)
      const team0Tricks = newTricksTaken[0]! + newTricksTaken[2]!;
      const team1Tricks = newTricksTaken[1]! + newTricksTaken[3]!;
      const team0Score = Math.max(0, team0Tricks - 6);
      const team1Score = Math.max(0, team1Tricks - 6);
      s = { ...s, phase: "done", finalScores: [team0Score, team1Score] };
    }
  } else {
    s = { ...s, turn: (seat + 1) % 4 };
  }

  return s;
}

// ── reducer ───────────────────────────────────────────────────────────────────

export function reducer(state: WhistState, action: WhistAction): WhistState {
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

  let s: WhistState = { ...state, rngSeed: nextSeed };
  s = applyCard(s, 0, card, botRng);

  while (s.phase !== "done" && s.turn !== 0) {
    if (s.hands[s.turn]!.length === 0) break;
    const botCard = botPlay(s, s.turn, botRng);
    s = applyCard(s, s.turn, botCard, botRng);
  }

  return s;
}

// ── initialState ──────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: WhistSettings): WhistState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const deck = shuffle(newDeck(), dealRng);
  // Last card determines trump
  const trumpCard = deck[51]!;
  const trumpSuit = trumpCard.suit;

  const hands: Card[][] = [
    deck.slice(0, 13),
    deck.slice(13, 26),
    deck.slice(26, 39),
    deck.slice(39, 52),
  ];

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
    tricksPlayed: 0,
    finalScores: null,
  };
}

// ── isTerminal ────────────────────────────────────────────────────────────────

export function isTerminal(state: WhistState): { score: number } | null {
  if (state.phase !== "done" || !state.finalScores) return null;
  const myTeamScore = state.finalScores[0]!;
  const oppTeamScore = state.finalScores[1]!;
  if (myTeamScore > oppTeamScore) return { score: 100 };
  if (myTeamScore < oppTeamScore) return { score: 0 };
  return { score: 50 };
}
