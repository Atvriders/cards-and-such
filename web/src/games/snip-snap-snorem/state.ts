// Snip-Snap-Snorem — classic Victorian matching/sequence game
// Players must match the current rank with another card of the same rank.
// Play goes: first card = "Snip", second = "Snap", third = "Snorem"
// When all four of a rank are played, play continues with any card from the next player.
// First to empty hand wins.

import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle, rankLabel } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type { Rank };

export interface SnipSnapSettings {
  opponents: "1" | "2" | "3";
}

export type SnipSnapPhase = "playing" | "done";

// How many of the current rank have been played (1,2,3,4)
export type SnipSnapStep = 0 | 1 | 2 | 3 | 4;
const CALL: Record<number, string> = { 1: "Snip!", 2: "Snap!", 3: "Snorem!" };

export interface SnipSnapState {
  settings: SnipSnapSettings;
  seats: number;
  hands: readonly (readonly Card[])[];
  currentRank: Rank | null;   // the active rank being matched
  step: SnipSnapStep;         // how many of current rank played so far
  lastPlayed: Card | null;
  turn: number;
  phase: SnipSnapPhase;
  winner: number | null;
  rngSeed: number;
  log: string;
}

export type SnipSnapAction =
  | { type: "play"; cardId: string };

const SEAT_NAMES = ["You", "Bot 1", "Bot 2", "Bot 3"];
export function seatName(s: number): string { return SEAT_NAMES[s] ?? `P${s}`; }

export function canPlay(card: Card, state: SnipSnapState): boolean {
  if (state.currentRank === null) return true; // any card opens a new sequence
  return card.rank === state.currentRank;
}

export function playerHasMatch(hand: readonly Card[], state: SnipSnapState): boolean {
  if (state.currentRank === null) return hand.length > 0;
  return hand.some(c => c.rank === state.currentRank);
}

function botChooseCard(hand: readonly Card[], state: SnipSnapState): Card | null {
  if (state.currentRank !== null) {
    const match = hand.find(c => c.rank === state.currentRank);
    return match ?? null;
  }
  // Bot opens with its most-common rank
  const cnt = new Map<Rank, Card[]>();
  for (const c of hand) { const arr = cnt.get(c.rank) ?? []; arr.push(c); cnt.set(c.rank, arr); }
  let best: Card | null = null; let bestCount = 0;
  for (const grp of cnt.values()) {
    if (grp.length > bestCount) { bestCount = grp.length; best = grp[0]!; }
  }
  return best;
}

function applyPlay(state: SnipSnapState, seat: number, card: Card): SnipSnapState {
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  const newHands = state.hands.map((h, i) => i === seat ? h.filter(c => c.id !== card.id) : h);
  const newStep = (state.currentRank === null ? 1 : state.step + 1) as SnipSnapStep;
  const newRank = card.rank;
  const callWord = CALL[newStep] ?? "";

  let log = `${seatName(seat)} plays ${card.suit}${rankLabel(card.rank)}. ${callWord}`;

  if (newHands[seat]!.length === 0) {
    return { ...state, hands: newHands, currentRank: newRank, step: newStep, lastPlayed: card, turn: seat, winner: seat, phase: "done", rngSeed: nextSeed, log: `${seatName(seat)} plays last card — wins!` };
  }

  let nextTurn: number;
  let nextRank: Rank | null;
  let nextStep: SnipSnapStep;

  if (newStep === 4) {
    // Snorem — all four played. Next player starts fresh.
    log += " Snorem! Next player opens.";
    nextTurn = (seat + 1) % state.seats;
    nextRank = null;
    nextStep = 0;
  } else {
    // Pass to next player clockwise; they must match or pass
    nextTurn = (seat + 1) % state.seats;
    nextRank = newRank;
    nextStep = newStep;
  }

  return { ...state, hands: newHands, currentRank: nextRank, step: nextStep, lastPlayed: card, turn: nextTurn, rngSeed: nextSeed, log };
}

function skipToNextHolder(state: SnipSnapState): SnipSnapState {
  // Advance turn until someone can play (pass players who cannot match)
  let s = state;
  let loops = 0;
  while (loops < s.seats * 2) {
    loops++;
    if (playerHasMatch(s.hands[s.turn]!, s)) break;
    // This player cannot match — they skip
    const rng = mulberry32(s.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const prevLog = s.log;
    s = { ...s, turn: (s.turn + 1) % s.seats, rngSeed: nextSeed, log: `${seatName(s.turn)} passes. ${prevLog}` };
  }
  return s;
}

function runBots(state: SnipSnapState): SnipSnapState {
  let s = skipToNextHolder(state);
  let iters = 0;
  while (!s.winner && s.turn !== 0 && iters < 300) {
    iters++;
    const bot = s.turn;
    const card = botChooseCard(s.hands[bot]!, s);
    if (!card) {
      // No card — advance (shouldn't happen after skipToNextHolder)
      const rng = mulberry32(s.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      s = { ...s, turn: (bot + 1) % s.seats, rngSeed: nextSeed };
      continue;
    }
    s = applyPlay(s, bot, card);
    if (!s.winner) s = skipToNextHolder(s);
  }
  return s;
}

export function initialState(seed: number, settings: SnipSnapSettings): SnipSnapState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const seats = 1 + parseInt(settings.opponents, 10);
  const dealRng = mulberry32(nextSeed);
  const deck = shuffle(newDeck(), dealRng);

  const hands: Card[][] = Array.from({ length: seats }, () => []);
  deck.forEach((c, i) => hands[i % seats]!.push(c));

  return {
    settings,
    seats,
    hands,
    currentRank: null,
    step: 0,
    lastPlayed: null,
    turn: 0,
    phase: "playing",
    winner: null,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    log: "Play any card to start the first sequence!",
  };
}

export function reducer(state: SnipSnapState, action: SnipSnapAction): SnipSnapState {
  if (state.phase === "done") return state;
  if (state.turn !== 0) return state;

  if (action.type === "play") {
    const hand = state.hands[0]!;
    const card = hand.find(c => c.id === action.cardId);
    if (!card) return state;
    if (!canPlay(card, state)) return state;

    let s = applyPlay(state, 0, card);
    if (!s.winner && s.turn !== 0) {
      s = runBots(s);
    } else if (!s.winner && s.turn === 0) {
      // Check if player can play
      s = skipToNextHolder(s);
      if (s.turn !== 0) s = runBots(s);
    }
    return s;
  }

  return state;
}

export function isTerminal(state: SnipSnapState): { score: number } | null {
  if (state.phase !== "done" || state.winner === null) return null;
  return { score: state.winner === 0 ? 500 : Math.max(0, (52 / state.seats - (state.hands[0]?.length ?? 0)) * 10) };
}

export { rankLabel, CALL };
