import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// California Speed:
// 4 face-up table cards (2 player-side, 2 bot-side)
// Both players flip their top card simultaneously → if any 2 adjacent table cards match rank, slap
// Winner of slap clears those 2 cards
// When table has <2 cards, refill from deck
// First to empty their deck+hand wins

export interface CalSpeedSettings {
  botReaction: "slow" | "medium" | "fast";
}

export type CalSpeedPhase = "waiting" | "slap-window" | "done";

export interface CalSpeedState {
  settings: CalSpeedSettings;
  phase: CalSpeedPhase;
  // Table: 4 slots [0,1] player side, [2,3] bot side
  table: readonly [Card | null, Card | null, Card | null, Card | null];
  // Player
  playerDeck: readonly Card[];  // face-down
  playerFlipped: Card | null;   // most recently flipped card
  // Bot
  botDeck: readonly Card[];
  botFlipped: Card | null;
  // Slap state
  matchSlots: readonly [number, number] | null; // which 2 table slots match
  winner: "player" | "bot" | null;
  rngSeed: number;
  botTickCounter: number;
}

export type CalSpeedAction =
  | { type: "flip" }          // player flips their top card
  | { type: "slap" }          // player slaps matched pair
  | { type: "bot-flip" }      // bot flips (from timer)
  | { type: "bot-slap" }      // bot slaps
  | { type: "restart" };

export function initialState(seed: number, settings: CalSpeedSettings): CalSpeedState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  const playerDeck = deck.slice(0, 24);
  const botDeck = deck.slice(24, 48).map(c => ({ ...c, id: `bot-${c.id}` }));

  const table: [Card | null, Card | null, Card | null, Card | null] = [
    deck[48] ?? null,
    deck[49] ?? null,
    deck[50] ?? null,
    deck[51] ?? null,
  ];

  return {
    settings,
    phase: "waiting",
    table,
    playerDeck,
    playerFlipped: null,
    botDeck,
    botFlipped: null,
    matchSlots: null,
    winner: null,
    rngSeed: nextSeed,
    botTickCounter: 0,
  };
}

function findMatch(table: readonly (Card | null)[]): [number, number] | null {
  // Check adjacent pairs: (0,1), (1,2), (2,3), (0,2), (1,3) — "adjacent" pairs
  const pairs: [number, number][] = [[0, 1], [1, 2], [2, 3], [0, 3]];
  for (const [a, b] of pairs) {
    const ca = table[a];
    const cb = table[b];
    if (ca && cb && ca.rank === cb.rank) return [a, b];
  }
  return null;
}

function setTable(
  table: readonly [Card | null, Card | null, Card | null, Card | null],
  idx: number,
  val: Card | null
): [Card | null, Card | null, Card | null, Card | null] {
  const out: [Card | null, Card | null, Card | null, Card | null] = [...table] as [Card | null, Card | null, Card | null, Card | null];
  out[idx] = val;
  return out;
}

function refillTable(
  table: [Card | null, Card | null, Card | null, Card | null],
  playerDeck: readonly Card[],
  botDeck: readonly Card[]
): { table: [Card | null, Card | null, Card | null, Card | null]; playerDeck: readonly Card[]; botDeck: readonly Card[] } {
  let pDeck = [...playerDeck];
  let bDeck = [...botDeck];
  let t = [...table] as [Card | null, Card | null, Card | null, Card | null];

  for (let i = 0; i < 2; i++) {
    if (!t[i] && pDeck.length > 0) { t[i] = pDeck.shift()!; }
  }
  for (let i = 2; i < 4; i++) {
    if (!t[i] && bDeck.length > 0) { t[i] = bDeck.shift()!; }
  }
  return { table: t, playerDeck: pDeck, botDeck: bDeck };
}

export function reducer(state: CalSpeedState, action: CalSpeedAction): CalSpeedState {
  if (state.phase === "done" && action.type !== "restart") return state;
  if (action.type === "restart") return initialState(state.rngSeed, state.settings);

  if (action.type === "flip") {
    if (state.phase !== "waiting") return state;
    if (state.playerDeck.length === 0) return state;
    const card = state.playerDeck[0]!;
    // Place on player table slot 0 or 1 (find first available)
    let idx = state.table[0] === null ? 0 : state.table[1] === null ? 1 : -1;
    if (idx === -1) return state; // table full on player side
    const newTable = setTable(state.table, idx, card);
    const newDeck = state.playerDeck.slice(1);
    const match = findMatch(newTable);
    const phase: CalSpeedPhase = match ? "slap-window" : "waiting";
    const playerWins = newDeck.length === 0 && !newTable[0] && !newTable[1];
    return {
      ...state,
      table: newTable,
      playerDeck: newDeck,
      playerFlipped: card,
      phase: playerWins ? "done" : phase,
      matchSlots: match,
      winner: playerWins ? "player" : null,
    };
  }

  if (action.type === "bot-flip") {
    if (state.phase !== "waiting") return state;
    if (state.botDeck.length === 0) return state;
    const card = state.botDeck[0]!;
    let idx = state.table[2] === null ? 2 : state.table[3] === null ? 3 : -1;
    if (idx === -1) return state;
    const newTable = setTable(state.table, idx, card);
    const newDeck = state.botDeck.slice(1);
    const match = findMatch(newTable);
    const phase: CalSpeedPhase = match ? "slap-window" : "waiting";
    const botWins = newDeck.length === 0 && !newTable[2] && !newTable[3];
    return {
      ...state,
      table: newTable,
      botDeck: newDeck,
      botFlipped: card,
      phase: botWins ? "done" : phase,
      matchSlots: match,
      winner: botWins ? "bot" : null,
    };
  }

  if (action.type === "slap") {
    if (state.phase !== "slap-window" || !state.matchSlots) return state;
    // Player slaps — remove matched cards from table
    let newTable = setTable(state.table, state.matchSlots[0], null);
    newTable = setTable(newTable, state.matchSlots[1], null);
    // Add cleared cards to player deck bottom? Not in this variant — they're just discarded
    const refilled = refillTable(newTable, state.playerDeck, state.botDeck);
    const match2 = findMatch(refilled.table);
    const playerWins = refilled.playerDeck.length === 0 && !refilled.table[0] && !refilled.table[1];
    return {
      ...state,
      table: refilled.table,
      playerDeck: refilled.playerDeck,
      botDeck: refilled.botDeck,
      phase: playerWins ? "done" : (match2 ? "slap-window" : "waiting"),
      matchSlots: match2,
      winner: playerWins ? "player" : null,
    };
  }

  if (action.type === "bot-slap") {
    if (state.phase !== "slap-window" || !state.matchSlots) return state;
    let newTable = setTable(state.table, state.matchSlots[0], null);
    newTable = setTable(newTable, state.matchSlots[1], null);
    const refilled = refillTable(newTable, state.playerDeck, state.botDeck);
    const match2 = findMatch(refilled.table);
    const botWins = refilled.botDeck.length === 0 && !refilled.table[2] && !refilled.table[3];
    return {
      ...state,
      table: refilled.table,
      playerDeck: refilled.playerDeck,
      botDeck: refilled.botDeck,
      phase: botWins ? "done" : (match2 ? "slap-window" : "waiting"),
      matchSlots: match2,
      winner: botWins ? "bot" : null,
    };
  }

  return state;
}

export function isTerminal(state: CalSpeedState): { score: number } | null {
  if (state.phase !== "done" || state.winner === null) return null;
  return { score: state.winner === "player" ? 100 : 0 };
}

export { findMatch };
