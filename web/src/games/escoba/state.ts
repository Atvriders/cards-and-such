import type { Card, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// 40-card Spanish deck — same as Scopa but captures sum to 15
const SPANISH_RANKS = [1, 2, 3, 4, 5, 6, 7, 11, 12, 13] as const;
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
export const TARGET = 15;

export function escobaDeck(): Card[] {
  const cards: Card[] = [];
  for (const s of SUITS) {
    for (const r of SPANISH_RANKS) {
      cards.push({ suit: s, rank: r as Card["rank"], id: `esc-${s}${r}` });
    }
  }
  return cards;
}

/** Face value for Escoba: J=8, Q=9, K=10, others = rank */
export function faceValue(rank: Card["rank"]): number {
  if (rank === 11) return 8;
  if (rank === 12) return 9;
  if (rank === 13) return 10;
  return rank;
}

/** Find all subsets of table cards summing to 15 */
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
  // remaining after card: 15 - fv is what we need from the table
  return findCaptureSets(table, TARGET - fv).length > 0;
}

export type EscobaPhase = "player-turn" | "bot-turn" | "done";

export interface EscobaState {
  rngSeed: number;
  playerHand: readonly Card[];
  botHand: readonly Card[];
  table: readonly Card[];
  deck: readonly Card[];
  playerCaptures: readonly Card[];
  botCaptures: readonly Card[];
  playerEscobas: number;
  botEscobas: number;
  phase: EscobaPhase;
  message: string;
  selectedCardId: string | null;
  finalScores: { player: number; bot: number } | null;
}

export type EscobaAction =
  | { type: "select"; cardId: string }
  | { type: "capture"; tableCardIds: string[] }
  | { type: "place" };

export function computeFinalScores(state: EscobaState): { player: number; bot: number } {
  let p = state.playerEscobas;
  let b = state.botEscobas;

  // Most cards
  if (state.playerCaptures.length > state.botCaptures.length) p++;
  else if (state.botCaptures.length > state.playerCaptures.length) b++;

  // Most ♦ (coins suit)
  const pCoins = state.playerCaptures.filter(c => c.suit === "♦").length;
  const bCoins = state.botCaptures.filter(c => c.suit === "♦").length;
  if (pCoins > bCoins) p++;
  else if (bCoins > pCoins) b++;

  // 7 of diamonds
  if (state.playerCaptures.some(c => c.suit === "♦" && c.rank === 7)) p++;
  else if (state.botCaptures.some(c => c.suit === "♦" && c.rank === 7)) b++;

  return { player: p, bot: b };
}

function checkDealOrEnd(state: EscobaState): EscobaState {
  if (state.playerHand.length === 0 && state.botHand.length === 0) {
    if (state.deck.length >= 6) {
      return { ...state, playerHand: [...state.deck.slice(0, 3)], botHand: [...state.deck.slice(3, 6)], deck: state.deck.slice(6) };
    }
    if (state.deck.length > 0) {
      const rem = [...state.deck];
      const half = Math.ceil(rem.length / 2);
      return { ...state, playerHand: rem.slice(0, half), botHand: rem.slice(half), deck: [] };
    }
    const finalScores = computeFinalScores(state);
    const msg = finalScores.player > finalScores.bot
      ? `Game over! You win ${finalScores.player}-${finalScores.bot}.`
      : finalScores.bot > finalScores.player
      ? `Game over! Bot wins ${finalScores.bot}-${finalScores.player}.`
      : `Game over! Tie ${finalScores.player}-${finalScores.player}.`;
    return { ...state, phase: "done", finalScores, message: msg };
  }
  return state;
}

function botPlay(state: EscobaState, rng: () => number): EscobaState {
  if (state.botHand.length === 0) return checkDealOrEnd({ ...state, phase: "player-turn" });

  const chosen = state.botHand.find(c => canCapture(c, state.table))
    ?? state.botHand.reduce((lo, c) => faceValue(c.rank) < faceValue(lo.rank) ? c : lo);

  const botHand = state.botHand.filter(c => c.id !== chosen.id);
  const needed = TARGET - faceValue(chosen.rank);
  const sets = findCaptureSets(state.table, needed);

  if (sets.length > 0) {
    const captured = sets[0]!;
    const capturedIds = new Set(captured.map(c => c.id));
    const newTable = state.table.filter(c => !capturedIds.has(c.id));
    const newBotCaptures = [...state.botCaptures, chosen, ...captured];
    const isEscoba = newTable.length === 0 && botHand.length > 0;
    const botEscobas = state.botEscobas + (isEscoba ? 1 : 0);
    const msg = isEscoba ? "Bot scored an Escoba!" : `Bot captured with ${chosen.suit}${chosen.rank}.`;
    return checkDealOrEnd({ ...state, botHand, table: newTable, botCaptures: newBotCaptures, botEscobas, message: msg, phase: "player-turn" });
  } else {
    return checkDealOrEnd({ ...state, botHand, table: [...state.table, chosen], message: `Bot placed ${chosen.suit}${chosen.rank}.`, phase: "player-turn" });
  }
}

export function reducer(state: EscobaState, action: EscobaAction): EscobaState {
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
    const needed = TARGET - faceValue(card.rank);
    const captured = state.table.filter(c => action.tableCardIds.includes(c.id));
    const sum = captured.reduce((a, c) => a + faceValue(c.rank), 0);
    if (sum !== needed) return state;

    const capturedIds = new Set(captured.map(c => c.id));
    const newTable = state.table.filter(c => !capturedIds.has(c.id));
    const newPlayerHand = state.playerHand.filter(c => c.id !== card.id);
    const newCaptures = [...state.playerCaptures, card, ...captured];
    const isEscoba = newTable.length === 0 && newPlayerHand.length > 0;
    const playerEscobas = state.playerEscobas + (isEscoba ? 1 : 0);
    const msg = isEscoba ? "Escoba! You swept the table!" : "You captured!";

    let next: EscobaState = { ...s, playerHand: newPlayerHand, table: newTable, playerCaptures: newCaptures, playerEscobas, message: msg, phase: "bot-turn" };
    next = checkDealOrEnd(next);
    if (next.phase === "bot-turn") next = botPlay(next, rng);
    return next;
  }

  if (action.type === "place") {
    const card = state.playerHand.find(c => c.id === state.selectedCardId);
    if (!card) return state;
    const newPlayerHand = state.playerHand.filter(c => c.id !== card.id);
    let next: EscobaState = { ...s, playerHand: newPlayerHand, table: [...state.table, card], message: `You placed ${card.suit}${card.rank}.`, phase: "bot-turn" };
    next = checkDealOrEnd(next);
    if (next.phase === "bot-turn") next = botPlay(next, rng);
    return next;
  }

  return state;
}

export function initialState(seed: number): EscobaState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const deck = shuffle(escobaDeck(), mulberry32(nextSeed));

  return {
    rngSeed: Math.floor(mulberry32(nextSeed)() * 2 ** 31),
    playerHand: deck.slice(0, 3),
    botHand: deck.slice(3, 6),
    table: deck.slice(6, 10),
    deck: deck.slice(10),
    playerCaptures: [],
    botCaptures: [],
    playerEscobas: 0,
    botEscobas: 0,
    phase: "player-turn",
    message: "Select a card. Capture table cards that sum to 15 with your card.",
    selectedCardId: null,
    finalScores: null,
  };
}

export function isTerminal(state: EscobaState): { score: number } | null {
  if (state.phase !== "done" || !state.finalScores) return null;
  const diff = state.finalScores.player - state.finalScores.bot;
  return { score: Math.max(0, Math.min(100, 50 + diff * 12)) };
}
