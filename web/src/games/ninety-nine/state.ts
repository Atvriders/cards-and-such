import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface NinetyNineSettings {
  botDifficulty: "easy" | "standard";
}

export type NinetyNinePhase = "bidding" | "playing" | "done";

// Bid card values: clubs=3, hearts=2, spades=1, diamonds=0
export function bidValue(card: Card): number {
  if (card.suit === "♣") return 3;
  if (card.suit === "♥") return 2;
  if (card.suit === "♠") return 1;
  return 0; // diamonds
}

export interface NinetyNineState {
  settings: NinetyNineSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];   // 3 seats, 12 cards each initially → 9 after bid
  bidCards: readonly (readonly Card[])[];  // 3 bid cards each seat put aside
  bids: readonly (number | null)[];        // computed bid totals per seat
  trumpSuit: Suit;                         // fixed = hearts
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: NinetyNinePhase;
  tricksTaken: readonly number[];
  tricksPlayed: number;
  finalScores: readonly number[] | null;  // 1 = made bid, 0 = missed
}

export type NinetyNineAction =
  | { type: "putDown"; cardIds: [string, string, string] }   // player puts 3 cards face-down
  | { type: "play"; cardId: string };

// ── Trick resolution ──────────────────────────────────────────────────────────

function trickWinner(
  trick: readonly { seat: number; card: Card }[],
  trump: Suit,
): number {
  const led = trick[0]!.card.suit;
  const trumpCards = trick.filter(e => e.card.suit === trump);
  if (trumpCards.length > 0) {
    return trumpCards.reduce((b, c) => {
      const rv = (x: Card) => x.rank === 1 ? 14 : x.rank;
      return rv(c.card) > rv(b.card) ? c : b;
    }).seat;
  }
  return trick.filter(e => e.card.suit === led).reduce((b, c) => {
    const rv = (x: Card) => x.rank === 1 ? 14 : x.rank;
    return rv(c.card) > rv(b.card) ? c : b;
  }).seat;
}

export function legalPlays(state: NinetyNineState, seat: number): Card[] {
  const hand = state.hands[seat]!;
  if (hand.length === 0) return [];
  const trick = state.currentTrick;
  if (trick.length === 0) return [...hand];
  const led = trick[0]!.card.suit;
  const suitCards = hand.filter(c => c.suit === led);
  return suitCards.length > 0 ? suitCards : [...hand];
}

// ── Bot bid selection ──────────────────────────────────────────────────────────

function botSelectBidCards(hand: readonly Card[]): Card[] {
  // Prefer to bid 4-6 (middle): pick cards to sum ~4-6
  // Strategy: put aside lowest bid-value cards first if aiming low, or mix
  const sorted = [...hand].sort((a, b) => bidValue(a) - bidValue(b));
  // Try to bid around 4-5
  let best: Card[] = sorted.slice(0, 3);
  let bestDiff = Math.abs(best.reduce((s, c) => s + bidValue(c), 0) - 4);

  // Brute-force: try all combos of 3 cards
  for (let i = 0; i < hand.length; i++) {
    for (let j = i + 1; j < hand.length; j++) {
      for (let k = j + 1; k < hand.length; k++) {
        const combo = [hand[i]!, hand[j]!, hand[k]!];
        const sum = combo.reduce((s, c) => s + bidValue(c), 0);
        const diff = Math.abs(sum - 4);
        if (diff < bestDiff) { bestDiff = diff; best = combo; }
      }
    }
  }
  return best;
}

// ── Bot play ──────────────────────────────────────────────────────────────────

function botPlay(state: NinetyNineState, seat: number, _rng: () => number): Card {
  const legal = legalPlays(state, seat);
  if (legal.length === 1) return legal[0]!;
  const myBid = state.bids[seat] ?? 0;
  const myTricks = state.tricksTaken[seat]!;
  const trick = state.currentTrick;
  const trump = state.trumpSuit;

  if (trick.length === 0) {
    if (myTricks >= myBid) {
      // Met bid — avoid winning: play lowest
      return legal.reduce((lo, c) => {
        const rv = (x: Card) => x.rank === 1 ? 14 : x.rank;
        return rv(c) < rv(lo) ? c : lo;
      });
    }
    // Need tricks — lead highest trump or high card
    const trumpCards = legal.filter(c => c.suit === trump);
    if (trumpCards.length > 0) return trumpCards.reduce((hi, c) => {
      const rv = (x: Card) => x.rank === 1 ? 14 : x.rank;
      return rv(c) > rv(hi) ? c : hi;
    });
    return legal.reduce((hi, c) => {
      const rv = (x: Card) => x.rank === 1 ? 14 : x.rank;
      return rv(c) > rv(hi) ? c : hi;
    });
  }

  const winner = trickWinner(trick, trump);
  const winnerRank = (() => {
    const rv = (x: Card) => x.rank === 1 ? 14 : x.rank;
    const led = trick[0]!.card.suit;
    const trumpCards2 = trick.filter(e => e.card.suit === trump);
    if (trumpCards2.length > 0) return rv(trumpCards2.reduce((b, c) => rv(c.card) > rv(b.card) ? c : b).card);
    return rv(trick.filter(e => e.card.suit === led).reduce((b, c) => rv(c.card) > rv(b.card) ? c : b).card);
  })();

  const rv = (x: Card) => x.rank === 1 ? 14 : x.rank;

  if (myTricks >= myBid) {
    // Avoid winning: play lowest
    return legal.reduce((lo, c) => rv(c) < rv(lo) ? c : lo);
  }

  // Try to win
  const led = trick[0]!.card.suit;
  const trumpCards3 = legal.filter(c => c.suit === trump);
  const ledCards = legal.filter(c => c.suit === led && c.suit !== trump);

  // Beat with led suit first
  const beatingLed = ledCards.filter(c => rv(c) > winnerRank);
  if (beatingLed.length > 0) return beatingLed.reduce((lo, c) => rv(c) < rv(lo) ? c : lo);

  // Beat with trump
  const beatingTrump = trumpCards3.filter(c => rv(c) > winnerRank || trick.every(e => e.card.suit !== trump));
  if (beatingTrump.length > 0) return beatingTrump.reduce((lo, c) => rv(c) < rv(lo) ? c : lo);

  return legal.reduce((lo, c) => rv(c) < rv(lo) ? c : lo);
}

// ── applyCard ─────────────────────────────────────────────────────────────────

function applyCard(state: NinetyNineState, seat: number, card: Card, _rng: () => number): NinetyNineState {
  const newHands = state.hands.map((h, i) =>
    i === seat ? h.filter(c => c.id !== card.id) : h
  );
  const newTrick = [...state.currentTrick, { seat, card }];
  let s: NinetyNineState = { ...state, hands: newHands, currentTrick: newTrick };

  if (newTrick.length === 3) {
    const winner = trickWinner(newTrick, state.trumpSuit);
    const newTricksTaken = state.tricksTaken.map((t, i) => i === winner ? t + 1 : t);
    const tricksPlayed = state.tricksPlayed + 1;

    s = { ...s, currentTrick: [], tricksTaken: newTricksTaken, tricksPlayed, leadSeat: winner, turn: winner };

    if (tricksPlayed === 9) {
      // Score: did each player make their bid?
      const finalScores = [0, 1, 2].map(i => {
        const bid = state.bids[i] ?? 0;
        const taken = newTricksTaken[i]!;
        return taken === bid ? 10 : -5;
      });
      s = { ...s, phase: "done", finalScores };
    }
  } else {
    s = { ...s, turn: (seat + 1) % 3 };
  }

  return s;
}

// ── reducer ───────────────────────────────────────────────────────────────────

export function reducer(state: NinetyNineState, action: NinetyNineAction): NinetyNineState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const botRng = mulberry32(nextSeed);

  if (state.phase === "bidding") {
    if (action.type !== "putDown") return state;

    const [id1, id2, id3] = action.cardIds;
    const hand = state.hands[0]!;
    const c1 = hand.find(c => c.id === id1);
    const c2 = hand.find(c => c.id === id2);
    const c3 = hand.find(c => c.id === id3);
    if (!c1 || !c2 || !c3) return state;
    // Ensure 3 distinct cards
    const ids = new Set([id1, id2, id3]);
    if (ids.size !== 3) return state;

    const playerBidCards = [c1, c2, c3];
    const playerBid = playerBidCards.reduce((s2, c) => s2 + bidValue(c), 0);
    const playerHand = hand.filter(c => !ids.has(c.id));

    // Bots put down their bid cards
    let bot1BidCards = botSelectBidCards(state.hands[1]!);
    let bot2BidCards = botSelectBidCards(state.hands[2]!);
    const bot1Bid = bot1BidCards.reduce((s2, c) => s2 + bidValue(c), 0);
    const bot2Bid = bot2BidCards.reduce((s2, c) => s2 + bidValue(c), 0);
    const bot1Hand = state.hands[1]!.filter(c => !bot1BidCards.some(b => b.id === c.id));
    const bot2Hand = state.hands[2]!.filter(c => !bot2BidCards.some(b => b.id === c.id));

    const s: NinetyNineState = {
      ...state,
      rngSeed: nextSeed,
      hands: [playerHand, bot1Hand, bot2Hand],
      bidCards: [playerBidCards, bot1BidCards, bot2BidCards],
      bids: [playerBid, bot1Bid, bot2Bid],
      phase: "playing",
      turn: 0,
      leadSeat: 0,
    };

    // Auto-play bots until seat 0's turn
    let s2 = s;
    while (s2.phase !== "done" && s2.turn !== 0) {
      if (s2.hands[s2.turn]!.length === 0) break;
      const botCard = botPlay(s2, s2.turn, botRng);
      s2 = applyCard(s2, s2.turn, botCard, botRng);
    }

    return s2;
  }

  if (state.phase === "playing") {
    if (action.type !== "play") return state;
    if (state.turn !== 0) return state;

    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;
    const legal = legalPlays(state, 0);
    if (!legal.some(c => c.id === card.id)) return state;

    let s: NinetyNineState = { ...state, rngSeed: nextSeed };
    s = applyCard(s, 0, card, botRng);

    while (s.phase !== "done" && s.turn !== 0) {
      if (s.hands[s.turn]!.length === 0) break;
      const botCard = botPlay(s, s.turn, botRng);
      s = applyCard(s, s.turn, botCard, botRng);
    }

    return s;
  }

  return state;
}

// ── initialState ──────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: NinetyNineSettings): NinetyNineState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const deck = shuffle(newDeck(), dealRng);
  // Deal 12 cards to each of 3 players (use first 36 cards)
  const hands: Card[][] = [
    deck.slice(0, 12),
    deck.slice(12, 24),
    deck.slice(24, 36),
  ];

  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands,
    bidCards: [[], [], []],
    bids: [null, null, null],
    trumpSuit: "♥",
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "bidding",
    tricksTaken: [0, 0, 0],
    tricksPlayed: 0,
    finalScores: null,
  };
}

// ── isTerminal ────────────────────────────────────────────────────────────────

export function isTerminal(state: NinetyNineState): { score: number } | null {
  if (state.phase !== "done" || !state.finalScores) return null;
  const myScore = state.finalScores[0]!;
  // Score: 10 if made bid, -5 if missed
  return { score: myScore >= 10 ? 100 : 0 };
}
