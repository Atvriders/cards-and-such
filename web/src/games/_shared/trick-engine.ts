// Shared trick-taking engine used by Bridge/Euchre/Whist/Pinochle/Tarot/Skat/Briscola families.
import type { Card, Suit, Rank } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

export interface TrickConfig {
  ranks: readonly Rank[];     // ranks present in deck (e.g. [9,10,11,12,13,1] for euchre, [1..13] for full deck)
  copies?: number;            // 1=single deck, 2=double deck (pinochle)
  rankOrder?: (rank: Rank) => number; // override (default Ace high)
}

export function buildDeck(cfg: TrickConfig, idPrefix = "t"): Card[] {
  const cards: Card[] = [];
  const copies = cfg.copies ?? 1;
  for (let c = 0; c < copies; c++) {
    for (const s of SUITS) {
      for (const r of cfg.ranks) {
        cards.push({ suit: s, rank: r, id: `${idPrefix}-${c}-${s}${r}` });
      }
    }
  }
  return cards;
}

export function defaultRankOrder(rank: Rank): number {
  if (rank === 1) return 14; // Ace high
  return rank;
}

/** Pinochle/Briscola order: A,10,K,Q,J,9 with A=14, 10=13, K=12, Q=11, J=10, 9=9 */
export function pinochleRankOrder(rank: Rank): number {
  if (rank === 1) return 14;
  if (rank === 10) return 13;
  return rank;
}

/** Tressette order: 3,2,A,K,Q,J,7,6,5,4 with 3 highest */
export function tressetteRankOrder(rank: Rank): number {
  const map: Record<number, number> = { 3: 14, 2: 13, 1: 12, 13: 11, 12: 10, 11: 9, 7: 8, 6: 7, 5: 6, 4: 5 };
  return map[rank as number] ?? rank;
}

/** Compute trick winner given trump and led suit. */
export function trickWinner(
  trick: readonly { seat: number; card: Card }[],
  trump: Suit | null,
  rankOrder: (r: Rank) => number = defaultRankOrder,
): number {
  if (trick.length === 0) return -1;
  const led = trick[0]!.card.suit;
  let bestSeat = trick[0]!.seat;
  let bestStrength = strength(trick[0]!.card, trump, led, rankOrder);
  for (let i = 1; i < trick.length; i++) {
    const t = trick[i]!;
    const s = strength(t.card, trump, led, rankOrder);
    if (s > bestStrength) { bestStrength = s; bestSeat = t.seat; }
  }
  return bestSeat;
}

function strength(card: Card, trump: Suit | null, led: Suit, rankOrder: (r: Rank) => number): number {
  if (trump && card.suit === trump) return 1000 + rankOrder(card.rank);
  if (card.suit === led) return 500 + rankOrder(card.rank);
  return rankOrder(card.rank);
}

/** Cards in hand legal to play given lead. Must follow led suit if possible. */
export function legalPlays(
  hand: readonly Card[],
  trick: readonly { seat: number; card: Card }[],
): Card[] {
  if (trick.length === 0) return [...hand];
  const led = trick[0]!.card.suit;
  const followers = hand.filter(c => c.suit === led);
  return followers.length > 0 ? followers : [...hand];
}

/** CPU: pick legal play. If can win cheaply, do; else dump lowest. */
export function cpuPlayCard(
  hand: readonly Card[],
  trick: readonly { seat: number; card: Card }[],
  trump: Suit | null,
  mySeat: number,
  partnerSeat: number | null,
  rankOrder: (r: Rank) => number = defaultRankOrder,
): Card {
  const legal = legalPlays(hand, trick);
  if (legal.length === 1) return legal[0]!;

  if (trick.length === 0) {
    // Lead lowest non-trump if possible
    const nonTrump = legal.filter(c => c.suit !== trump);
    const pool = nonTrump.length > 0 ? nonTrump : legal;
    return pool.reduce((lo, c) => rankOrder(c.rank) < rankOrder(lo.rank) ? c : lo);
  }

  const led = trick[0]!.card.suit;
  let bestEntry = trick[0]!;
  let bestStr = strength(trick[0]!.card, trump, led, rankOrder);
  for (const e of trick) {
    const s = strength(e.card, trump, led, rankOrder);
    if (s > bestStr) { bestStr = s; bestEntry = e; }
  }
  const partnerWinning = partnerSeat !== null && bestEntry.seat === partnerSeat;
  if (partnerWinning) {
    return legal.reduce((lo, c) => rankOrder(c.rank) < rankOrder(lo.rank) ? c : lo);
  }
  // Try to take cheaply
  const winners = legal.filter(c => strength(c, trump, led, rankOrder) > bestStr);
  if (winners.length > 0) {
    return winners.reduce((lo, c) => rankOrder(c.rank) < rankOrder(lo.rank) ? c : lo);
  }
  return legal.reduce((lo, c) => rankOrder(c.rank) < rankOrder(lo.rank) ? c : lo);
}

/** Deal `n` cards to each of `players`. Returns hands and remaining stock. */
export function dealHands(deck: Card[], players: number, perHand: number): { hands: Card[][]; stock: Card[] } {
  const hands: Card[][] = [];
  let idx = 0;
  for (let p = 0; p < players; p++) {
    hands.push(deck.slice(idx, idx + perHand));
    idx += perHand;
  }
  return { hands, stock: deck.slice(idx) };
}

export function shuffleDeck(deck: Card[], rng: () => number): Card[] {
  return shuffle(deck, rng);
}

// Pretty suit names for messages
export function suitName(s: Suit): string {
  return s === "♠" ? "Spades" : s === "♥" ? "Hearts" : s === "♦" ? "Diamonds" : "Clubs";
}

// ── Generic 2-player heads-up trick state -------------------------------------

export interface TrickGameState {
  rngSeed: number;
  hands: readonly (readonly Card[])[];     // [player, cpu]
  trump: Suit | null;
  trick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  tricks: readonly number[];
  message: string;
  phase: "playing" | "done";
  score: number;
}
