// Parliament (a.k.a. Fan Tan / Card Sevens) — sequence-building shedding game.
// 7s are played first as foundations; players extend sequences up or down by suit.
// Anyone who cannot play must pass. First to empty their hand wins.

import type { Card, Rank, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle, rankLabel } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type { Rank, Suit };

export interface ParliamentSettings {
  opponents: "1" | "2" | "3";
}

export type ParliamentPhase = "playing" | "done";

// For each suit, track min rank played (going down) and max rank played (going up).
export type SuitRange = { min: Rank; max: Rank } | null;

export interface ParliamentState {
  settings: ParliamentSettings;
  seats: number;
  hands: readonly (readonly Card[])[];
  // Board: for each suit, what range of ranks has been played
  board: Readonly<Record<Suit, SuitRange>>;
  turn: number;
  phase: ParliamentPhase;
  winner: number | null;
  rngSeed: number;
  log: string;
}

export type ParliamentAction =
  | { type: "play"; cardId: string }
  | { type: "pass" };

const SEAT_NAMES = ["You", "Bot 1", "Bot 2", "Bot 3"];
export function seatName(s: number): string { return SEAT_NAMES[s] ?? `P${s}`; }

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

function emptyBoard(): Record<Suit, SuitRange> {
  return { "♠": null, "♥": null, "♦": null, "♣": null };
}

export function canPlayCard(card: Card, board: Readonly<Record<Suit, SuitRange>>): boolean {
  const range = board[card.suit];
  if (card.rank === 7) return range === null; // 7 starts a new suit pile
  if (range === null) return false; // can't play unless 7 is down
  return card.rank === range.min - 1 || card.rank === range.max + 1;
}

function applyCard(card: Card, board: Readonly<Record<Suit, SuitRange>>): Record<Suit, SuitRange> {
  const nb = { ...board };
  if (card.rank === 7) {
    nb[card.suit] = { min: 7, max: 7 };
  } else {
    const r = nb[card.suit]!;
    nb[card.suit] = {
      min: Math.min(r.min, card.rank) as Rank,
      max: Math.max(r.max, card.rank) as Rank,
    };
  }
  return nb;
}

function botChooseCard(hand: readonly Card[], board: Readonly<Record<Suit, SuitRange>>): Card | null {
  const playable = hand.filter(c => canPlayCard(c, board));
  if (playable.length === 0) return null;
  // Prefer 7s, then extend longest suit
  const sevens = playable.filter(c => c.rank === 7);
  if (sevens.length > 0) return sevens[0]!;
  return playable[0]!;
}

export function initialState(seed: number, settings: ParliamentSettings): ParliamentState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const seats = 1 + parseInt(settings.opponents, 10);
  const dealRng = mulberry32(nextSeed);
  const deck = shuffle(newDeck(), dealRng);

  // Deal evenly; extras go to first players
  const hands: Card[][] = Array.from({ length: seats }, () => []);
  deck.forEach((c, i) => hands[i % seats]!.push(c));

  return {
    settings,
    seats,
    hands,
    board: emptyBoard(),
    turn: 0,
    phase: "playing",
    winner: null,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    log: "Play a 7 to start — or extend a suit sequence!",
  };
}

function runBots(state: ParliamentState): ParliamentState {
  let s = state;
  let iters = 0;
  while (!s.winner && s.turn !== 0 && iters < 200) {
    iters++;
    const bot = s.turn;
    const botHand = s.hands[bot]!;
    const card = botChooseCard(botHand, s.board);
    if (card) {
      const newBoard = applyCard(card, s.board);
      const newHand = botHand.filter(c => c.id !== card.id);
      const newHands = s.hands.map((h, i) => i === bot ? newHand : h);
      const rng = mulberry32(s.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      if (newHand.length === 0) {
        s = { ...s, hands: newHands, board: newBoard, winner: bot, phase: "done", rngSeed: nextSeed, log: `${seatName(bot)} wins!` };
        break;
      }
      s = { ...s, hands: newHands, board: newBoard, turn: (bot + 1) % s.seats, rngSeed: nextSeed, log: `${seatName(bot)} played ${card.suit}${rankLabel(card.rank)}.` };
    } else {
      // Pass
      const rng = mulberry32(s.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      s = { ...s, turn: (bot + 1) % s.seats, rngSeed: nextSeed, log: `${seatName(bot)} passed.` };
    }
  }
  return s;
}

export function reducer(state: ParliamentState, action: ParliamentAction): ParliamentState {
  if (state.phase === "done") return state;
  if (state.turn !== 0) return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  if (action.type === "pass") {
    // Only allowed if no playable cards
    const playable = state.hands[0]!.filter(c => canPlayCard(c, state.board));
    if (playable.length > 0) return state; // must play if possible
    const s: ParliamentState = { ...state, turn: (1) % state.seats, rngSeed: nextSeed, log: "You passed." };
    return runBots(s);
  }

  if (action.type === "play") {
    const hand = state.hands[0]!;
    const card = hand.find(c => c.id === action.cardId);
    if (!card) return state;
    if (!canPlayCard(card, state.board)) return state;

    const newBoard = applyCard(card, state.board);
    const newHand = hand.filter(c => c.id !== action.cardId);
    const newHands = state.hands.map((h, i) => i === 0 ? newHand : h);

    if (newHand.length === 0) {
      return { ...state, hands: newHands, board: newBoard, winner: 0, phase: "done", rngSeed: nextSeed, log: "You played your last card — you win!" };
    }

    const s: ParliamentState = {
      ...state,
      hands: newHands,
      board: newBoard,
      turn: 1 % state.seats,
      rngSeed: nextSeed,
      log: `You played ${card.suit}${rankLabel(card.rank)}.`,
    };
    return runBots(s);
  }

  return state;
}

export function isTerminal(state: ParliamentState): { score: number } | null {
  if (state.phase !== "done" || state.winner === null) return null;
  const remaining = state.hands[0]!.length;
  return { score: state.winner === 0 ? 500 : Math.max(0, (13 - remaining) * 10) };
}

export { rankLabel, SUITS };
