import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle, rankLabel } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type { Card };

export interface HCFSettings {
  rounds: "5" | "10" | "20";
}

export interface FlushResult {
  suit: Suit;
  cards: Card[];
  highCard: number; // rank value for comparison (Ace = 14)
}

export interface RoundOutcome {
  playerHand: Card[];
  botHand: Card[];
  playerFlush: FlushResult;
  botFlush: FlushResult;
  winner: "player" | "bot" | "draw";
}

export interface HCFState {
  settings: HCFSettings;
  rngSeed: number;
  totalRounds: number;
  currentRound: number;
  bankroll: number;
  betAmount: number;
  phase: "deal" | "reveal";
  playerHand: Card[];
  botHand: Card[];
  playerFlush: FlushResult | null;
  botFlush: FlushResult | null;
  lastOutcome: RoundOutcome | null;
  winner: "player" | "bot" | null;
}

export type HCFAction = { type: "deal" } | { type: "next-round" };

function rankVal(rank: number): number {
  return rank === 1 ? 14 : rank;
}

export function bestFlush(hand: Card[]): FlushResult {
  const bySuit = new Map<Suit, Card[]>();
  for (const c of hand) {
    const arr = bySuit.get(c.suit) ?? [];
    arr.push(c);
    bySuit.set(c.suit, arr);
  }
  let best: FlushResult | null = null;
  for (const [suit, cards] of bySuit) {
    const sorted = [...cards].sort((a, b) => rankVal(b.rank) - rankVal(a.rank));
    const highCard = rankVal(sorted[0]!.rank);
    if (!best || sorted.length > best.cards.length || (sorted.length === best.cards.length && highCard > best.highCard)) {
      best = { suit, cards: sorted, highCard };
    }
  }
  return best!;
}

function compareFlush(a: FlushResult, b: FlushResult): "a" | "b" | "draw" {
  if (a.cards.length !== b.cards.length) return a.cards.length > b.cards.length ? "a" : "b";
  // Compare card by card
  for (let i = 0; i < Math.max(a.cards.length, b.cards.length); i++) {
    const av = i < a.cards.length ? rankVal(a.cards[i]!.rank) : 0;
    const bv = i < b.cards.length ? rankVal(b.cards[i]!.rank) : 0;
    if (av !== bv) return av > bv ? "a" : "b";
  }
  return "draw";
}

export function initialState(seed: number, settings: HCFSettings): HCFState {
  const totalRounds = parseInt(settings.rounds, 10);
  return {
    settings,
    rngSeed: seed >>> 0,
    totalRounds,
    currentRound: 0,
    bankroll: 1000,
    betAmount: 100,
    phase: "deal",
    playerHand: [],
    botHand: [],
    playerFlush: null,
    botFlush: null,
    lastOutcome: null,
    winner: null,
  };
}

function nextSeed(seed: number): number {
  return mulberry32(seed)() * 2 ** 31 >>> 0;
}

export function reducer(state: HCFState, action: HCFAction): HCFState {
  if (action.type === "deal") {
    if (state.phase !== "deal" || state.winner !== null) return state;
    const rng = mulberry32(state.rngSeed);
    const deck = shuffle(newDeck(), rng);
    const playerHand = deck.slice(0, 7);
    const botHand = deck.slice(7, 14);
    const playerFlush = bestFlush(playerHand);
    const botFlush = bestFlush(botHand);
    const cmp = compareFlush(playerFlush, botFlush);
    const roundWinner = cmp === "a" ? "player" : cmp === "b" ? "bot" : "draw";
    const bankDelta = roundWinner === "player" ? state.betAmount : roundWinner === "bot" ? -state.betAmount : 0;
    const newBankroll = state.bankroll + bankDelta;
    const newRound = state.currentRound + 1;
    const outcome: RoundOutcome = { playerHand, botHand, playerFlush, botFlush, winner: roundWinner };
    let gameWinner: HCFState["winner"] = null;
    if (newRound >= state.totalRounds || newBankroll <= 0) {
      gameWinner = newBankroll >= 1000 ? "player" : newBankroll < 1000 ? "bot" : null;
      if (newBankroll === 1000) gameWinner = null; // draw => no winner
    }
    return {
      ...state,
      rngSeed: nextSeed(state.rngSeed),
      currentRound: newRound,
      bankroll: newBankroll,
      phase: "reveal",
      playerHand,
      botHand,
      playerFlush,
      botFlush,
      lastOutcome: outcome,
      winner: gameWinner,
    };
  }
  if (action.type === "next-round") {
    if (state.phase !== "reveal") return state;
    if (state.winner !== null) return state;
    if (state.currentRound >= state.totalRounds || state.bankroll <= 0) return state;
    return { ...state, phase: "deal", playerHand: [], botHand: [], playerFlush: null, botFlush: null };
  }
  return state;
}

export function isTerminal(state: HCFState): { score: number } | null {
  if (state.winner === null && state.currentRound < state.totalRounds && state.bankroll > 0) return null;
  if (state.currentRound === 0) return null;
  return { score: Math.max(0, state.bankroll) };
}

export { rankLabel };
