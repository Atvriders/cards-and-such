import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CasinoSettings {
  botDifficulty: "easy" | "hard";
}

export type CasinoPhase = "playing" | "done";

export interface Build {
  id: string;
  cards: Card[];    // cards in the build on the table
  value: number;    // target capture value
  owner: number;    // seat that made the build
}

export interface CasinoState {
  settings: CasinoSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];   // [player, bot]
  table: readonly Card[];                // loose cards on table
  builds: Build[];                       // builds on table
  captured: readonly (readonly Card[])[];// captured piles per seat [player, bot]
  stock: readonly Card[];
  sweeps: readonly number[];             // sweep count per seat
  phase: CasinoPhase;
  turn: number;                          // 0 = player, 1 = bot
  lastCaptureSeat: number;               // who captured last (gets remaining table at end)
  message: string;
  scores: readonly number[];
}

export type CasinoAction =
  | { type: "capture"; handCardId: string; tableCardIds: string[] }
  | { type: "build"; handCardId: string; tableCardIds: string[] }   // make/add to a build
  | { type: "trail"; handCardId: string };                           // play to table (trail)

// ── Card values ──────────────────────────────────────────────────────────────

export function numVal(rank: Rank): number {
  if (rank === 1) return 1; // Ace = 1 for summing; also can capture as 14? Simplified: 1
  if (rank >= 11) return 0; // Face cards match by rank only, no numeric value
  return rank;
}

// Check if a card is a face card
function isFace(rank: Rank): boolean {
  return rank >= 11;
}

// ── Capture validation ────────────────────────────────────────────────────────

export function canCapture(
  handCard: Card,
  tableCards: Card[],
  _builds: Build[],
): boolean {
  if (tableCards.length === 0) return false;
  if (isFace(handCard.rank)) {
    // Face cards: can only capture same-rank face cards
    return tableCards.every(tc => tc.rank === handCard.rank && isFace(tc.rank));
  }
  // Numeric: can capture if all table cards have same rank as hand card
  if (tableCards.every(tc => tc.rank === handCard.rank)) return true;
  // Or sum equals hand card value
  const sum = tableCards.reduce((s, c) => s + numVal(c.rank), 0);
  return sum === numVal(handCard.rank) && tableCards.every(tc => !isFace(tc.rank));
}

// ── Scoring ───────────────────────────────────────────────────────────────────

export function computeScores(
  captured: readonly (readonly Card[])[],
  sweeps: readonly number[],
): number[] {
  const scores: [number, number] = [0, 0];

  // Most cards = 3 pts
  const c0 = captured[0]!;
  const c1 = captured[1]!;
  if (c0.length > c1.length) scores[0] += 3;
  else if (c1.length > c0.length) scores[1] += 3;

  // Most spades = 1 pt
  const sp0 = c0.filter(card => card.suit === "♠").length;
  const sp1 = c1.filter(card => card.suit === "♠").length;
  if (sp0 > sp1) scores[0] += 1;
  else if (sp1 > sp0) scores[1] += 1;

  // Big Cassino: 10 of diamonds = 2 pts
  if (c0.some(c => c.suit === "♦" && c.rank === 10)) scores[0] += 2;
  if (c1.some(c => c.suit === "♦" && c.rank === 10)) scores[1] += 2;

  // Little Cassino: 2 of spades = 1 pt
  if (c0.some(c => c.suit === "♠" && c.rank === 2)) scores[0] += 1;
  if (c1.some(c => c.suit === "♠" && c.rank === 2)) scores[1] += 1;

  // Aces: 1 pt each
  scores[0] += c0.filter(c => c.rank === 1).length;
  scores[1] += c1.filter(c => c.rank === 1).length;

  // Sweeps: 1 pt each
  scores[0] += sweeps[0] ?? 0;
  scores[1] += sweeps[1] ?? 0;

  return scores;
}

// ── Deal ──────────────────────────────────────────────────────────────────────

function dealRound(stock: Card[], rng: () => number): {
  playerHand: Card[];
  botHand: Card[];
  table: Card[];
  remaining: Card[];
} {
  if (stock.length < 8) return { playerHand: [], botHand: [], table: [], remaining: stock };
  return {
    playerHand: stock.slice(0, 4),
    botHand: stock.slice(4, 8),
    table: stock.slice(8, 12),
    remaining: stock.slice(12),
  };
}

// ── Bot logic ─────────────────────────────────────────────────────────────────

function botTurn(state: CasinoState, rng: () => number): CasinoState {
  const hand = [...state.hands[1]!];
  if (hand.length === 0) return state;

  const table = [...state.table];

  // Try to capture
  for (const hCard of hand) {
    // Try single card match
    const singleMatch = table.filter(tc => tc.rank === hCard.rank && (isFace(hCard.rank) || hCard.rank === tc.rank));
    if (singleMatch.length > 0) {
      return applyCapture(state, 1, hCard, singleMatch, rng);
    }
    // Try sum (numeric only)
    if (!isFace(hCard.rank) && numVal(hCard.rank) > 0) {
      const hVal = numVal(hCard.rank);
      // Try pairs of table cards
      const numTable = table.filter(tc => !isFace(tc.rank));
      for (let i = 0; i < numTable.length; i++) {
        for (let j = i + 1; j < numTable.length; j++) {
          if (numVal(numTable[i]!.rank) + numVal(numTable[j]!.rank) === hVal) {
            return applyCapture(state, 1, hCard, [numTable[i]!, numTable[j]!], rng);
          }
        }
        if (numVal(numTable[i]!.rank) === hVal) {
          return applyCapture(state, 1, hCard, [numTable[i]!], rng);
        }
      }
    }
  }

  // Trail (play to table)
  const toTrail = hand[0]!;
  const newHand = hand.filter(c => c.id !== toTrail.id);
  const newTable = [...table, toTrail];

  let s: CasinoState = {
    ...state,
    hands: state.hands.map((h, i) => i === 1 ? newHand : h),
    table: newTable,
    turn: 0,
    message: "Bot trailed a card. Your turn.",
  };

  // Maybe redeal
  if (newHand.length === 0 && state.hands[0]!.length === 0) {
    s = maybeRedeal(s, rng);
  }

  return s;
}

function applyCapture(
  state: CasinoState,
  seat: number,
  handCard: Card,
  tableCards: Card[],
  _rng: () => number,
): CasinoState {
  const tableCardIds = new Set(tableCards.map(c => c.id));
  const newTable = state.table.filter(c => !tableCardIds.has(c.id));
  const _captured = [handCard, ...tableCards]; // handCard + table cards (unused var kept for reference)
  const newCaptured = state.captured.map((pile, i) =>
    i === seat ? [...pile, handCard, ...tableCards] : pile
  );

  let newSweeps = [...state.sweeps];
  if (newTable.length === 0 && state.builds.length === 0) {
    newSweeps[seat] = (newSweeps[seat] ?? 0) + 1;
  }

  const newHands = state.hands.map((h, i) =>
    i === seat ? h.filter(c => c.id !== handCard.id) : h
  );

  const nextTurn = seat === 0 ? 1 : 0;
  const msg = seat === 0 ? "You captured! Bot's turn." : "Bot captured! Your turn.";

  let s: CasinoState = {
    ...state,
    hands: newHands,
    table: newTable,
    captured: newCaptured,
    sweeps: newSweeps,
    lastCaptureSeat: seat,
    turn: nextTurn,
    message: msg,
  };

  return s;
}

function maybeRedeal(state: CasinoState, rng: () => number): CasinoState {
  if (state.stock.length === 0) {
    // Game over: last capturer gets remaining table
    const lastSeat = state.lastCaptureSeat;
    const finalCaptured = state.captured.map((pile, i) =>
      i === lastSeat ? [...pile, ...state.table] : pile
    );
    const scores = computeScores(finalCaptured, state.sweeps);
    return {
      ...state,
      captured: finalCaptured,
      table: [],
      phase: "done",
      scores,
      message: `Game over! You: ${scores[0]} pts, Bot: ${scores[1]} pts.`,
    };
  }

  if (state.stock.length >= 8) {
    const { playerHand, botHand, remaining } = dealRound(state.stock as Card[], rng);
    return {
      ...state,
      hands: [playerHand, botHand],
      stock: remaining,
      message: "New cards dealt. Your turn.",
    };
  }

  // Less than 8 remaining — deal what we can
  const half = Math.floor(state.stock.length / 2);
  const playerHand = (state.stock as Card[]).slice(0, half);
  const botHand = (state.stock as Card[]).slice(half);
  return {
    ...state,
    hands: [playerHand, botHand],
    stock: [],
    message: "Final cards dealt. Your turn.",
  };
}

// ── Reducer ──────────────────────────────────────────────────────────────────

export function reducer(state: CasinoState, action: CasinoAction): CasinoState {
  if (state.phase === "done") return state;
  if (state.turn !== 0) return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const botRng = mulberry32(nextSeed);

  const playerHand = state.hands[0]!;

  if (action.type === "capture") {
    const handCard = playerHand.find(c => c.id === action.handCardId);
    if (!handCard) return state;
    const tableCards = action.tableCardIds.map(id => state.table.find(c => c.id === id)!).filter(Boolean);
    if (!canCapture(handCard, tableCards, state.builds)) return { ...state, message: "Invalid capture!" };

    let s = applyCapture({ ...state, rngSeed: nextSeed }, 0, handCard, tableCards, botRng);

    // Bot turn
    if (s.phase !== "done" && s.turn === 1) {
      if (s.hands[1]!.length > 0) {
        s = botTurn(s, botRng);
      } else {
        s = maybeRedeal(s, botRng);
        if (s.phase !== "done") {
          s = botTurn(s, botRng);
        }
      }
    }
    return s;
  }

  if (action.type === "trail") {
    const handCard = playerHand.find(c => c.id === action.handCardId);
    if (!handCard) return state;

    const newHand = playerHand.filter(c => c.id !== handCard.id);
    const newTable = [...state.table, handCard];

    let s: CasinoState = {
      ...state,
      rngSeed: nextSeed,
      hands: state.hands.map((h, i) => i === 0 ? newHand : h),
      table: newTable,
      turn: 1,
      message: "You trailed. Bot's turn.",
    };

    // Bot turn
    if (s.hands[1]!.length > 0) {
      s = botTurn(s, botRng);
    } else {
      s = maybeRedeal(s, botRng);
      if (s.phase !== "done") {
        s = botTurn(s, botRng);
      }
    }

    // Check redeal
    if (s.hands[0]!.length === 0 && s.hands[1]!.length === 0) {
      s = maybeRedeal(s, botRng);
    }

    return s;
  }

  if (action.type === "build") {
    // Simplified: just allow build to table without complex tracking
    // Treat as trail for now (keeping the feature surface)
    const handCard = playerHand.find(c => c.id === action.handCardId);
    if (!handCard) return state;
    const newHand = playerHand.filter(c => c.id !== handCard.id);
    const newTable = [...state.table, handCard];
    let s: CasinoState = {
      ...state,
      rngSeed: nextSeed,
      hands: state.hands.map((h, i) => i === 0 ? newHand : h),
      table: newTable,
      turn: 1,
      message: "You played to table. Bot's turn.",
    };
    if (s.hands[1]!.length > 0) s = botTurn(s, botRng);
    return s;
  }

  return state;
}

// ── initialState ─────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: CasinoSettings): CasinoState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const deck = shuffle(newDeck(), dealRng);
  const playerHand = deck.slice(0, 4);
  const botHand = deck.slice(4, 8);
  const table = deck.slice(8, 12);
  const stock = deck.slice(12);

  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands: [playerHand, botHand],
    table,
    builds: [],
    captured: [[], []],
    stock,
    sweeps: [0, 0],
    phase: "playing",
    turn: 0,
    lastCaptureSeat: 0,
    message: "Play a card: capture matching table cards, or trail to the table.",
    scores: [0, 0],
  };
}

// ── isTerminal ─────────────────────────────────────────────────────────────

export function isTerminal(state: CasinoState): { score: number } | null {
  if (state.phase !== "done") return null;
  const playerScore = state.scores[0] ?? 0;
  const botScore = state.scores[1] ?? 0;
  const maxPossible = 11 + Math.max(state.sweeps[0] ?? 0, state.sweeps[1] ?? 0);
  const pct = maxPossible > 0 ? (playerScore / (playerScore + botScore)) : 0.5;
  return { score: Math.round(pct * 100) };
}
