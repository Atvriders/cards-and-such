import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SnapSettings {
  botSpeed: "slow" | "medium" | "fast";
}

export type SnapPhase = "flipping" | "snap-window" | "done";

export interface SnapState {
  settings: SnapSettings;
  playerDeck: readonly Card[];
  botDeck: readonly Card[];
  pile: readonly Card[];
  phase: SnapPhase;
  winner: 0 | 1 | null;
  rngSeed: number;
  lastFlippedBy: 0 | 1 | null;
  snapWindowFlipsLeft: number; // how many more flips before bot auto-snaps
}

export type SnapAction =
  | { type: "flip" }
  | { type: "snap" }
  | { type: "bot-snap" };

// ── helpers ────────────────────────────────────────────────────────────────────

function topRank(pile: readonly Card[]): number | null {
  return pile.length > 0 ? pile[pile.length - 1]!.rank : null;
}

function prevRank(pile: readonly Card[]): number | null {
  return pile.length >= 2 ? pile[pile.length - 2]!.rank : null;
}

function isSnap(pile: readonly Card[]): boolean {
  const top = topRank(pile);
  const prev = prevRank(pile);
  return top !== null && prev !== null && top === prev;
}

function botSnapWindow(settings: SnapSettings, rng: () => number): number {
  // Returns 0 or 1: number of extra flips before bot auto-snaps
  // fast: 0 (bot snaps immediately), medium: 0 or 1, slow: 1
  if (settings.botSpeed === "fast") return 0;
  if (settings.botSpeed === "slow") return 1;
  return Math.floor(rng() * 2); // 0 or 1
}

// ── initialState ───────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: SnapSettings): SnapState {
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
    snapWindowFlipsLeft: 0,
  };
}

// ── reducer ────────────────────────────────────────────────────────────────────

export function reducer(state: SnapState, action: SnapAction): SnapState {
  if (state.phase === "done") return state;

  if (action.type === "flip") {
    if (state.phase !== "flipping") return state;

    // Alternate flip: player flips then bot flips
    const isPlayerFlip = state.lastFlippedBy !== 0;
    const flippingDeck = isPlayerFlip ? state.playerDeck : state.botDeck;

    if (flippingDeck.length === 0) {
      // The flipper has no cards — the other player wins
      return {
        ...state,
        phase: "done",
        winner: isPlayerFlip ? 1 : 0,
      };
    }

    const card = flippingDeck[0]!;
    const newDeck = flippingDeck.slice(1);
    const newPile = [...state.pile, card];
    const flipper = isPlayerFlip ? 0 : 1;

    let s: SnapState = {
      ...state,
      playerDeck: isPlayerFlip ? newDeck : state.playerDeck,
      botDeck: isPlayerFlip ? state.botDeck : newDeck,
      pile: newPile,
      lastFlippedBy: flipper,
    };

    // Check for snap condition
    if (isSnap(newPile)) {
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const window = botSnapWindow(state.settings, rng);
      s = {
        ...s,
        phase: "snap-window",
        snapWindowFlipsLeft: window,
        rngSeed: nextSeed,
      };
    }

    return s;
  }

  if (action.type === "snap") {
    if (state.phase !== "snap-window") return state;
    // Player snaps — player wins the pile
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const newPlayerDeck = [...state.playerDeck, ...state.pile];
    const s: SnapState = {
      ...state,
      playerDeck: newPlayerDeck,
      pile: [],
      phase: "flipping",
      winner: null,
      rngSeed: nextSeed,
      snapWindowFlipsLeft: 0,
    };
    // Check win
    if (state.botDeck.length === 0) {
      return { ...s, phase: "done", winner: 0 };
    }
    return s;
  }

  if (action.type === "bot-snap") {
    if (state.phase !== "snap-window") return state;
    // Bot snaps — bot wins the pile
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const newBotDeck = [...state.botDeck, ...state.pile];
    const s: SnapState = {
      ...state,
      botDeck: newBotDeck,
      pile: [],
      phase: "flipping",
      winner: null,
      rngSeed: nextSeed,
      snapWindowFlipsLeft: 0,
    };
    if (state.playerDeck.length === 0) {
      return { ...s, phase: "done", winner: 1 };
    }
    return s;
  }

  return state;
}

// ── isTerminal ─────────────────────────────────────────────────────────────────

export function isTerminal(state: SnapState): { score: number } | null {
  if (state.phase !== "done" || state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
