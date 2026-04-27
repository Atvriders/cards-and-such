import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Clock: 12 hours. Each round you draw a card and try to "match" the hour.
// Hour 1->A, 2..10 -> 2..10, 11 -> J, 12 -> Q. King is always a miss.

export const TOTAL_DRAWS = 12;
export const POINTS_PER_HIT = 60;

export interface CardClockSettings { dummy: boolean; }

export interface CardClockState {
  rngSeed: number;
  draw: number;
  card: number | null;
  hits: number;
  score: number;
  phase: "drawing" | "shown" | "done";
  lastWasHit: boolean;
  currentHour: number;
}

export type CardClockAction = { type: "draw" } | { type: "next" };

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }
export function rankIndex(c: number): number { return c % 13; }

export function hourToRankIndex(hour: number): number {
  if (hour === 1) return 12;
  if (hour >= 2 && hour <= 10) return hour - 2;
  if (hour === 11) return 9;
  if (hour === 12) return 10;
  return -1;
}

export function isHit(c: number, hour: number): boolean {
  return rankIndex(c) === hourToRankIndex(hour);
}

export function initialState(seed: number, _settings: CardClockSettings): CardClockState {
  return { rngSeed: seed, draw: 1, card: null, hits: 0, score: 0, phase: "drawing", lastWasHit: false, currentHour: 1 };
}

export function reducer(state: CardClockState, action: CardClockAction): CardClockState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    if (state.phase !== "drawing") return state;
    const rng = mulberry32(state.rngSeed);
    const c = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const hit = isHit(c, state.currentHour);
    const pts = hit ? POINTS_PER_HIT : 0;
    const isLast = state.draw >= TOTAL_DRAWS;
    return {
      ...state,
      rngSeed: nextSeed,
      card: c,
      hits: state.hits + (hit ? 1 : 0),
      score: state.score + pts,
      phase: isLast ? "done" : "shown",
      lastWasHit: hit,
    };
  }
  if (action.type === "next") {
    if (state.phase !== "shown") return state;
    return { ...state, draw: state.draw + 1, currentHour: state.currentHour + 1, card: null, phase: "drawing", lastWasHit: false };
  }
  return state;
}

export function isTerminal(state: CardClockState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
