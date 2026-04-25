// Play or Pay — classic family card game
// Cards 1-13 (A-K) are laid out by suit in sequence.
// On your turn: play a card that continues any suit sequence, or pay a chip to the pot.
// First to empty hand wins the pot.

import type { Card, Rank, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle, rankLabel } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type { Rank, Suit };

export interface PlayOrPaySettings {
  opponents: "1" | "2" | "3";
  startChips: "10" | "15" | "20";
}

export type PlayOrPayPhase = "playing" | "done";

// A card in the layout occupies a position in one of four suit sequences.
// Each suit builds from Ace to King (1 → 13).
export interface PlayOrPayState {
  settings: PlayOrPaySettings;
  seats: number;
  hands: readonly (readonly Card[])[];
  chips: readonly number[];
  pot: number;
  // For each suit: next rank needed (1=start, 14=complete)
  sequences: Readonly<Record<Suit, number>>;
  turn: number;
  phase: PlayOrPayPhase;
  winner: number | null;
  rngSeed: number;
  log: string;
}

export type PlayOrPayAction =
  | { type: "playCard"; cardId: string }
  | { type: "pay" };

const SEAT_NAMES = ["You", "Bot 1", "Bot 2", "Bot 3"];
export function seatName(s: number): string { return SEAT_NAMES[s] ?? `P${s}`; }
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

export function canPlayCard(card: Card, sequences: Readonly<Record<Suit, number>>): boolean {
  return card.rank === sequences[card.suit];
}

export function initialState(seed: number, settings: PlayOrPaySettings): PlayOrPayState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const seats = 1 + parseInt(settings.opponents, 10);
  const startChips = parseInt(settings.startChips, 10);
  const dealRng = mulberry32(nextSeed);
  const deck = shuffle(newDeck(), dealRng);

  const hands: Card[][] = Array.from({ length: seats }, () => []);
  deck.forEach((c, i) => hands[i % seats]!.push(c));

  const sequences: Record<Suit, number> = { "♠": 1, "♥": 1, "♦": 1, "♣": 1 };

  return {
    settings,
    seats,
    hands,
    chips: new Array<number>(seats).fill(startChips),
    pot: 0,
    sequences,
    turn: 0,
    phase: "playing",
    winner: null,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    log: "Play a card that continues a suit sequence (Ace to King), or pay a chip.",
  };
}

function runBots(state: PlayOrPayState): PlayOrPayState {
  let s = state;
  let iters = 0;
  while (!s.winner && s.turn !== 0 && iters < 300) {
    iters++;
    const bot = s.turn;
    const botHand = s.hands[bot]!;
    const rng = mulberry32(s.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    const playable = botHand.filter(c => canPlayCard(c, s.sequences));
    if (playable.length > 0) {
      // Play the card that unlocks most cards in hand
      const chosen = playable[0]!;
      const newHand = botHand.filter(c => c.id !== chosen.id);
      const newSeq = { ...s.sequences };
      newSeq[chosen.suit] = (chosen.rank + 1) as Rank;

      const newHands = s.hands.map((h, i) => i === bot ? newHand : h);
      if (newHand.length === 0) {
        const winnerChips = s.chips[bot]! + s.pot;
        const newChips = s.chips.map((c, i) => i === bot ? winnerChips : c);
        s = { ...s, hands: newHands, sequences: newSeq, chips: newChips, pot: 0, winner: bot, phase: "done", rngSeed: nextSeed, log: `${seatName(bot)} plays last card and wins the pot!` };
        break;
      }
      s = { ...s, hands: newHands, sequences: newSeq, turn: (bot + 1) % s.seats, rngSeed: nextSeed, log: `${seatName(bot)} played ${chosen.suit}${rankLabel(chosen.rank)}.` };
    } else {
      // Pay chip
      const newChips = [...s.chips];
      if ((newChips[bot] ?? 0) <= 0) {
        // Skip
        s = { ...s, turn: (bot + 1) % s.seats, rngSeed: nextSeed };
        continue;
      }
      newChips[bot] = (newChips[bot] ?? 0) - 1;
      s = { ...s, chips: newChips, pot: s.pot + 1, turn: (bot + 1) % s.seats, rngSeed: nextSeed, log: `${seatName(bot)} pays a chip. Pot: ${s.pot + 1}.` };
    }
  }
  return s;
}

export function reducer(state: PlayOrPayState, action: PlayOrPayAction): PlayOrPayState {
  if (state.phase === "done") return state;
  if (state.turn !== 0) return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  if (action.type === "pay") {
    const chips = state.chips[0] ?? 0;
    if (chips <= 0) {
      // Skip turn
      const s: PlayOrPayState = { ...state, turn: 1 % state.seats, rngSeed: nextSeed, log: "No chips — turn passes." };
      return runBots(s);
    }
    const newChips = [...state.chips];
    newChips[0] = chips - 1;
    const s: PlayOrPayState = { ...state, chips: newChips, pot: state.pot + 1, turn: 1 % state.seats, rngSeed: nextSeed, log: `You paid a chip. Pot: ${state.pot + 1}.` };
    return runBots(s);
  }

  if (action.type === "playCard") {
    const hand = state.hands[0]!;
    const card = hand.find(c => c.id === action.cardId);
    if (!card) return state;
    if (!canPlayCard(card, state.sequences)) return state;

    const newHand = hand.filter(c => c.id !== action.cardId);
    const newSeq = { ...state.sequences };
    newSeq[card.suit] = (card.rank + 1) as Rank;
    const newHands = state.hands.map((h, i) => i === 0 ? newHand : h);

    if (newHand.length === 0) {
      const winnerChips = (state.chips[0] ?? 0) + state.pot;
      const newChips = state.chips.map((c, i) => i === 0 ? winnerChips : c);
      return { ...state, hands: newHands, sequences: newSeq, chips: newChips, pot: 0, winner: 0, phase: "done", rngSeed: nextSeed, log: "You play your last card and win the pot!" };
    }

    const s: PlayOrPayState = {
      ...state,
      hands: newHands,
      sequences: newSeq,
      turn: 1 % state.seats,
      rngSeed: nextSeed,
      log: `You played ${card.suit}${rankLabel(card.rank)}.`,
    };
    return runBots(s);
  }

  return state;
}

export function isTerminal(state: PlayOrPayState): { score: number } | null {
  if (state.phase !== "done" || state.winner === null) return null;
  return { score: state.winner === 0 ? (state.chips[0] ?? 0) * 10 + 200 : Math.max(0, (state.chips[0] ?? 0) * 5) };
}

export { SUITS, rankLabel };
