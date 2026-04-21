import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface EgyptianRatscewSettings {
  botSpeed: "slow" | "medium" | "fast";
}

/** How many tribute cards each face card demands. */
const FACE_TRIBUTE: Partial<Record<Rank, number>> = {
  11: 1, // J = 1
  12: 2, // Q = 2
  13: 3, // K = 3
  1: 4,  // A = 4
};

function isFaceOrAce(rank: Rank): boolean {
  return rank === 11 || rank === 12 || rank === 13 || rank === 1;
}

export type ERSPhase =
  | "flipping"       // normal play
  | "tribute"        // a face card was played — next player must pay tribute
  | "slap-window"    // a double appeared; player can slap
  | "done";

export interface EgyptianRatscrewState {
  settings: EgyptianRatscewSettings;
  playerDeck: readonly Card[];
  botDeck: readonly Card[];
  pile: readonly Card[];
  phase: ERSPhase;
  winner: 0 | 1 | null;
  rngSeed: number;
  lastFlippedBy: 0 | 1 | null;
  // Tribute state
  tributeOwed: number;   // how many face-up cards the current player must still flip
  tributePayer: 0 | 1 | null;   // who is paying tribute
  tributeChallenger: 0 | 1 | null; // who played the face card
}

export type ERSAction =
  | { type: "flip" }
  | { type: "slap" }
  | { type: "bot-slap" };

// ── helpers ────────────────────────────────────────────────────────────────────

function isDouble(pile: readonly Card[]): boolean {
  if (pile.length < 2) return false;
  return pile[pile.length - 1]!.rank === pile[pile.length - 2]!.rank;
}

// ── initialState ───────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: EgyptianRatscewSettings): EgyptianRatscrewState {
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
    tributeOwed: 0,
    tributePayer: null,
    tributeChallenger: null,
  };
}

// ── reducer ────────────────────────────────────────────────────────────────────

function currentFlipper(state: EgyptianRatscrewState): 0 | 1 {
  if (state.phase === "tribute") return state.tributePayer ?? 0;
  return state.lastFlippedBy === 0 ? 1 : 0;
}

function givesPile(state: EgyptianRatscrewState, winner: 0 | 1): EgyptianRatscrewState {
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const newPDeck = winner === 0 ? [...state.playerDeck, ...state.pile] : state.playerDeck;
  const newBDeck = winner === 1 ? [...state.botDeck, ...state.pile] : state.botDeck;

  let phase: ERSPhase = "flipping";
  let gameWinner: 0 | 1 | null = null;
  if (winner === 0 && state.botDeck.length === 0) { phase = "done"; gameWinner = 0; }
  if (winner === 1 && state.playerDeck.length === 0) { phase = "done"; gameWinner = 1; }

  return {
    ...state,
    playerDeck: newPDeck,
    botDeck: newBDeck,
    pile: [],
    phase,
    winner: gameWinner,
    rngSeed: nextSeed,
    lastFlippedBy: winner, // winner leads next
    tributeOwed: 0,
    tributePayer: null,
    tributeChallenger: null,
  };
}

export function reducer(state: EgyptianRatscrewState, action: ERSAction): EgyptianRatscrewState {
  if (state.phase === "done") return state;

  if (action.type === "slap") {
    if (state.phase !== "slap-window") return state;
    return givesPile(state, 0);
  }

  if (action.type === "bot-slap") {
    if (state.phase !== "slap-window") return state;
    return givesPile(state, 1);
  }

  if (action.type === "flip") {
    if (state.phase !== "flipping" && state.phase !== "tribute") return state;

    const flipper = currentFlipper(state);
    const deck = flipper === 0 ? state.playerDeck : state.botDeck;

    if (deck.length === 0) {
      // This player is out
      return { ...state, phase: "done", winner: flipper === 0 ? 1 : 0 };
    }

    const card = deck[0]!;
    const newDeck = deck.slice(1);
    const newPile = [...state.pile, card];

    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    let s: EgyptianRatscrewState = {
      ...state,
      playerDeck: flipper === 0 ? newDeck : state.playerDeck,
      botDeck: flipper === 1 ? newDeck : state.botDeck,
      pile: newPile,
      lastFlippedBy: flipper,
      rngSeed: nextSeed,
    };

    // Check for double (slap window)
    if (isDouble(newPile)) {
      const botDelay = s.settings.botSpeed === "fast" ? 800 : s.settings.botSpeed === "slow" ? 2000 : 1200;
      return { ...s, phase: "slap-window" };
    }

    // Check if a face card was flipped
    if (isFaceOrAce(card.rank)) {
      const tribute = FACE_TRIBUTE[card.rank] ?? 1;
      const payer: 0 | 1 = flipper === 0 ? 1 : 0;
      return {
        ...s,
        phase: "tribute",
        tributeOwed: tribute,
        tributePayer: payer,
        tributeChallenger: flipper,
      };
    }

    // In tribute phase: decrement tribute counter
    if (state.phase === "tribute") {
      const newOwed = state.tributeOwed - 1;
      if (newOwed <= 0) {
        // Tribute exhausted without a face card — challenger takes the pile
        const challenger = state.tributeChallenger!;
        return givesPile({ ...s, phase: "flipping" }, challenger);
      }
      return { ...s, tributeOwed: newOwed };
    }

    return s;
  }

  return state;
}

// ── isTerminal ─────────────────────────────────────────────────────────────────

export function isTerminal(state: EgyptianRatscrewState): { score: number } | null {
  if (state.phase !== "done" || state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
