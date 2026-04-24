import type { Card, Rank, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface MichiganSettings { dummy: "off" }

export type MichiganPhase = "playing" | "done";

export interface MichiganState {
  settings: MichiganSettings;
  hands: readonly (readonly Card[])[];
  currentSuit: Suit;
  currentRank: Rank;
  lastPlaySeat: number | null;
  blockedSuits: readonly Suit[];
  finishOrder: readonly number[];
  phase: MichiganPhase;
  rngSeed: number;
}

export type MichiganAction =
  | { type: "play"; cardId: string }
  | { type: "changeSuit"; suit: Suit };

// Michigan (Boodle) — sequence game where play continues up in a suit
// When a player can't continue, the sequence is blocked and they change suit
// Ace is highest; King blocks the sequence (no higher card)

export function nextRank(rank: Rank): Rank | null {
  if (rank === 13) return null; // King is highest — blocks
  if (rank === 1) return null; // Ace leads must eventually play on Ace which can't be beaten
  return (rank + 1) as Rank;
}

export function canPlay(card: Card, suit: Suit, rank: Rank): boolean {
  return card.suit === suit && card.rank === rank;
}

function findNextCardHolder(hands: readonly (readonly Card[])[], suit: Suit, rank: Rank): number | null {
  const next = nextRank(rank);
  if (next === null) return null;
  for (let i = 0; i < hands.length; i++) {
    if (hands[i]!.some(c => c.suit === suit && c.rank === next)) return i;
  }
  return null; // blocked
}


function runSequence(state: MichiganState, startSeat: number): MichiganState {
  let s = state;
  let currentSeat = startSeat;
  let safety = 0;

  while (s.phase === "playing" && safety < 200) {
    safety++;
    const next = nextRank(s.currentRank);
    if (next === null) {
      // Sequence blocked by King or Ace high — current player changes suit
      if (currentSeat === 0) return s; // player's turn to change suit
      // Bot changes suit to their lowest unplayed suit
      const botHand = s.hands[currentSeat]!;
      const suits: Suit[] = ["♠", "♥", "♦", "♣"];
      const available = suits.filter(su => !s.blockedSuits.includes(su) && botHand.some(c => c.suit === su));
      if (available.length === 0) {
        // Bot is out of playable suits — game ends
        return { ...s, phase: "done" };
      }
      const newSuit = available[0]!;
      // Find lowest card in that suit
      const lead = botHand.filter(c => c.suit === newSuit).sort((a, b) => a.rank - b.rank)[0]!;
      const newHand = botHand.filter(c => c.id !== lead.id);
      const newHands = s.hands.map((h, i) => i === currentSeat ? newHand : h);
      const newFinish = newHand.length === 0 ? [...s.finishOrder, currentSeat] : s.finishOrder;
      if (newFinish.length >= 4) return { ...s, hands: newHands, currentSuit: lead.suit, currentRank: lead.rank as Rank, lastPlaySeat: currentSeat, phase: "done" };
      s = { ...s, hands: newHands, currentSuit: lead.suit, currentRank: lead.rank as Rank, lastPlaySeat: currentSeat, finishOrder: newFinish, blockedSuits: [] };
      // Find who has next in new suit
      const holder = findNextCardHolder(s.hands, s.currentSuit, s.currentRank);
      if (holder === null) continue;
      currentSeat = holder;
      if (currentSeat === 0) return s;
      continue;
    }

    // Find who has next card
    const holder = findNextCardHolder(s.hands, s.currentSuit, s.currentRank);
    if (holder === null) {
      // Blocked — add suit to blocked list, current player (bot) changes
      if (currentSeat === 0) return { ...s, blockedSuits: [...s.blockedSuits, s.currentSuit] };
      const botHand = s.hands[currentSeat]!;
      const suits: Suit[] = ["♠", "♥", "♦", "♣"];
      const available = suits.filter(su => !s.blockedSuits.includes(su) && botHand.some(c => c.suit === su));
      if (available.length === 0) return { ...s, phase: "done" };
      const newSuit = available[0]!;
      const lead = botHand.filter(c => c.suit === newSuit).sort((a, b) => a.rank - b.rank)[0]!;
      const newHand = botHand.filter(c => c.id !== lead.id);
      const newHands = s.hands.map((h, i) => i === currentSeat ? newHand : h);
      const newFinish = newHand.length === 0 ? [...s.finishOrder, currentSeat] : s.finishOrder;
      if (newFinish.length >= 4) return { ...s, hands: newHands, currentSuit: lead.suit, currentRank: lead.rank as Rank, lastPlaySeat: currentSeat, phase: "done" };
      s = { ...s, hands: newHands, currentSuit: lead.suit, currentRank: lead.rank as Rank, lastPlaySeat: currentSeat, finishOrder: newFinish, blockedSuits: [] };
      currentSeat = 0; // Return to player to determine next
      return s;
    }

    if (holder === 0) return s; // Player's turn to play

    // Bot plays
    const botHand = s.hands[holder]!;
    const card = botHand.find(c => c.suit === s.currentSuit && c.rank === next)!;
    const newHand = botHand.filter(c => c.id !== card.id);
    const newHands = s.hands.map((h, i) => i === holder ? newHand : h);
    const newFinish = newHand.length === 0 ? [...s.finishOrder, holder] : s.finishOrder;
    if (newFinish.length >= 4) return { ...s, hands: newHands, currentRank: next, lastPlaySeat: holder, phase: "done", finishOrder: newFinish };
    s = { ...s, hands: newHands, currentRank: next, lastPlaySeat: holder, finishOrder: newFinish };
    currentSeat = holder;
  }

  return s;
}

export function initialState(seed: number, settings: MichiganSettings): MichiganState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  const hands: Card[][] = [deck.slice(0, 13), deck.slice(13, 26), deck.slice(26, 39), deck.slice(39, 52)];

  // Player leads with lowest spade (or any suit)
  const playerHand = hands[0]!;
  const spades = playerHand.filter(c => c.suit === "♠").sort((a, b) => a.rank - b.rank);
  const leadCard = spades[0] ?? playerHand.sort((a, b) => a.rank - b.rank)[0]!;

  // Remove lead card from player's hand
  const newPlayerHand = playerHand.filter(c => c.id !== leadCard.id);
  const newHands = [newPlayerHand, hands[1]!, hands[2]!, hands[3]!];

  let state: MichiganState = {
    settings, hands: newHands, currentSuit: leadCard.suit, currentRank: leadCard.rank,
    lastPlaySeat: 0, blockedSuits: [], finishOrder: [], phase: "playing", rngSeed: nextSeed,
  };

  // Run sequence from here
  state = runSequence(state, 0);
  return state;
}

export function reducer(state: MichiganState, action: MichiganAction): MichiganState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  let s: MichiganState = { ...state, rngSeed: nextSeed };

  if (action.type === "play") {
    const hand = s.hands[0]!;
    const card = hand.find(c => c.id === action.cardId);
    if (!card) return state;
    if (!canPlay(card, s.currentSuit, nextRank(s.currentRank)!)) return state;

    const newHand = hand.filter(c => c.id !== action.cardId);
    const newHands = s.hands.map((h, i) => i === 0 ? newHand : h);
    const newRank = nextRank(s.currentRank)!;
    const newFinish = newHand.length === 0 ? [...s.finishOrder, 0] : s.finishOrder;
    if (newFinish.length >= 4) return { ...s, hands: newHands, currentRank: newRank, lastPlaySeat: 0, finishOrder: newFinish, phase: "done" };
    s = { ...s, hands: newHands, currentRank: newRank, lastPlaySeat: 0, finishOrder: newFinish };
    return runSequence(s, 0);
  }

  if (action.type === "changeSuit") {
    const hand = s.hands[0]!;
    const card = hand.filter(c => c.suit === action.suit).sort((a, b) => a.rank - b.rank)[0];
    if (!card) return state;
    const newHand = hand.filter(c => c.id !== card.id);
    const newHands = s.hands.map((h, i) => i === 0 ? newHand : h);
    const newFinish = newHand.length === 0 ? [...s.finishOrder, 0] : s.finishOrder;
    if (newFinish.length >= 4) return { ...s, hands: newHands, currentSuit: card.suit, currentRank: card.rank, lastPlaySeat: 0, finishOrder: newFinish, phase: "done" };
    s = { ...s, hands: newHands, currentSuit: card.suit, currentRank: card.rank, lastPlaySeat: 0, finishOrder: newFinish, blockedSuits: [] };
    return runSequence(s, 0);
  }

  return state;
}

export function isTerminal(state: MichiganState): { score: number } | null {
  if (state.phase !== "done") return null;
  const pos = state.finishOrder.indexOf(0);
  if (pos < 0) {
    // Player didn't finish — score based on remaining cards
    const remaining = state.hands[0]!.length;
    return { score: Math.max(0, 50 - remaining * 5) };
  }
  return { score: [100, 60, 30, 10][pos] ?? 10 };
}
