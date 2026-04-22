import type { Card, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// 40-card Italian deck: A,2,3,4,5,6,7,J(11),Q(12),K(13)
const ITALIAN_RANKS = [1, 2, 3, 4, 5, 6, 7, 11, 12, 13] as const;
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
// "Coins" (denari) mapped to diamonds
export const COINS_SUIT: Suit = "♦";
// Seven of coins
export const SETTEBELLO_RANK = 7;

export function scopaDeck(): Card[] {
  const cards: Card[] = [];
  for (const s of SUITS) {
    for (const r of ITALIAN_RANKS) {
      cards.push({ suit: s, rank: r as Card["rank"], id: `sc-${s}${r}` });
    }
  }
  return cards;
}

/** Prime (primiera) value of a card rank */
export function primeValue(rank: Card["rank"]): number {
  if (rank === 7) return 21;
  if (rank === 6) return 18;
  if (rank === 1) return 16;
  if (rank === 5) return 15;
  if (rank === 4) return 14;
  if (rank === 3) return 13;
  if (rank === 2) return 12;
  return 10; // J, Q, K
}

/** Face value for capture matching */
export function faceValue(rank: Card["rank"]): number {
  if (rank === 11) return 8; // J maps to 8 in Italian deck context
  if (rank === 12) return 9; // Q maps to 9
  if (rank === 13) return 10; // K maps to 10 (face value for sums)
  return rank;
}

export type ScopaPhase = "player-turn" | "bot-turn" | "done";

export interface ScopaState {
  rngSeed: number;
  playerHand: readonly Card[];
  botHand: readonly Card[];
  table: readonly Card[];
  deck: readonly Card[];
  playerCaptures: readonly Card[];
  botCaptures: readonly Card[];
  playerScopeCount: number;
  botScopeCount: number;
  phase: ScopaPhase;
  message: string;
  selectedCardId: string | null;
  finalScores: { player: number; bot: number } | null;
}

export type ScopaAction =
  | { type: "select"; cardId: string }
  | { type: "capture"; tableCardIds: string[] }
  | { type: "place" };

/** Find all subsets of table cards summing to target face value */
export function findCaptureSets(table: readonly Card[], targetFv: number): Card[][] {
  const result: Card[][] = [];
  const n = table.length;
  for (let mask = 1; mask < (1 << n); mask++) {
    const subset: Card[] = [];
    let sum = 0;
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        subset.push(table[i]!);
        sum += faceValue(table[i]!.rank);
      }
    }
    if (sum === targetFv) result.push(subset);
  }
  return result;
}

export function canCapture(card: Card, table: readonly Card[]): boolean {
  const fv = faceValue(card.rank);
  return findCaptureSets(table, fv).length > 0;
}

function scoreCaptures(captures: readonly Card[], scopeCount: number): number {
  let score = scopeCount;
  // Most cards
  // (handled comparatively)
  // Most coins
  // settebello
  if (captures.some(c => c.suit === COINS_SUIT && c.rank === SETTEBELLO_RANK)) score += 1;
  return score;
}

export function computeFinalScores(state: ScopaState): { player: number; bot: number } {
  let p = state.playerScopeCount;
  let b = state.botScopeCount;

  // Most cards
  if (state.playerCaptures.length > state.botCaptures.length) p++;
  else if (state.botCaptures.length > state.playerCaptures.length) b++;

  // Most coins
  const pCoins = state.playerCaptures.filter(c => c.suit === COINS_SUIT).length;
  const bCoins = state.botCaptures.filter(c => c.suit === COINS_SUIT).length;
  if (pCoins > bCoins) p++;
  else if (bCoins > pCoins) b++;

  // Settebello (7 of coins)
  if (state.playerCaptures.some(c => c.suit === COINS_SUIT && c.rank === SETTEBELLO_RANK)) p++;
  else if (state.botCaptures.some(c => c.suit === COINS_SUIT && c.rank === SETTEBELLO_RANK)) b++;

  // Prime: best card per suit
  const primeScore = (captures: readonly Card[]) => {
    let total = 0;
    for (const suit of SUITS) {
      const suitCards = captures.filter(c => c.suit === suit);
      if (suitCards.length > 0) {
        total += Math.max(...suitCards.map(c => primeValue(c.rank)));
      }
    }
    return total;
  };
  const pp = primeScore(state.playerCaptures);
  const bp = primeScore(state.botCaptures);
  if (pp > bp) p++;
  else if (bp > pp) b++;

  return { player: p, bot: b };
}

function botPlay(state: ScopaState, rng: () => number): ScopaState {
  if (state.botHand.length === 0) {
    // Deal new hands if deck has cards
    if (state.deck.length >= 6) {
      return { ...state, botHand: [...state.deck.slice(3, 6)], playerHand: [...state.deck.slice(0, 3)], deck: state.deck.slice(6), phase: "player-turn" };
    }
    if (state.deck.length >= 3) {
      return { ...state, botHand: [...state.deck.slice(0, 3)], deck: state.deck.slice(3), phase: "player-turn" };
    }
    // Game over
    const finalScores = computeFinalScores(state);
    const msg = finalScores.player > finalScores.bot
      ? `Game over! You win ${finalScores.player}-${finalScores.bot}`
      : finalScores.bot > finalScores.player
      ? `Game over! Bot wins ${finalScores.bot}-${finalScores.player}`
      : `Game over! Tie ${finalScores.player}-${finalScores.bot}`;
    return { ...state, phase: "done", finalScores, message: msg };
  }

  // Bot picks first card that can capture; else plays lowest
  let chosen = state.botHand.find(c => canCapture(c, state.table));
  if (!chosen) chosen = state.botHand.reduce((lo, c) => faceValue(c.rank) < faceValue(lo.rank) ? c : lo);

  const botHand = state.botHand.filter(c => c.id !== chosen!.id);
  const fv = faceValue(chosen.rank);
  const sets = findCaptureSets(state.table, fv);

  if (sets.length > 0) {
    // Pick first capture set
    const captured = sets[0]!;
    const capturedIds = new Set(captured.map(c => c.id));
    const newTable = state.table.filter(c => !capturedIds.has(c.id));
    const newBotCaptures = [...state.botCaptures, chosen, ...captured];
    const isScopa = newTable.length === 0 && botHand.length > 0;
    const scopeCount = state.botScopeCount + (isScopa ? 1 : 0);
    const msg = isScopa ? "Bot scored a Scopa!" : `Bot captured with ${chosen.suit}${chosen.rank}.`;
    let s: ScopaState = { ...state, botHand, table: newTable, botCaptures: newBotCaptures, botScopeCount: scopeCount, message: msg };
    return checkDealOrEnd({ ...s, phase: "player-turn" });
  } else {
    const msg = `Bot placed ${chosen.suit}${chosen.rank} on table.`;
    return checkDealOrEnd({ ...state, botHand, table: [...state.table, chosen], message: msg, phase: "player-turn" });
  }
}

function checkDealOrEnd(state: ScopaState): ScopaState {
  if (state.playerHand.length === 0 && state.botHand.length === 0) {
    if (state.deck.length >= 6) {
      return { ...state, playerHand: [...state.deck.slice(0, 3)], botHand: [...state.deck.slice(3, 6)], deck: state.deck.slice(6) };
    }
    if (state.deck.length > 0) {
      // Deal remaining unevenly
      const remaining = [...state.deck];
      return { ...state, playerHand: remaining.slice(0, Math.ceil(remaining.length / 2)), botHand: remaining.slice(Math.ceil(remaining.length / 2)), deck: [] };
    }
    // truly done
    const finalScores = computeFinalScores(state);
    const msg = finalScores.player > finalScores.bot
      ? `Game over! You win ${finalScores.player}-${finalScores.bot}`
      : finalScores.bot > finalScores.player
      ? `Game over! Bot wins ${finalScores.bot}-${finalScores.player}`
      : `Game over! Tie ${finalScores.player}-${finalScores.bot}`;
    return { ...state, phase: "done", finalScores, message: msg };
  }
  return state;
}

export function reducer(state: ScopaState, action: ScopaAction): ScopaState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const s = { ...state, rngSeed: nextSeed, selectedCardId: null };

  if (action.type === "select") {
    return { ...state, selectedCardId: action.cardId };
  }

  if (action.type === "capture") {
    const card = state.playerHand.find(c => c.id === state.selectedCardId);
    if (!card) return state;
    const captured = state.table.filter(c => action.tableCardIds.includes(c.id));
    const fv = faceValue(card.rank);
    const sum = captured.reduce((a, c) => a + faceValue(c.rank), 0);
    if (sum !== fv) return state;

    const capturedIds = new Set(captured.map(c => c.id));
    const newTable = state.table.filter(c => !capturedIds.has(c.id));
    const newPlayerHand = state.playerHand.filter(c => c.id !== card.id);
    const newCaptures = [...state.playerCaptures, card, ...captured];
    const isScopa = newTable.length === 0 && newPlayerHand.length > 0;
    const scopeCount = state.playerScopeCount + (isScopa ? 1 : 0);
    const msg = isScopa ? "Scopa! You swept the table!" : "You captured!";

    let next: ScopaState = { ...s, playerHand: newPlayerHand, table: newTable, playerCaptures: newCaptures, playerScopeCount: scopeCount, message: msg, phase: "bot-turn" };
    next = checkDealOrEnd(next);
    if (next.phase === "bot-turn") {
      next = botPlay(next, rng);
    }
    return next;
  }

  if (action.type === "place") {
    const card = state.playerHand.find(c => c.id === state.selectedCardId);
    if (!card) return state;
    const newPlayerHand = state.playerHand.filter(c => c.id !== card.id);
    let next: ScopaState = { ...s, playerHand: newPlayerHand, table: [...state.table, card], message: `You placed ${card.suit}${card.rank} on the table.`, phase: "bot-turn" };
    next = checkDealOrEnd(next);
    if (next.phase === "bot-turn") {
      next = botPlay(next, rng);
    }
    return next;
  }

  return state;
}

export function initialState(seed: number): ScopaState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const deck = shuffle(scopaDeck(), mulberry32(nextSeed));

  return {
    rngSeed: Math.floor(mulberry32(nextSeed)() * 2 ** 31),
    playerHand: deck.slice(0, 3),
    botHand: deck.slice(3, 6),
    table: deck.slice(6, 10),
    deck: deck.slice(10),
    playerCaptures: [],
    botCaptures: [],
    playerScopeCount: 0,
    botScopeCount: 0,
    phase: "player-turn",
    message: "Select a card to play. Capture matching table cards or place it.",
    selectedCardId: null,
    finalScores: null,
  };
}

export function isTerminal(state: ScopaState): { score: number } | null {
  if (state.phase !== "done" || !state.finalScores) return null;
  const diff = state.finalScores.player - state.finalScores.bot;
  return { score: Math.max(0, Math.min(100, 50 + diff * 12)) };
}
