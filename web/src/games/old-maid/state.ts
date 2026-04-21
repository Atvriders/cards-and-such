import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface OldMaidSettings {
  players: "2" | "3" | "4";
}

export type Phase = "playing" | "done";

export interface OldMaidState {
  settings: OldMaidSettings;
  seats: number;
  hands: readonly (readonly Card[])[];
  turn: number; // whose turn it is (0 = human)
  phase: Phase;
  loser: number | null; // seat that holds the lone queen
  rngSeed: number;
  lastAction: string | null;
}

export type OldMaidAction =
  | { type: "draw"; cardIndex: number }; // pick card at cardIndex from left neighbor

// ── helpers ───────────────────────────────────────────────────────────────────

function rankOf(c: Card): Rank { return c.rank; }

/** Remove all pairs from a hand, return new hand. */
function removePairs(hand: Card[]): Card[] {
  const counts = new Map<Rank, Card[]>();
  for (const c of hand) {
    const arr = counts.get(rankOf(c)) ?? [];
    arr.push(c);
    counts.set(rankOf(c), arr);
  }
  const result: Card[] = [];
  for (const [, cards] of counts) {
    if (cards.length % 2 === 1) {
      result.push(cards[0]!);
    } else if (cards.length === 2) {
      // discard pair
    } else if (cards.length === 3) {
      result.push(cards[0]!);
    } else if (cards.length === 4) {
      // discard all 4
    }
    // handle all cases properly
  }
  // More correct: keep cards that aren't in a pair
  return result;
}

/** Correctly removes pairs from a hand. */
function discardPairs(hand: readonly Card[]): Card[] {
  const rankMap = new Map<Rank, Card[]>();
  for (const c of hand) {
    const arr = rankMap.get(c.rank) ?? [];
    arr.push(c);
    rankMap.set(c.rank, arr);
  }
  const out: Card[] = [];
  for (const [, cards] of rankMap) {
    const rem = cards.length % 2;
    if (rem === 1) out.push(cards[0]!);
    // even number → all discarded as pairs
  }
  return out;
}

function checkDone(hands: readonly (readonly Card[])[]): number | null {
  // Game over when only 1 player has cards left (the Old Maid)
  const withCards = hands.filter(h => h.length > 0);
  if (withCards.length === 1) {
    // Find which seat still has cards
    const loserIdx = hands.findIndex(h => h.length > 0);
    return loserIdx;
  }
  return null;
}

function leftNeighbor(seat: number, seats: number, hands: readonly (readonly Card[])[]): number {
  // Left = (seat - 1 + seats) % seats, skip empty hands
  let left = (seat - 1 + seats) % seats;
  let tries = 0;
  while (hands[left]!.length === 0 && tries < seats) {
    left = (left - 1 + seats) % seats;
    tries++;
  }
  return left;
}

function botDraw(state: OldMaidState, seat: number, rng: () => number): OldMaidState {
  const leftSeat = leftNeighbor(seat, state.seats, state.hands);
  const leftHand = state.hands[leftSeat]!;
  if (leftHand.length === 0) {
    // Skip this bot's turn
    return advanceTurn(state);
  }
  const idx = Math.floor(rng() * leftHand.length);
  return applyDraw(state, seat, leftSeat, idx, rng);
}

function applyDraw(
  state: OldMaidState,
  drawingSeat: number,
  fromSeat: number,
  cardIdx: number,
  rng: () => number,
): OldMaidState {
  const fromHand = [...state.hands[fromSeat]!];
  const drawnCard = fromHand.splice(cardIdx, 1)[0]!;
  let drawingHand = [...state.hands[drawingSeat]!, drawnCard];

  // Discard any new pairs
  drawingHand = discardPairs(drawingHand);

  const newHands = state.hands.map((h, i) => {
    if (i === drawingSeat) return drawingHand;
    if (i === fromSeat) return fromHand;
    return h;
  });

  const loser = checkDone(newHands);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  let s: OldMaidState = {
    ...state,
    hands: newHands,
    rngSeed: nextSeed,
    lastAction: `${drawingSeat === 0 ? "You" : `Bot ${drawingSeat}`} drew a card from ${fromSeat === 0 ? "your" : `Bot ${fromSeat}'s`} hand.`,
    phase: loser !== null ? "done" : "playing",
    loser,
  };

  if (loser !== null) return s;

  s = advanceTurn(s);
  return s;
}

function advanceTurn(state: OldMaidState): OldMaidState {
  const { seats, hands } = state;
  // Find next seat that still has cards
  let next = (state.turn + 1) % seats;
  let tries = 0;
  while (tries < seats) {
    const leftSeat = leftNeighbor(next, seats, hands);
    if (hands[next]!.length > 0 && hands[leftSeat]!.length > 0) break;
    if (hands[next]!.length === 0) {
      next = (next + 1) % seats;
      tries++;
      continue;
    }
    break;
  }
  return { ...state, turn: next };
}

function runBots(state: OldMaidState, rng: () => number): OldMaidState {
  let s = state;
  while (s.phase === "playing" && s.turn !== 0) {
    // Check if the current bot's left neighbor has cards
    const leftSeat = leftNeighbor(s.turn, s.seats, s.hands);
    if (s.hands[leftSeat]!.length === 0) {
      s = advanceTurn(s);
      continue;
    }
    s = botDraw(s, s.turn, rng);
  }
  return s;
}

// ── initialState ──────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: OldMaidSettings): OldMaidState {
  const rng = mulberry32(seed);
  const seats = Number(settings.players);

  // Build 51-card deck: remove one Queen of Spades (rank 12, suit ♠)
  const fullDeck = newDeck();
  let removedOne = false;
  const deck51 = fullDeck.filter(c => {
    if (!removedOne && c.suit === "♠" && c.rank === 12) {
      removedOne = true;
      return false;
    }
    return true;
  });

  const shuffled = shuffle(deck51, rng);

  // Deal all cards round-robin
  const hands: Card[][] = Array.from({ length: seats }, () => []);
  for (let i = 0; i < shuffled.length; i++) {
    hands[i % seats]!.push(shuffled[i]!);
  }

  // Discard initial pairs
  const cleanedHands = hands.map(h => discardPairs(h));

  const nextSeed = Math.floor(rng() * 2 ** 31);

  let s: OldMaidState = {
    settings,
    seats,
    hands: cleanedHands,
    turn: 0,
    phase: "playing",
    loser: null,
    rngSeed: nextSeed,
    lastAction: null,
  };

  // Check if game is already over after initial deal (unlikely but possible)
  const loser = checkDone(cleanedHands);
  if (loser !== null) {
    return { ...s, phase: "done", loser };
  }

  // Run bots if bot starts
  if (s.turn !== 0) {
    const initRng = mulberry32(nextSeed);
    s = runBots(s, initRng);
  }

  return s;
}

// ── reducer ───────────────────────────────────────────────────────────────────

export function reducer(state: OldMaidState, action: OldMaidAction): OldMaidState {
  if (state.phase === "done") return state;
  if (state.turn !== 0) return state;
  if (action.type !== "draw") return state;

  const leftSeat = leftNeighbor(0, state.seats, state.hands);
  const leftHand = state.hands[leftSeat]!;
  if (leftHand.length === 0) return state;

  const { cardIndex } = action;
  if (cardIndex < 0 || cardIndex >= leftHand.length) return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const botRng = mulberry32(nextSeed);

  let s = applyDraw(state, 0, leftSeat, cardIndex, rng);
  if (s.phase === "done") return s;

  // Run bots
  s = runBots(s, botRng);
  return s;
}

// ── isTerminal ────────────────────────────────────────────────────────────────

export function isTerminal(state: OldMaidState): { score: number } | null {
  if (state.phase !== "done" || state.loser === null) return null;
  if (state.loser === 0) return { score: 0 }; // player is the loser
  return { score: 100 }; // player won (didn't end up with old maid)
}
