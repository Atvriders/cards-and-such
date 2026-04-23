import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Quick Tick — reflex game.
// Clock ticks every second. Player clicks at the right moment.
// Score: within ±50ms = +10, within ±150ms = +5, else 0.
// 20 ticks per round.

export const TOTAL_TICKS = 20;
export const HIT_PERFECT = 50;   // ms
export const HIT_GOOD = 150;     // ms
export const POINTS_PERFECT = 10;
export const POINTS_GOOD = 5;

export interface QuickTickSettings { dummy: boolean }

export interface QuickTickState {
  settings: QuickTickSettings;
  rngSeed: number;
  tickOffsets: readonly number[];  // random offset per tick (0-1000ms) for tick timing
  tickNumber: number;              // 0-based index of current tick
  score: number;
  lastTiming: number | null;       // ms delta of last click
  lastPoints: number | null;
  phase: "waiting" | "ticking" | "done";
  tickStartedAt: number | null;    // timestamp when current tick started (client-side)
}

export type QuickTickAction =
  | { type: "start" }
  | { type: "tap"; timingMs: number }  // player provides their timing delta from tick moment
  | { type: "advance" }                // advance to next tick
  | { type: "newGame" };

export function initialState(seed: number, settings: QuickTickSettings): QuickTickState {
  const rng = mulberry32(seed);
  const tickOffsets = Array.from({ length: TOTAL_TICKS }, () => Math.floor(rng() * 1000));
  return {
    settings,
    rngSeed: seed,
    tickOffsets,
    tickNumber: 0,
    score: 0,
    lastTiming: null,
    lastPoints: null,
    phase: "waiting",
    tickStartedAt: null,
  };
}

export function reducer(state: QuickTickState, action: QuickTickAction): QuickTickState {
  if (action.type === "newGame") return initialState(state.rngSeed + 1, state.settings);

  if (action.type === "start" && state.phase === "waiting") {
    return { ...state, phase: "ticking", tickStartedAt: Date.now() };
  }

  if (action.type === "tap" && state.phase === "ticking") {
    const abs = Math.abs(action.timingMs);
    const points = abs <= HIT_PERFECT ? POINTS_PERFECT : abs <= HIT_GOOD ? POINTS_GOOD : 0;
    const newScore = state.score + points;
    const nextTick = state.tickNumber + 1;
    const done = nextTick >= TOTAL_TICKS;
    return {
      ...state,
      score: newScore,
      lastTiming: action.timingMs,
      lastPoints: points,
      tickNumber: nextTick,
      phase: done ? "done" : "ticking",
      tickStartedAt: done ? null : Date.now(),
    };
  }

  if (action.type === "advance" && state.phase === "ticking") {
    // Missed the tick (no tap) — score 0, advance
    const nextTick = state.tickNumber + 1;
    const done = nextTick >= TOTAL_TICKS;
    return {
      ...state,
      lastTiming: null,
      lastPoints: 0,
      tickNumber: nextTick,
      phase: done ? "done" : "ticking",
      tickStartedAt: done ? null : Date.now(),
    };
  }

  return state;
}

export function isTerminal(state: QuickTickState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score };
}
