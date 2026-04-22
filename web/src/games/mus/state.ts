import type { Card, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// 40-card Spanish deck: A,2,3,4,5,6,7,J(11),Q(12),K(13)
const SPANISH_RANKS = [1, 2, 3, 4, 5, 6, 7, 11, 12, 13] as const;
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

export function musDeck(): Card[] {
  const cards: Card[] = [];
  for (const s of SUITS) {
    for (const r of SPANISH_RANKS) {
      cards.push({ suit: s, rank: r as Card["rank"], id: `mu-${s}${r}` });
    }
  }
  return cards;
}

/** Mus "Juego" hand value: sum of card values, capped face cards at 10 */
export function musCardValue(rank: Card["rank"]): number {
  if (rank === 1) return 11;   // Ace
  if (rank === 3) return 10;   // 3 (treated as face in many versions)
  if (rank >= 11) return 10;   // J, Q, K
  return rank;                  // 2,4,5,6,7
}

export function handValue(hand: readonly Card[]): number {
  return hand.reduce((s, c) => s + musCardValue(c.rank), 0);
}

/** "Juego" = hand value >= 31 (has Juego) */
export function hasJuego(hand: readonly Card[]): boolean {
  return handValue(hand) >= 31;
}

export type MusPhase = "bidding" | "done";

export interface MusState {
  rngSeed: number;
  playerHand: readonly Card[];
  botHands: readonly (readonly Card[])[];  // 3 bots
  playerBid: number | null;
  botBids: readonly (number | null)[];
  phase: MusPhase;
  message: string;
  scores: readonly number[];   // [player, bot0, bot1, bot2]
  winner: number | null;
}

export type MusAction = { type: "bid"; amount: number };

function botBid(hand: readonly Card[]): number {
  const v = handValue(hand);
  if (v >= 33) return v;
  if (v >= 31) return 31;
  return Math.max(0, v - 2);
}

function resolveGame(state: MusState, playerBid: number, botBids: readonly (number | null)[]): MusState {
  const allBids = [playerBid, ...botBids.map(b => b ?? 0)];
  const allValues = [handValue(state.playerHand), ...state.botHands.map(h => handValue(h))];
  const allHaveJuego = allValues.map(v => v >= 31);

  // Phase 1: Juego players vs non-Juego players
  // Juego players score against non-Juego players
  // If tie in Juego values, closest to 31 wins among Juego holders
  // Simplified: highest total value wins the Juego pot

  const scores = [0, 0, 0, 0];

  // Check for Juego winners
  const juegoPlayers = allValues.map((v, i) => ({ i, v, hasJ: v >= 31 }));
  const juegoHolders = juegoPlayers.filter(p => p.hasJ);

  if (juegoHolders.length > 0) {
    // Juego holders vs non-holders: holders win 3 pts each from non-holders (simplified)
    // Among holders, closest to 31 wins
    // For simplicity: highest bid among Juego holders wins
    const winner = juegoHolders.reduce((best, p) => {
      if (p.v === 31) return p; // 31 beats others
      return p.v > best.v ? p : best;
    });
    scores[winner.i]! += 3;
    // Each non-Juego player loses 1
    juegoPlayers.filter(p => !p.hasJ).forEach(p => { scores[p.i]! -= 1; });
  } else {
    // No Juego: highest hand value wins
    const maxV = Math.max(...allValues);
    const winners = allValues.map((v, i) => v === maxV ? i : -1).filter(i => i >= 0);
    if (winners.length === 1) scores[winners[0]!]! += 2;
  }

  // Bidding bonus: player who bid highest score gets extra point if they won
  const highBidder = allBids.indexOf(Math.max(...allBids));
  const winner2 = scores.indexOf(Math.max(...scores));
  if (highBidder === winner2) scores[highBidder]! += 1;

  const msg = `Juego phase over! You scored ${scores[0]} pts. Values: You=${allValues[0]}, B1=${allValues[1]}, B2=${allValues[2]}, B3=${allValues[3]}.`;
  return { ...state, scores, playerBid, botBids, phase: "done", message: msg, winner: winner2 };
}

export function reducer(state: MusState, action: MusAction): MusState {
  if (state.phase === "done") return state;
  if (action.type !== "bid") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const s = { ...state, rngSeed: nextSeed };

  const botBids = state.botHands.map(h => botBid(h));
  return resolveGame(s, action.amount, botBids);
}

export function initialState(seed: number): MusState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const deck = shuffle(musDeck(), mulberry32(nextSeed));

  const playerHand = deck.slice(0, 4);
  const botHands = [deck.slice(4, 8), deck.slice(8, 12), deck.slice(12, 16)];
  const pv = handValue(playerHand);

  return {
    rngSeed: Math.floor(mulberry32(nextSeed)() * 2 ** 31),
    playerHand,
    botHands,
    playerBid: null,
    botBids: [null, null, null],
    phase: "bidding",
    message: `Your hand value: ${pv}${pv >= 31 ? " (Juego!)" : ""}. Bid your confidence (0–${pv}).`,
    scores: [0, 0, 0, 0],
    winner: null,
  };
}

export function isTerminal(state: MusState): { score: number } | null {
  if (state.phase !== "done") return null;
  const playerScore = state.scores[0]!;
  return { score: Math.max(0, Math.min(100, 50 + playerScore * 15)) };
}
