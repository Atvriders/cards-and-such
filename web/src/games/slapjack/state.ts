import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SlapjackSettings {
  botSpeed: "slow" | "medium" | "fast";
}

export type SlapjackPhase = "flipping" | "slap-window" | "done";

export interface SlapjackState {
  settings: SlapjackSettings;
  playerDeck: readonly Card[];
  botDeck: readonly Card[];
  pile: readonly Card[];
  phase: SlapjackPhase;
  winner: 0 | 1 | null;
  rngSeed: number;
  lastFlippedBy: 0 | 1 | null;
}

export type SlapjackAction =
  | { type: "flip" }
  | { type: "slap" }
  | { type: "bot-slap" };

// ── helpers ────────────────────────────────────────────────────────────────────

function isJack(c: Card): boolean {
  return c.rank === 11;
}

function topIsJack(pile: readonly Card[]): boolean {
  return pile.length > 0 && isJack(pile[pile.length - 1]!);
}

// ── initialState ───────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: SlapjackSettings): SlapjackState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    settings,
    playerDeck: deck.slice(0, 26),
    botDeck: deck.slice(26),
    pile: [],
    phase: "flipping",
    winner: null,
    rngSeed: nextSeed,
    lastFlippedBy: null,
  };
}

// ── reducer ────────────────────────────────────────────────────────────────────

export function reducer(state: SlapjackState, action: SlapjackAction): SlapjackState {
  if (state.phase === "done") return state;

  if (action.type === "flip") {
    if (state.phase !== "flipping") return state;

    const isPlayerFlip = state.lastFlippedBy !== 0;
    const flippingDeck = isPlayerFlip ? state.playerDeck : state.botDeck;

    if (flippingDeck.length === 0) {
      return { ...state, phase: "done", winner: isPlayerFlip ? 1 : 0 };
    }

    const card = flippingDeck[0]!;
    const newDeck = flippingDeck.slice(1);
    const newPile = [...state.pile, card];
    const flipper: 0 | 1 = isPlayerFlip ? 0 : 1;

    let s: SlapjackState = {
      ...state,
      playerDeck: isPlayerFlip ? newDeck : state.playerDeck,
      botDeck: isPlayerFlip ? state.botDeck : newDeck,
      pile: newPile,
      lastFlippedBy: flipper,
    };

    if (topIsJack(newPile)) {
      s = { ...s, phase: "slap-window" };
    }

    return s;
  }

  if (action.type === "slap") {
    if (state.phase !== "slap-window") return state;
    // Player slaps — player wins the pile
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const newPlayerDeck = [...state.playerDeck, ...state.pile];
    const s: SlapjackState = {
      ...state,
      playerDeck: newPlayerDeck,
      pile: [],
      phase: "flipping",
      winner: null,
      rngSeed: nextSeed,
    };
    if (state.botDeck.length === 0 && state.pile.length === 0) {
      return { ...s, phase: "done", winner: 0 };
    }
    return s;
  }

  if (action.type === "bot-slap") {
    if (state.phase !== "slap-window") return state;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const newBotDeck = [...state.botDeck, ...state.pile];
    const s: SlapjackState = {
      ...state,
      botDeck: newBotDeck,
      pile: [],
      phase: "flipping",
      winner: null,
      rngSeed: nextSeed,
    };
    if (state.playerDeck.length === 0 && state.pile.length === 0) {
      return { ...s, phase: "done", winner: 1 };
    }
    return s;
  }

  return state;
}

// ── isTerminal ─────────────────────────────────────────────────────────────────

export function isTerminal(state: SlapjackState): { score: number } | null {
  if (state.phase !== "done" || state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
