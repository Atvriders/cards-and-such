import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface HeartsSettings {
  botDifficulty: "random" | "heuristic";
}

export interface HeartsState {
  settings: HeartsSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];       // length 4, seat-indexed
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;       // who leads the CURRENT trick
  turn: number;           // whose turn it is right now (0..3)
  heartsBroken: boolean;
  tricksPlayed: number;   // 0..13
  takenCards: readonly (readonly Card[])[];  // length 4
  handDone: boolean;
  finalScores: readonly number[] | null;     // penalty scores, set once handDone
}

export type HeartsAction =
  | { type: "play"; cardId: string };

// ── helpers ────────────────────────────────────────────────────────────────

function ledSuit(trick: readonly { seat: number; card: Card }[]): Suit | null {
  return trick.length > 0 ? trick[0]!.card.suit : null;
}

function highestOfSuit(
  trick: readonly { seat: number; card: Card }[],
  suit: Suit,
): { seat: number; card: Card } | null {
  const relevant = trick.filter(e => e.card.suit === suit);
  if (relevant.length === 0) return null;
  return relevant.reduce((best, cur) =>
    cur.card.rank > best.card.rank ? cur : best
  );
}

function isQS(card: Card): boolean {
  return card.suit === "♠" && card.rank === 12;
}

function isHeart(card: Card): boolean {
  return card.suit === "♥";
}

// ── legal plays ────────────────────────────────────────────────────────────

export function legalPlays(
  state: HeartsState,
  seat: number,
  hand: readonly Card[],
): Card[] {
  const trick = state.currentTrick;
  const isFirstTrick = state.tricksPlayed === 0;

  if (trick.length === 0) {
    // Leading
    if (isFirstTrick) {
      // Must lead 2♣
      const twoClub = hand.find(c => c.suit === "♣" && c.rank === 2);
      return twoClub ? [twoClub] : [...hand]; // fallback if no 2♣ (shouldn't happen)
    }
    // Hearts can only be led if broken or hand is all hearts
    if (!state.heartsBroken) {
      const nonHearts = hand.filter(c => !isHeart(c));
      if (nonHearts.length > 0) return nonHearts;
    }
    return [...hand];
  }

  // Following
  const led = ledSuit(trick)!;
  const suitCards = hand.filter(c => c.suit === led);
  if (suitCards.length > 0) return suitCards;

  // Can't follow suit; play anything (with first-trick restrictions)
  if (isFirstTrick) {
    const safe = hand.filter(c => !isHeart(c) && !isQS(c));
    if (safe.length > 0) return safe;
  }
  return [...hand];
}

// ── penalties ──────────────────────────────────────────────────────────────

function computePenalties(takenCards: readonly (readonly Card[])[]): number[] {
  return takenCards.map(cards =>
    cards.reduce((sum, c) => {
      if (isHeart(c)) return sum + 1;
      if (isQS(c)) return sum + 13;
      return sum;
    }, 0)
  );
}

// ── bot play ───────────────────────────────────────────────────────────────

function randomBot(hand: readonly Card[], legal: Card[], _rng: () => number): Card {
  const idx = Math.floor(_rng() * legal.length);
  return legal[idx]!;
}

function heuristicBot(
  state: HeartsState,
  seat: number,
  hand: readonly Card[],
  legal: Card[],
  rng: () => number,
): Card {
  const trick = state.currentTrick;

  if (trick.length === 0) {
    // Leading: prefer lowest card of non-heart/non-QS suit; avoid leading penalty cards
    const nonPenalty = legal.filter(c => !isHeart(c) && !isQS(c));
    const pool = nonPenalty.length > 0 ? nonPenalty : legal;
    if (pool.length === 0) return legal[0]!; // safety fallback
    // Group by suit, pick suit with most cards, then lowest rank
    const bySuit = new Map<Suit, Card[]>();
    for (const c of pool) {
      const arr = bySuit.get(c.suit) ?? [];
      arr.push(c);
      bySuit.set(c.suit, arr);
    }
    let best: Card[] = [];
    for (const arr of bySuit.values()) {
      if (arr.length > best.length) best = arr;
    }
    if (best.length === 0) return pool[0]!;
    return best.reduce((lo, c) => c.rank < lo.rank ? c : lo);
  }

  const led = ledSuit(trick)!;
  const currentWinner = highestOfSuit(trick, led);
  const trickHasPenalty = trick.some(e => isHeart(e.card) || isQS(e.card));

  // Check if we're following suit
  const canFollow = legal.some(c => c.suit === led);
  if (canFollow) {
    const followCards = legal.filter(c => c.suit === led);
    if (currentWinner) {
      const currentHighRank = currentWinner.card.rank;
      const belowWinner = followCards.filter(c => c.rank < currentHighRank);
      if (trickHasPenalty && belowWinner.length > 0) {
        // Can't win — dump the highest card below winner
        return belowWinner.reduce((hi, c) => c.rank > hi.rank ? c : hi);
      }
      if (!trickHasPenalty) {
        // No penalty yet — dump the highest so we don't hold high cards
        return followCards.reduce((hi, c) => c.rank > hi.rank ? c : hi);
      }
      // Trick has penalty but we can't avoid winning — play highest to dispose
      return followCards.reduce((hi, c) => c.rank > hi.rank ? c : hi);
    }
    return followCards.reduce((hi, c) => c.rank > hi.rank ? c : hi);
  }

  // Can't follow suit — dump penalty cards
  const qs = legal.find(isQS);
  if (qs && led !== "♠") return qs;

  const hearts = legal.filter(isHeart);
  if (hearts.length > 0) {
    return hearts.reduce((hi, c) => c.rank > hi.rank ? c : hi);
  }

  // Dump highest remaining
  return legal.reduce((hi, c) => c.rank > hi.rank ? c : hi);
}

function botPlay(
  state: HeartsState,
  seat: number,
  rng: () => number,
): Card {
  const hand = state.hands[seat]!;
  const legal = legalPlays(state, seat, hand);
  if (state.settings.botDifficulty === "random") {
    return randomBot(hand, legal, rng);
  }
  return heuristicBot(state, seat, hand, legal, rng);
}

// ── core reducer helpers ───────────────────────────────────────────────────

function applyCard(
  state: HeartsState,
  seat: number,
  card: Card,
  rng: () => number,
): HeartsState {
  // Remove card from seat's hand
  const newHands = state.hands.map((h, i) =>
    i === seat ? h.filter(c => c.id !== card.id) : h
  );
  const newTrick = [...state.currentTrick, { seat, card }];

  let s: HeartsState = {
    ...state,
    hands: newHands,
    currentTrick: newTrick,
  };

  if (newTrick.length === 4) {
    // Resolve trick
    const led = newTrick[0]!.card.suit;
    const winner = highestOfSuit(newTrick, led)!;
    const winSeat = winner.seat;

    const trickCards = newTrick.map(e => e.card);
    const newTakenCards = s.takenCards.map((cards, i) =>
      i === winSeat ? [...cards, ...trickCards] : cards
    );

    const heartsBroken = s.heartsBroken || trickCards.some(isHeart);
    const tricksPlayed = s.tricksPlayed + 1;

    s = {
      ...s,
      currentTrick: [],
      takenCards: newTakenCards,
      heartsBroken,
      tricksPlayed,
      leadSeat: winSeat,
      turn: winSeat,
    };

    if (tricksPlayed === 13) {
      // Hand done — compute final scores
      const penalties = computePenalties(newTakenCards);
      const total = penalties.reduce((a, b) => a + b, 0);
      let finalScores: number[];
      if (total === 26) {
        // Check for shoot the moon (one player has all 26)
        const shooter = penalties.findIndex(p => p === 26);
        if (shooter !== -1) {
          finalScores = penalties.map((_, i) => (i === shooter ? 0 : 26));
        } else {
          finalScores = penalties;
        }
      } else {
        finalScores = penalties;
      }
      s = { ...s, handDone: true, finalScores };
    }
  } else {
    // Advance turn clockwise
    s = { ...s, turn: (seat + 1) % 4 };
  }

  return s;
}

// ── main reducer ───────────────────────────────────────────────────────────

export function reducer(state: HeartsState, action: HeartsAction): HeartsState {
  if (action.type !== "play") return state;
  if (state.handDone) return state;
  if (state.turn !== 0) return state; // Human only acts on their own turn

  // Find and validate card
  const hand0 = state.hands[0]!;
  const card = hand0.find(c => c.id === action.cardId);
  if (!card) return state;

  const legal = legalPlays(state, 0, hand0);
  if (!legal.some(c => c.id === card.id)) return state;

  // Advance seed for bots
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const botRng = mulberry32(nextSeed);

  let s: HeartsState = { ...state, rngSeed: nextSeed };

  // Apply human card
  s = applyCard(s, 0, card, botRng);

  // Run bots until back to seat 0 or hand done
  while (!s.handDone && s.turn !== 0) {
    const botSeat = s.turn;
    const botHand = s.hands[botSeat]!;
    if (botHand.length === 0) break; // safety: malformed state (tests)
    const botCard = botPlay(s, botSeat, botRng);
    s = applyCard(s, botSeat, botCard, botRng);
  }

  return s;
}

// ── initialState ───────────────────────────────────────────────────────────

export function initialState(seed: number, settings: HeartsSettings): HeartsState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const deck = shuffle(newDeck(), dealRng);
  // Deal 13 cards each
  const hands: Card[][] = [
    deck.slice(0, 13),
    deck.slice(13, 26),
    deck.slice(26, 39),
    deck.slice(39, 52),
  ];

  // Find who has 2♣
  const twoClub = deck.find(c => c.suit === "♣" && c.rank === 2)!;
  const leadSeat = hands.findIndex(h => h.some(c => c.id === twoClub.id));

  let s: HeartsState = {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands,
    currentTrick: [],
    leadSeat,
    turn: leadSeat,
    heartsBroken: false,
    tricksPlayed: 0,
    takenCards: [[], [], [], []],
    handDone: false,
    finalScores: null,
  };

  // If a bot holds 2♣, auto-play bots until it's seat 0's turn
  if (leadSeat !== 0) {
    const initRng = mulberry32(s.rngSeed);
    while (!s.handDone && s.turn !== 0) {
      const botSeat = s.turn;
      const botHand = s.hands[botSeat]!;
      if (botHand.length === 0) break;
      const botCard = botPlay(s, botSeat, initRng);
      s = applyCard(s, botSeat, botCard, initRng);
    }
  }

  return s;
}

// ── isTerminal ─────────────────────────────────────────────────────────────

export function isTerminal(state: HeartsState): { score: number } | null {
  if (!state.handDone || !state.finalScores) return null;
  const playerPenalty = state.finalScores[0]!;
  return { score: Math.max(0, 26 - playerPenalty) };
}
