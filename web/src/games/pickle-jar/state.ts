import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Pickle Jar: A wiggle meter oscillates. Click when the meter aligns to "open" the jar.
// Multiple clicks needed - each one advances the opening progress.

export interface PickleJarSettings { jars: "3" | "5"; }

export interface PickleJarState {
  meter: number;       // 0-100 oscillating
  meterDir: 1 | -1;
  meterSpeed: number;
  openProgress: number; // 0-5 clicks needed
  jar: number;
  maxJars: number;
  score: number;
  phase: "opening" | "opened" | "gameover";
  lastClick: "good" | "bad" | null;
  rngSeed: number;
}

export type PickleJarAction = { type: "click" } | { type: "tick" } | { type: "next" };

export function initialState(seed: number, settings: PickleJarSettings): PickleJarState {
  const rng = mulberry32(seed);
  const speed = 4 + Math.floor(rng() * 6);
  return { meter: 10, meterDir: 1, meterSpeed: speed, openProgress: 0, jar: 1, maxJars: parseInt(settings.jars, 10), score: 0, phase: "opening", lastClick: null, rngSeed: Math.floor(rng() * 2 ** 31) };
}

export function reducer(state: PickleJarState, action: PickleJarAction): PickleJarState {
  if (state.phase === "gameover") return state;
  if (action.type === "tick") {
    if (state.phase !== "opening") return state;
    let m = state.meter + state.meterDir * state.meterSpeed;
    let dir = state.meterDir;
    if (m >= 100) { m = 100; dir = -1; }
    if (m <= 0) { m = 0; dir = 1; }
    return { ...state, meter: m, meterDir: dir };
  }
  if (action.type === "click") {
    if (state.phase !== "opening") return state;
    const good = state.meter >= 35 && state.meter <= 65;
    const newProgress = good ? state.openProgress + 1 : Math.max(0, state.openProgress - 1);
    const pts = good ? 20 : 0;
    if (newProgress >= 5) {
      const newJar = state.jar + 1;
      const phase = newJar > state.maxJars ? "gameover" : "opened";
      return { ...state, openProgress: newProgress, score: state.score + pts + 50, lastClick: "good", phase };
    }
    return { ...state, openProgress: newProgress, score: state.score + pts, lastClick: good ? "good" : "bad" };
  }
  if (action.type === "next") {
    if (state.phase !== "opened") return state;
    const rng = mulberry32(state.rngSeed);
    const speed = 4 + Math.floor(rng() * 7);
    return { ...state, meter: 10, meterDir: 1, meterSpeed: speed, openProgress: 0, jar: state.jar + 1, phase: "opening", lastClick: null, rngSeed: Math.floor(rng() * 2 ** 31) };
  }
  return state;
}

export function isTerminal(state: PickleJarState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
