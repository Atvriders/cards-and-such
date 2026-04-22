import type { Card, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SheepsheadSettings {
  botDifficulty: "easy" | "standard";
}

export type SheepsheadPhase = "playing" | "done";

// Sheepshead uses 32 cards: 7-A of 4 suits
// Ranks: 7=7, 8=8, 9=9, 10=10, J=11, Q=12, K=13, A=1

export function makeSheepsheadDeck(): Card[] {
  const suits: Suit[] = ["♠", "♥", "♦", "♣"];
  const ranks = [7, 8, 9, 10, 11, 12, 13, 1] as const;
  const cards: Card[] = [];
  for (const s of suits) {
    for (const r of ranks) {
      cards.push({ suit: s, rank: r as Card["rank"], id: `${s}${r}` });
    }
  }
  return cards; // 32 cards
}

// Counter values
export function counterValue(rank: number): number {
  if (rank === 1) return 11;
  if (rank === 10) return 10;
  if (rank === 13) return 4;
  if (rank === 12) return 3;
  if (rank === 11) return 2;
  return 0;
}

// Sheepshead trump: Clubs is always trump, plus all Queens and Jacks are trump
// Trump order (low to high): 7♣, 8♣, 9♣, K♣, 10♣, A♣, J♦, J♥, J♠, J♣, Q♦, Q♥, Q♠, Q♣
// Simplified: trump suit = clubs. All Q and J of any suit are trump (rank them by suit + face value).

function isTrump(card: Card): boolean {
  return card.suit === "♣" || card.rank === 11 || card.rank === 12;
}

function trumpOrder(card: Card): number {
  if (card.rank === 12) {
    // Queens: Q♦=8, Q♥=9, Q♠=10, Q♣=11
    const qOrder: Record<string, number> = { "♦": 8, "♥": 9, "♠": 10, "♣": 11 };
    return qOrder[card.suit] ?? 8;
  }
  if (card.rank === 11) {
    // Jacks: J♦=4, J♥=5, J♠=6, J♣=7
    const jOrder: Record<string, number> = { "♦": 4, "♥": 5, "♠": 6, "♣": 7 };
    return jOrder[card.suit] ?? 4;
  }
  // Club suit (non-Q/J): 7=0,8=1,9=2,K=3,10=10,A=11
  const clubOrder: Record<number, number> = { 7: 0, 8: 1, 9: 2, 13: 3, 10: 10, 1: 11 };
  return clubOrder[card.rank] ?? 0;
}

function effectiveSuit(card: Card): string {
  if (isTrump(card)) return "TRUMP";
  return card.suit;
}

function cardPower(card: Card, led: string): number {
  if (isTrump(card)) return trumpOrder(card) + 100;
  if (effectiveSuit(card) === led) {
    const nonTrumpOrder: Record<number, number> = { 7: 0, 8: 1, 9: 2, 13: 3, 10: 10, 1: 11 };
    return nonTrumpOrder[card.rank] ?? 0;
  }
  return -1; // can't win
}

function trickWinner(trick: readonly { seat: number; card: Card }[]): number {
  const led = effectiveSuit(trick[0]!.card);
  return trick.reduce((best, cur) =>
    cardPower(cur.card, led) > cardPower(best.card, led) ? cur : best
  ).seat;
}

export function legalPlays(state: SheepsheadState, seat: number): Card[] {
  const hand = state.hands[seat]!;
  if (hand.length === 0) return [];
  const trick = state.currentTrick;
  if (trick.length === 0) return [...hand];

  const led = effectiveSuit(trick[0]!.card);
  const suitCards = hand.filter(c => effectiveSuit(c) === led);
  return suitCards.length > 0 ? suitCards : [...hand];
}

// ── Bot play ──────────────────────────────────────────────────────────────────

function botPlay(state: SheepsheadState, seat: number, _rng: () => number): Card {
  const legal = legalPlays(state, seat);
  if (legal.length === 1) return legal[0]!;
  const trick = state.currentTrick;
  if (trick.length === 0) {
    return legal.reduce((lo, c) => cardPower(c, effectiveSuit(c)) < cardPower(lo, effectiveSuit(lo)) ? c : lo);
  }
  const winner = trickWinner(trick);
  const led = effectiveSuit(trick[0]!.card);
  const isPickerTeam = (s: number) => s === 0; // seat 0 is picker (solo vs 4 bots)
  // Bots 1-4 cooperate against picker (seat 0)
  if (!isPickerTeam(seat)) {
    // Defender: try to win if picker is winning, else dump high counter
    if (isPickerTeam(winner)) {
      const power = cardPower(trick.find(e => e.seat === winner)!.card, led);
      const beating = legal.filter(c => cardPower(c, led) > power);
      if (beating.length > 0) return beating.reduce((lo, c) => cardPower(c, led) < cardPower(lo, led) ? c : lo);
    }
    // Dump lowest counter
    const sorted = [...legal].sort((a, b) => counterValue(b.rank) - counterValue(a.rank));
    if (isPickerTeam(winner)) return sorted[0]!; // dump high counter to deny picker
    return sorted[sorted.length - 1]!; // dump low
  }
  // Picker: try to win
  const power = cardPower(trick.find(e => e.seat === winner)!.card, led);
  const beating = legal.filter(c => cardPower(c, led) > power);
  if (beating.length > 0) return beating.reduce((lo, c) => cardPower(c, led) < cardPower(lo, led) ? c : lo);
  return legal.reduce((lo, c) => cardPower(c, led) < cardPower(lo, led) ? c : lo);
}

export interface SheepsheadState {
  settings: SheepsheadSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];   // 5 seats
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: SheepsheadPhase;
  tricksTaken: readonly number[];        // per seat
  takenCards: readonly (readonly Card[])[];
  tricksPlayed: number;
  pickerScore: number | null;            // picker's team (seat 0) total counters
  opponentScore: number | null;
}

export type SheepsheadAction = { type: "play"; cardId: string };

// ── applyCard ─────────────────────────────────────────────────────────────────

function applyCard(state: SheepsheadState, seat: number, card: Card, _rng: () => number): SheepsheadState {
  const newHands = state.hands.map((h, i) =>
    i === seat ? h.filter(c => c.id !== card.id) : h
  );
  const newTrick = [...state.currentTrick, { seat, card }];
  let s: SheepsheadState = { ...state, hands: newHands, currentTrick: newTrick };

  if (newTrick.length === 5) {
    const winner = trickWinner(newTrick);
    const newTricksTaken = state.tricksTaken.map((t, i) => i === winner ? t + 1 : t);
    const trickCards = newTrick.map(e => e.card);
    const newTakenCards = state.takenCards.map((tc, i) =>
      i === winner ? [...tc, ...trickCards] : tc
    );
    const tricksPlayed = state.tricksPlayed + 1;

    s = { ...s, currentTrick: [], tricksTaken: newTricksTaken, takenCards: newTakenCards, tricksPlayed, leadSeat: winner, turn: winner };

    if (tricksPlayed === 6) {
      // Picker is seat 0 (solo)
      const pickerScore = newTakenCards[0]!.reduce((sum, c) => sum + counterValue(c.rank), 0);
      const opponentScore = [1, 2, 3, 4].reduce((sum, s2) =>
        sum + newTakenCards[s2]!.reduce((s3, c) => s3 + counterValue(c.rank), 0), 0
      );
      s = { ...s, phase: "done", pickerScore, opponentScore };
    }
  } else {
    s = { ...s, turn: (seat + 1) % 5 };
  }

  return s;
}

// ── reducer ───────────────────────────────────────────────────────────────────

export function reducer(state: SheepsheadState, action: SheepsheadAction): SheepsheadState {
  if (state.phase === "done") return state;
  if (action.type !== "play") return state;
  if (state.turn !== 0) return state;

  const card = state.hands[0]!.find(c => c.id === action.cardId);
  if (!card) return state;
  const legal = legalPlays(state, 0);
  if (!legal.some(c => c.id === card.id)) return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const botRng = mulberry32(nextSeed);

  let s: SheepsheadState = { ...state, rngSeed: nextSeed };
  s = applyCard(s, 0, card, botRng);

  while (s.phase !== "done" && s.turn !== 0) {
    if (s.hands[s.turn]!.length === 0) break;
    const botCard = botPlay(s, s.turn, botRng);
    s = applyCard(s, s.turn, botCard, botRng);
  }

  return s;
}

// ── initialState ──────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: SheepsheadSettings): SheepsheadState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const deck = shuffle(makeSheepsheadDeck(), dealRng);
  // Deal 6 cards each (5 players) + 2 blind
  const hands: Card[][] = [
    deck.slice(0, 6),
    deck.slice(6, 12),
    deck.slice(12, 18),
    deck.slice(18, 24),
    deck.slice(24, 30),
  ];
  const blind = deck.slice(30, 32);
  // Picker (seat 0) picks up blind and discards 2 lowest-value cards
  let pickerHand = [...hands[0]!, ...blind];
  pickerHand.sort((a, b) => counterValue(a.rank) - counterValue(b.rank));
  pickerHand = pickerHand.slice(2); // discard 2 lowest
  hands[0] = pickerHand;

  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands,
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "playing",
    tricksTaken: [0, 0, 0, 0, 0],
    takenCards: [[], [], [], [], []],
    tricksPlayed: 0,
    pickerScore: null,
    opponentScore: null,
  };
}

// ── isTerminal ────────────────────────────────────────────────────────────────

export function isTerminal(state: SheepsheadState): { score: number } | null {
  if (state.phase !== "done" || state.pickerScore === null) return null;
  // Picker wins if they have >= 61 counters (out of 120 total)
  const won = state.pickerScore >= 61;
  return { score: won ? 100 : 0 };
}
