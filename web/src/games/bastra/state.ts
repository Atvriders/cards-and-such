import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Bastra (Turkish Casino)
// 2 players: capture table cards by matching rank or summing.
// "Bastra" = capturing all table cards = 10 bonus points.
// Simplified: single deal (4 cards each, 4 on table).

export interface BastraSettings {
  placeholder: "none";
}

export type BastraPhase = "playing" | "done";

export interface BastraState {
  settings: BastraSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];   // [player, bot]
  table: readonly Card[];
  stock: readonly Card[];
  captured: readonly (readonly Card[])[];
  bastras: readonly number[];            // bastra count per seat
  phase: BastraPhase;
  turn: number;
  scores: readonly number[];
  message: string;
  lastCapture: number;                   // seat that last captured
}

export type BastraAction =
  | { type: "capture"; handCardId: string; tableCardIds: string[] }
  | { type: "trail"; handCardId: string };

// ── helpers ──────────────────────────────────────────────────────────────────

export function canCapture(handCard: Card, tableCards: Card[]): boolean {
  if (tableCards.length === 0) return false;
  // Same rank match
  if (tableCards.every(tc => tc.rank === handCard.rank)) return true;
  // Sum match (Ace = 1, face = 10 for sum)
  const faceVal = (r: number) => r >= 11 ? 10 : r;
  if (tableCards.some(tc => tc.rank >= 11)) return false; // no face in sum groups
  const sum = tableCards.reduce((s, c) => s + faceVal(c.rank), 0);
  return sum === faceVal(handCard.rank) && tableCards.length > 1;
}

function computeScores(
  captured: readonly (readonly Card[])[],
  bastras: readonly number[],
): number[] {
  const scores: number[] = [0, 0];
  for (let i = 0; i < 2; i++) {
    const pile = captured[i]!;
    // Most cards = 3 pts
    // Aces = 1 pt each
    // 2 of clubs = 2 pts; 10 of diamonds = 3 pts
    // Bastra = 10 pts each
    scores[i]! += pile.filter(c => c.rank === 1).length;
    if (pile.some(c => c.rank === 2 && c.suit === "♣")) scores[i]! += 2;
    if (pile.some(c => c.rank === 10 && c.suit === "♦")) scores[i]! += 3;
    scores[i]! += (bastras[i] ?? 0) * 10;
  }
  // Most cards bonus
  if (captured[0]!.length > captured[1]!.length) scores[0]! += 3;
  else if (captured[1]!.length > captured[0]!.length) scores[1]! += 3;
  return scores;
}

// ── bot logic ─────────────────────────────────────────────────────────────────

function botTurn(state: BastraState, rng: () => number): BastraState {
  void rng;
  const hand = [...state.hands[1]!];
  if (hand.length === 0) return { ...state, turn: 0 };

  // Try to capture all table cards (Bastra) first
  for (const hCard of hand) {
    if (state.table.length > 0 && canCapture(hCard, [...state.table])) {
      return applyCapture(state, 1, hCard, [...state.table]);
    }
    // Single card match
    for (const tc of state.table) {
      if (canCapture(hCard, [tc])) {
        return applyCapture(state, 1, hCard, [tc]);
      }
    }
    // Sum groups
    const numTable = state.table.filter(c => c.rank < 11);
    for (let i = 0; i < numTable.length; i++) {
      for (let j = i + 1; j < numTable.length; j++) {
        if (canCapture(hCard, [numTable[i]!, numTable[j]!])) {
          return applyCapture(state, 1, hCard, [numTable[i]!, numTable[j]!]);
        }
      }
    }
  }
  // Trail lowest card
  const toTrail = hand.reduce((lo, c) => c.rank < lo.rank ? c : lo);
  const newHand = hand.filter(c => c.id !== toTrail.id);
  return {
    ...state,
    hands: state.hands.map((h, i) => i === 1 ? newHand : h),
    table: [...state.table, toTrail],
    turn: 0,
    message: "Bot trailed. Your turn.",
  };
}

function applyCapture(state: BastraState, seat: number, handCard: Card, tableCards: Card[]): BastraState {
  const tableIds = new Set(tableCards.map(c => c.id));
  const newTable = state.table.filter(c => !tableIds.has(c.id));
  const newCaptured = state.captured.map((pile, i) =>
    i === seat ? [...pile, handCard, ...tableCards] : pile
  );
  const newHands = state.hands.map((h, i) => i === seat ? h.filter(c => c.id !== handCard.id) : h);
  const isBastra = newTable.length === 0 && tableCards.length === state.table.length;
  const newBastras = state.bastras.map((b, i) => i === seat ? b + (isBastra ? 1 : 0) : b);
  const nextTurn = seat === 0 ? 1 : 0;

  let s: BastraState = {
    ...state,
    hands: newHands,
    table: newTable,
    captured: newCaptured,
    bastras: newBastras,
    lastCapture: seat,
    turn: nextTurn,
    message: isBastra
      ? `${seat === 0 ? "You" : "Bot"} scored a Bastra! (+10 pts)`
      : `${seat === 0 ? "You" : "Bot"} captured!`,
  };

  // Redeal if both hands empty
  if (s.hands[0]!.length === 0 && s.hands[1]!.length === 0) {
    if (s.stock.length >= 8) {
      s = {
        ...s,
        hands: [s.stock.slice(0, 4), s.stock.slice(4, 8)],
        stock: s.stock.slice(8),
        message: "New cards dealt.",
      };
    } else if (s.stock.length > 0) {
      const half = Math.ceil(s.stock.length / 2);
      s = {
        ...s,
        hands: [s.stock.slice(0, half), s.stock.slice(half)],
        stock: [],
      };
    } else {
      // Game over
      const finalCaptured = s.captured.map((pile, i) =>
        i === s.lastCapture ? [...pile, ...s.table] : pile
      );
      const scores = computeScores(finalCaptured, s.bastras);
      s = {
        ...s,
        captured: finalCaptured,
        table: [],
        phase: "done",
        scores,
        message: `Game over! You: ${scores[0]} pts, Bot: ${scores[1]} pts.`,
      };
    }
  }

  return s;
}

// ── reducer ───────────────────────────────────────────────────────────────────

export function reducer(state: BastraState, action: BastraAction): BastraState {
  if (state.phase === "done") return state;
  if (state.turn !== 0) return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const botRng = mulberry32(nextSeed);
  let s: BastraState = { ...state, rngSeed: nextSeed };

  if (action.type === "capture") {
    const handCard = s.hands[0]!.find(c => c.id === action.handCardId);
    if (!handCard) return state;
    const tableCards = action.tableCardIds.map(id => s.table.find(c => c.id === id)!).filter(Boolean);
    if (!canCapture(handCard, tableCards)) return { ...state, message: "Invalid capture!" };
    s = applyCapture(s, 0, handCard, tableCards);
  } else if (action.type === "trail") {
    const handCard = s.hands[0]!.find(c => c.id === action.handCardId);
    if (!handCard) return state;
    s = {
      ...s,
      hands: s.hands.map((h, i) => i === 0 ? h.filter(c => c.id !== handCard.id) : h),
      table: [...s.table, handCard],
      turn: 1,
      message: "You trailed. Bot's turn.",
    };
  } else {
    return state;
  }

  // Bot turn
  if (s.phase !== "done" && s.turn === 1) {
    s = botTurn(s, botRng);
  }

  return s;
}

// ── initialState ──────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: BastraSettings): BastraState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const deck = shuffle(newDeck(), dealRng);

  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands: [deck.slice(0, 4), deck.slice(4, 8)],
    table: deck.slice(8, 12),
    stock: deck.slice(12),
    captured: [[], []],
    bastras: [0, 0],
    phase: "playing",
    turn: 0,
    scores: [0, 0],
    message: "Select a card then table cards to capture, or trail.",
    lastCapture: 0,
  };
}

// ── isTerminal ────────────────────────────────────────────────────────────────

export function isTerminal(state: BastraState): { score: number } | null {
  if (state.phase !== "done") return null;
  const p = state.scores[0]!;
  const b = state.scores[1]!;
  if (p > b) return { score: 100 };
  if (p < b) return { score: 0 };
  return { score: 50 };
}
