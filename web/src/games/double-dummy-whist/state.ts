import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle, SUITS } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Double Dummy Whist — 2 players + 2 visible dummy hands.
// All 4 hands visible. 13 tricks. Trump declared randomly. Most tricks wins.
// Player controls seat 0 (and can see dummy seat 2).
// Bot controls seat 1 (and dummy seat 3).

export interface DoubleDummyWhistSettings {
  placeholder: "none";
}

export type DDWPhase = "playing" | "done";

export interface DoubleDummyWhistState {
  settings: DoubleDummyWhistSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];  // [player, bot, playerDummy, botDummy]
  trumpSuit: Suit;
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;  // 0=player, 1=bot, 2=playerDummy (auto), 3=botDummy (auto)
  phase: DDWPhase;
  tricksTaken: readonly number[];  // [player+playerDummy, bot+botDummy]
  tricksPlayed: number;
  finalScores: readonly number[] | null;
  message: string;
}

export type DoubleDummyWhistAction = { type: "play"; cardId: string };

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

export function legalPlays(state: DoubleDummyWhistState, seat: number): Card[] {
  const hand = state.hands[seat]!;
  if (hand.length === 0) return [];
  const trick = state.currentTrick;
  if (trick.length === 0) return [...hand];
  const led = ledSuit(trick)!;
  const suitCards = hand.filter(c => c.suit === led);
  return suitCards.length > 0 ? suitCards : [...hand];
}

// ── bot/dummy logic ───────────────────────────────────────────────────────────

function autoPlay(state: DoubleDummyWhistState, seat: number): Card {
  const legal = legalPlays(state, seat);
  if (legal.length === 1) return legal[0]!;
  const trick = state.currentTrick;
  const trump = state.trumpSuit;

  // Check if partner already winning
  const partnerSeat = seat === 0 ? 2 : seat === 2 ? 0 : seat === 1 ? 3 : 1;
  const partnerInTrick = trick.find(e => e.seat === partnerSeat);

  if (trick.length === 0) {
    // Lead highest
    return legal.reduce((hi, c) => {
      if (c.suit === trump && legal[0]!.suit !== trump) return c;
      return c.rank > hi.rank ? c : hi;
    });
  }

  const winner = trickWinner(trick, trump);
  const winnerCard = trick.find(e => e.seat === winner)!.card;
  const partnerWinning = partnerInTrick && winner === partnerSeat;

  if (partnerWinning) {
    // Partner winning — throw low
    return legal.reduce((lo, c) => c.rank < lo.rank ? c : lo);
  }

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

function seatTeam(seat: number): number {
  return seat % 2 === 0 ? 0 : 1; // seats 0,2 = team 0; seats 1,3 = team 1
}

function applyCard(state: DoubleDummyWhistState, seat: number, card: Card): DoubleDummyWhistState {
  const newHands = state.hands.map((h, i) => i === seat ? h.filter(c => c.id !== card.id) : h);
  const newTrick = [...state.currentTrick, { seat, card }];
  let s: DoubleDummyWhistState = { ...state, hands: newHands, currentTrick: newTrick };

  if (newTrick.length === 4) {
    const winner = trickWinner(newTrick, state.trumpSuit);
    const team = seatTeam(winner);
    const newTricksTaken = state.tricksTaken.map((t, i) => i === team ? t + 1 : t);
    const tricksPlayed = state.tricksPlayed + 1;

    if (tricksPlayed === 13) {
      s = {
        ...s,
        currentTrick: [],
        tricksTaken: newTricksTaken,
        tricksPlayed,
        leadSeat: winner,
        turn: winner,
        phase: "done",
        finalScores: [newTricksTaken[0]!, newTricksTaken[1]!],
        message: `Game over! Your team: ${newTricksTaken[0]} tricks, Bot team: ${newTricksTaken[1]} tricks.`,
      };
    } else {
      s = {
        ...s,
        currentTrick: [],
        tricksTaken: newTricksTaken,
        tricksPlayed,
        leadSeat: winner,
        turn: winner,
        message: `${[0, 2].includes(winner) ? "Your team" : "Bot team"} wins trick ${tricksPlayed}!`,
      };
    }
  } else {
    // Advance turn: 0->1->2->3->0 but skip seats with empty hands
    let next = (seat + 1) % 4;
    while (state.hands[next]!.length === 0) next = (next + 1) % 4;
    s = { ...s, turn: next };
  }

  return s;
}

// ── reducer ───────────────────────────────────────────────────────────────────

export function reducer(state: DoubleDummyWhistState, action: DoubleDummyWhistAction): DoubleDummyWhistState {
  if (state.phase === "done") return state;
  if (action.type !== "play") return state;
  // Player controls seats 0 and 2
  if (state.turn !== 0 && state.turn !== 2) return state;

  const card = state.hands[state.turn]!.find(c => c.id === action.cardId);
  if (!card) return state;
  const legal = legalPlays(state, state.turn);
  if (!legal.some(c => c.id === card.id)) return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  let s: DoubleDummyWhistState = { ...state, rngSeed: nextSeed };
  s = applyCard(s, state.turn, card);

  // Auto-play bots (seats 1, 3) and player dummy (seat 2 if not player's turn)
  while (s.phase !== "done" && (s.turn === 1 || s.turn === 3)) {
    const botCard = autoPlay(s, s.turn);
    s = applyCard(s, s.turn, botCard);
  }

  return s;
}

// ── initialState ──────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: DoubleDummyWhistSettings): DoubleDummyWhistState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const deck = shuffle(newDeck(), dealRng);
  const trumpSuit: Suit = SUITS[Math.floor(dealRng() * 4)] ?? "♠";

  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands: [
      deck.slice(0, 13),
      deck.slice(13, 26),
      deck.slice(26, 39),
      deck.slice(39, 52),
    ],
    trumpSuit,
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "playing",
    tricksTaken: [0, 0],
    tricksPlayed: 0,
    finalScores: null,
    message: `Trump: ${trumpSuit}. You control seats 0 & 2. All hands visible!`,
  };
}

// ── isTerminal ────────────────────────────────────────────────────────────────

export function isTerminal(state: DoubleDummyWhistState): { score: number } | null {
  if (state.phase !== "done" || !state.finalScores) return null;
  const p = state.finalScores[0]!;
  const b = state.finalScores[1]!;
  if (p > b) return { score: 100 };
  if (p < b) return { score: 0 };
  return { score: 50 };
}
