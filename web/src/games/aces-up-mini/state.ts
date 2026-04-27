import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Aces Up Mini: 12 draws. Each draw flips a card.
// Aces are worth +50; everything else is +0.

export const TOTAL_DRAWS = 12;

export interface AcesUpMiniSettings { dummy: boolean; }

export interface AcesUpMiniState {
  rngSeed: number;
  draw: number;
  card: number | null;
  acesFound: number;
  score: number;
  phase: "drawing" | "shown" | "done";
  lastWasAce: boolean;
}

export type AcesUpMiniAction = { type: "draw" } | { type: "next" };

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }
export function isAce(c: number): boolean { return c % 13 === 12; }

export function initialState(seed: number, _settings: AcesUpMiniSettings): AcesUpMiniState {
  return { rngSeed: seed, draw: 1, card: null, acesFound: 0, score: 0, phase: "drawing", lastWasAce: false };
}

export function reducer(state: AcesUpMiniState, action: AcesUpMiniAction): AcesUpMiniState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    if (state.phase !== "drawing") return state;
    const rng = mulberry32(state.rngSeed);
    const c = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const ace = isAce(c);
    const pts = ace ? 50 : 0;
    const isLast = state.draw >= TOTAL_DRAWS;
    return {
      ...state,
      rngSeed: nextSeed,
      card: c,
      acesFound: state.acesFound + (ace ? 1 : 0),
      score: state.score + pts,
      phase: isLast ? "done" : "shown",
      lastWasAce: ace,
    };
  }
  if (action.type === "next") {
    if (state.phase !== "shown") return state;
    return { ...state, draw: state.draw + 1, card: null, phase: "drawing", lastWasAce: false };
  }
  return state;
}

export function isTerminal(state: AcesUpMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
