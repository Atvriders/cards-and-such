import type { Card, Rank, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface NewmarketSettings { dummy: "off" }

export type NewmarketPhase = "betting" | "playing" | "done";

// The 4 "horses" (boodle cards) on the board
export const BOODLE_CARDS: { rank: Rank; suit: Suit }[] = [
  { rank: 10, suit: "♥" },
  { rank: 11, suit: "♦" },
  { rank: 12, suit: "♣" },
  { rank: 13, suit: "♠" },
];

export interface NewmarketState {
  settings: NewmarketSettings;
  hands: readonly (readonly Card[])[];
  deadHand: readonly Card[]; // the spare hand nobody uses
  played: readonly Card[]; // sequence played so far this round
  currentSuit: Suit | null;
  boodlePot: readonly number[]; // chips on each boodle card [0..3]
  playerChips: number;
  turn: number; // 0 = player, 1-3 = bots
  phase: NewmarketPhase;
  rngSeed: number;
}

export type NewmarketAction =
  | { type: "placeBet"; amount: number } // player antes up
  | { type: "playCard"; cardId: string }
  | { type: "pass" };

export function cardMatchesBoodle(card: Card): number {
  return BOODLE_CARDS.findIndex(b => b.rank === card.rank && b.suit === card.suit);
}

// Get the next card to play in sequence: same suit, rank+1
function nextInSequence(suit: Suit, rank: Rank, hands: readonly (readonly Card[])[]): { card: Card; seat: number } | null {
  const nextRank = (rank + 1) as Rank;
  if (nextRank > 13 && rank !== 1) return null; // wrap not done in this version
  for (let seat = 0; seat < hands.length; seat++) {
    const card = hands[seat]!.find(c => c.suit === suit && c.rank === nextRank);
    if (card) return { card, seat };
  }
  return null;
}

function botPlay(state: NewmarketState): NewmarketState {
  const seat = state.turn;
  const hand = state.hands[seat]!;
  if (hand.length === 0) {
    // This player is done
    return { ...state, phase: "done" };
  }

  if (state.currentSuit !== null && state.played.length > 0) {
    const lastPlayed = state.played[state.played.length - 1]!;
    const next = nextInSequence(lastPlayed.suit, lastPlayed.rank, state.hands);
    if (next && next.seat === seat) {
      // Play the next in sequence
      const newHand = hand.filter(c => c.id !== next.card.id);
      const newHands = state.hands.map((h, i) => i === seat ? newHand : h);
      const boodleIdx = cardMatchesBoodle(next.card);
      let boodlePot = [...state.boodlePot];
      let playerChips = state.playerChips;
      if (boodleIdx >= 0 && boodlePot[boodleIdx]! > 0) {
        // Bot collects boodle (we don't track bot chips separately)
        boodlePot[boodleIdx] = 0;
      }
      if (newHand.length === 0) {
        return { ...state, hands: newHands, played: [...state.played, next.card], boodlePot, playerChips, phase: "done" };
      }
      return { ...state, hands: newHands, played: [...state.played, next.card], boodlePot, playerChips };
    }
    // Can't continue — stop, player must lead new sequence
    return { ...state, turn: 0 };
  }

  // Lead lowest card
  const sorted = [...hand].sort((a, b) => a.rank - b.rank);
  const lead = sorted[0]!;
  const newHand = hand.filter(c => c.id !== lead.id);
  const newHands = state.hands.map((h, i) => i === seat ? newHand : h);
  if (newHand.length === 0) {
    return { ...state, hands: newHands, played: [lead], currentSuit: lead.suit, phase: "done" };
  }
  return { ...state, hands: newHands, played: [lead], currentSuit: lead.suit, turn: 0 };
}

export function initialState(seed: number, settings: NewmarketSettings): NewmarketState {
  const rng = mulberry32(seed);
  // 53 cards (52 + conceptual dead hand position)
  const deck = shuffle(newDeck(), rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  // Deal 4 hands + 1 dead hand (13 each + spare)
  const hands: Card[][] = [[], [], [], []];
  const deadHand: Card[] = [];
  for (let i = 0; i < 52; i++) {
    if (i < 10) deadHand.push(deck[i]!);
    else hands[(i - 10) % 4]!.push(deck[i]!);
  }

  // 4 boodle slots start empty (players ante in betting phase)
  return {
    settings, hands: hands as unknown as Card[][], deadHand, played: [], currentSuit: null,
    boodlePot: [2, 2, 2, 2], // pre-loaded with 2 chips each (house contribution)
    playerChips: 20, turn: 0, phase: "betting", rngSeed: nextSeed,
  };
}

export function reducer(state: NewmarketState, action: NewmarketAction): NewmarketState {
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  let s: NewmarketState = { ...state, rngSeed: nextSeed };

  if (s.phase === "betting") {
    if (action.type === "placeBet") {
      const amount = Math.min(action.amount, s.playerChips);
      const boodlePot = s.boodlePot.map(p => p + amount) as [number, number, number, number];
      return { ...s, boodlePot, playerChips: s.playerChips - amount, phase: "playing" };
    }
    return state;
  }

  if (s.phase === "done") return state;
  if (s.turn !== 0) return state;

  if (action.type === "playCard") {
    const hand = s.hands[0]!;
    const card = hand.find(c => c.id === action.cardId);
    if (!card) return state;

    // If there's a current sequence, must continue it or it's blocked
    if (s.played.length > 0 && s.currentSuit !== null) {
      const last = s.played[s.played.length - 1]!;
      if (card.suit !== last.suit || card.rank !== last.rank + 1) return state;
    }

    const newHand = hand.filter(c => c.id !== action.cardId);
    const newHands = s.hands.map((h, i) => i === 0 ? newHand : h);
    const newPlayed = [...s.played, card];

    // Check boodle
    const boodleIdx = cardMatchesBoodle(card);
    let boodlePot = [...s.boodlePot];
    let playerChips = s.playerChips;
    if (boodleIdx >= 0 && boodlePot[boodleIdx]! > 0) {
      playerChips += boodlePot[boodleIdx]!;
      boodlePot[boodleIdx] = 0;
    }

    if (newHand.length === 0) {
      return { ...s, hands: newHands, played: newPlayed, currentSuit: card.suit, boodlePot, playerChips, phase: "done" };
    }

    // Run bots to continue the sequence or lead next
    let next: NewmarketState = { ...s, hands: newHands, played: newPlayed, currentSuit: card.suit, boodlePot, playerChips };
    // Check if next in sequence exists somewhere
    const nextCard = nextInSequence(card.suit, card.rank, next.hands);
    if (nextCard) {
      next = { ...next, turn: nextCard.seat };
      // Run bot if it's bot's turn
      let safety = 0;
      while (next.phase === "playing" && next.turn !== 0 && safety < 100) {
        safety++;
        next = botPlay(next);
      }
    } else {
      // Sequence blocked — player must lead new one
      next = { ...next, turn: 0, played: [], currentSuit: null };
    }
    return next;
  }

  if (action.type === "pass") {
    // Player passes lead — bots run
    let next: NewmarketState = { ...s, turn: 1, played: [], currentSuit: null };
    let safety = 0;
    while (next.phase === "playing" && next.turn !== 0 && safety < 100) {
      safety++;
      next = botPlay(next);
    }
    return next;
  }

  return state;
}

export function isTerminal(state: NewmarketState): { score: number } | null {
  if (state.phase !== "done") return null;
  // Score: chips remaining vs starting 20
  return { score: Math.min(100, Math.max(0, state.playerChips * 5)) };
}
