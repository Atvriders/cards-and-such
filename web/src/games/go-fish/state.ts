import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle, rankLabel } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type { Rank };

export type Seat = 0 | 1 | 2 | 3;

export interface GoFishSettings {
  opponents: "1" | "2" | "3";
}

export interface GoFishState {
  settings: GoFishSettings;
  seats: number;
  hands: readonly (readonly Card[])[];
  ocean: readonly Card[];
  books: readonly number[];    // seat → count of completed books
  turn: number;
  rngSeed: number;
  winner: number | null;
  lastAction: string | null;   // human-readable log of the last action
}

export type GoFishAction = { type: "ask"; rank: Rank; target: number };

// ── helpers ───────────────────────────────────────────────────────────────────

const SEAT_NAMES = ["You", "Bot 1", "Bot 2", "Bot 3"];

function seatName(s: number): string {
  return SEAT_NAMES[s] ?? `Player ${s}`;
}

function rankName(r: Rank): string {
  return rankLabel(r) + "s";
}

/** Extract all completed books from a hand, return {newHand, booksFound}. */
function extractBooks(hand: readonly Card[]): { newHand: Card[]; booksFound: number } {
  const countByRank = new Map<Rank, Card[]>();
  for (const c of hand) {
    const arr = countByRank.get(c.rank) ?? [];
    arr.push(c);
    countByRank.set(c.rank, arr);
  }
  let booksFound = 0;
  const newHand: Card[] = [];
  for (const [, cards] of countByRank) {
    if (cards.length === 4) {
      booksFound++;
    } else {
      newHand.push(...cards);
    }
  }
  return { newHand, booksFound };
}

/** Check if the game is over: all hands empty and ocean empty. */
function checkGameOver(state: GoFishState): GoFishState {
  const anyCards = state.hands.some(h => h.length > 0) || state.ocean.length > 0;
  if (anyCards) return state;
  // Game over — find winner (most books, ties to lowest index)
  const maxBooks = Math.max(...state.books);
  const winner = state.books.findIndex(b => b === maxBooks);
  return { ...state, winner };
}

/** Apply an ask action for any seat (used for both human and bot turns). */
function applyAsk(
  state: GoFishState,
  asker: number,
  rank: Rank,
  target: number,
): GoFishState {
  const askerHand = state.hands[asker]!;
  const targetHand = state.hands[target]!;

  // Check if target has any cards of the requested rank
  const targetCards = targetHand.filter(c => c.rank === rank);

  let newHands = [...state.hands.map(h => [...h])];
  let newOcean = [...state.ocean];
  let newBooks = [...state.books];
  let lastAction: string;
  let keepTurn = false;

  if (targetCards.length > 0) {
    // Transfer all cards of that rank from target to asker
    newHands[target] = newHands[target]!.filter(c => c.rank !== rank);
    newHands[asker] = [...newHands[asker]!, ...targetCards];

    // Check for books
    const { newHand, booksFound } = extractBooks(newHands[asker]!);
    newHands[asker] = newHand;
    newBooks[asker] = (newBooks[asker] ?? 0) + booksFound;

    const bookNote = booksFound > 0 ? ` Completed ${booksFound} book${booksFound > 1 ? "s" : ""}!` : "";
    lastAction = `${seatName(asker)} asked ${seatName(target)} for ${rankName(rank)}. Got ${targetCards.length}!${bookNote}`;
    keepTurn = true;
  } else {
    // Go Fish!
    if (newOcean.length > 0) {
      const drawn = newOcean[0]!;
      newOcean = newOcean.slice(1);
      newHands[asker] = [...newHands[asker]!, drawn];

      // Check for books
      const { newHand, booksFound } = extractBooks(newHands[asker]!);
      newHands[asker] = newHand;
      newBooks[asker] = (newBooks[asker] ?? 0) + booksFound;

      if (drawn.rank === rank) {
        const bookNote = booksFound > 0 ? ` Completed a book!` : "";
        lastAction = `${seatName(asker)} asked ${seatName(target)} for ${rankName(rank)}. Go fish! Drew a ${rankLabel(rank)} — goes again!${bookNote}`;
        keepTurn = true;
      } else {
        const bookNote = booksFound > 0 ? ` Completed a book!` : "";
        lastAction = `${seatName(asker)} asked ${seatName(target)} for ${rankName(rank)}. Go fish! Drew a ${rankLabel(drawn.rank)}.${bookNote}`;
        keepTurn = false;
      }
    } else {
      // Ocean is empty
      lastAction = `${seatName(asker)} asked ${seatName(target)} for ${rankName(rank)}. Go fish! Ocean is empty.`;
      keepTurn = false;
    }
  }

  // If asker's hand is empty after a successful ask/draw, try to draw from ocean
  if (newHands[asker]!.length === 0 && newOcean.length > 0) {
    const drawn = newOcean[0]!;
    newOcean = newOcean.slice(1);
    newHands[asker] = [drawn];
    // Check for books on this draw too
    const { newHand, booksFound } = extractBooks(newHands[asker]!);
    newHands[asker] = newHand;
    newBooks[asker] = (newBooks[asker] ?? 0) + booksFound;
  }

  // Determine next turn
  let nextTurn: number;
  if (keepTurn) {
    // Keep turn for asker, but if asker's hand is still empty and ocean empty, pass
    if (newHands[asker]!.length === 0 && newOcean.length === 0) {
      nextTurn = (asker + 1) % state.seats;
    } else {
      nextTurn = asker;
    }
  } else {
    // Advance clockwise
    nextTurn = (asker + 1) % state.seats;
  }

  // Skip players with empty hands if ocean is also empty
  let skipped = 0;
  while (newHands[nextTurn]!.length === 0 && newOcean.length === 0 && skipped < state.seats) {
    nextTurn = (nextTurn + 1) % state.seats;
    skipped++;
  }

  const s: GoFishState = {
    ...state,
    hands: newHands,
    ocean: newOcean,
    books: newBooks,
    turn: nextTurn,
    lastAction,
  };

  return checkGameOver(s);
}

/** Run bot turns atomically until it's the human's turn or game over. */
function runBots(state: GoFishState, rng: () => number): GoFishState {
  let s = state;
  let iterations = 0;
  const maxIter = 200; // safety guard

  while (!s.winner && s.turn !== 0 && iterations < maxIter) {
    iterations++;
    const botSeat = s.turn;
    const botHand = s.hands[botSeat]!;

    if (botHand.length === 0) {
      // Skip this bot
      s = { ...s, turn: (botSeat + 1) % s.seats };
      continue;
    }

    // Pick a random rank from bot's hand
    const ranks = [...new Set(botHand.map(c => c.rank))];
    const rank = ranks[Math.floor(rng() * ranks.length)]! as Rank;

    // Pick a random target with a non-empty hand, not self
    const targets = Array.from({ length: s.seats }, (_, i) => i)
      .filter(i => i !== botSeat && s.hands[i]!.length > 0);

    if (targets.length === 0) {
      // No valid targets — advance turn
      s = { ...s, turn: (botSeat + 1) % s.seats };
      continue;
    }

    const target = targets[Math.floor(rng() * targets.length)]!;
    s = applyAsk(s, botSeat, rank, target);
  }

  return s;
}

// ── main reducer ──────────────────────────────────────────────────────────────

export function reducer(state: GoFishState, action: GoFishAction): GoFishState {
  if (action.type !== "ask") return state;
  if (state.winner !== null) return state;
  if (state.turn !== 0) return state;

  const { rank, target } = action;

  // Validate: player must hold at least one card of that rank
  const playerHand = state.hands[0]!;
  if (!playerHand.some(c => c.rank === rank)) return state;

  // Validate: target is not self, target index is valid, target seat exists
  if (target === 0 || target < 0 || target >= state.seats) return state;

  // Advance rng seed
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const botRng = mulberry32(nextSeed);

  let s: GoFishState = { ...state, rngSeed: nextSeed };
  s = applyAsk(s, 0, rank, target);

  // Run bot turns if it's now a bot's turn
  if (!s.winner && s.turn !== 0) {
    s = runBots(s, botRng);
  }

  return s;
}

// ── initialState ──────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: GoFishSettings): GoFishState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const seats = 1 + parseInt(settings.opponents, 10);
  const handSize = seats === 2 ? 7 : 5;

  const deck = shuffle(newDeck(), dealRng);

  const hands: Card[][] = [];
  let remaining = deck;
  for (let i = 0; i < seats; i++) {
    hands.push(remaining.slice(0, handSize));
    remaining = remaining.slice(handSize);
  }

  // Check books in initial hands
  const books = new Array<number>(seats).fill(0);
  for (let i = 0; i < seats; i++) {
    const { newHand, booksFound } = extractBooks(hands[i]!);
    hands[i] = newHand;
    books[i] = booksFound;
  }

  let s: GoFishState = {
    settings,
    seats,
    hands,
    ocean: remaining,
    books,
    turn: 0,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    winner: null,
    lastAction: null,
  };

  s = checkGameOver(s);

  return s;
}

// ── isTerminal ────────────────────────────────────────────────────────────────

export function isTerminal(state: GoFishState): { score: number } | null {
  if (state.winner === null) return null;
  const playerBooks = state.books[0] ?? 0;
  const maxBooks = Math.max(...state.books);
  const isWinner = state.winner === 0;

  // Check for sole winner (no ties)
  const soleWinner = state.books.filter(b => b === maxBooks).length === 1;

  if (isWinner && soleWinner) {
    return { score: playerBooks * 100 + 100 };
  } else if (isWinner && !soleWinner) {
    // Tied — treat as lost
    return { score: playerBooks * 50 };
  } else {
    return { score: playerBooks * 50 };
  }
}

// Export helper for tests and UI
export { seatName, rankName, extractBooks };
