import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Ringer Coin: Toss a coin onto a target ring. The aim indicator moves - click when it points at the ring.

export interface RingerCoinSettings { tosses: "5" | "10"; }

export interface RingerCoinState {
  aimAngle: number;     // 0-360 degrees
  aimSpeed: number;
  tosses: number;
  maxTosses: number;
  score: number;
  phase: "aiming" | "result" | "gameover";
  lastResult: "ring" | "close" | "miss" | null;
  lastPoints: number;
  rngSeed: number;
}

export type RingerCoinAction = { type: "toss" } | { type: "tick" } | { type: "next" };

export function initialState(seed: number, settings: RingerCoinSettings): RingerCoinState {
  const rng = mulberry32(seed);
  const speed = 4 + Math.floor(rng() * 8);
  return { aimAngle: 0, aimSpeed: speed, tosses: 0, maxTosses: parseInt(settings.tosses, 10), score: 0, phase: "aiming", lastResult: null, lastPoints: 0, rngSeed: Math.floor(rng() * 2 ** 31) };
}

export function reducer(state: RingerCoinState, action: RingerCoinAction): RingerCoinState {
  if (state.phase === "gameover") return state;
  if (action.type === "tick") {
    if (state.phase !== "aiming") return state;
    return { ...state, aimAngle: (state.aimAngle + state.aimSpeed) % 360 };
  }
  if (action.type === "toss") {
    if (state.phase !== "aiming") return state;
    // Ring target: 80-100 degrees (top of circle) and 260-280 degrees (mirrored)
    const a = state.aimAngle;
    const inRing = (a >= 80 && a <= 100) || (a >= 260 && a <= 280);
    const close = !inRing && ((a >= 60 && a <= 120) || (a >= 240 && a <= 300));
    let result: "ring" | "close" | "miss";
    let pts: number;
    if (inRing) { result = "ring"; pts = 100; }
    else if (close) { result = "close"; pts = 40; }
    else { result = "miss"; pts = 0; }
    const newTosses = state.tosses + 1;
    const phase = newTosses >= state.maxTosses ? "gameover" : "result";
    return { ...state, tosses: newTosses, score: state.score + pts, lastResult: result, lastPoints: pts, phase };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    const rng = mulberry32(state.rngSeed);
    const speed = 4 + Math.floor(rng() * 9);
    return { ...state, aimAngle: 0, aimSpeed: speed, phase: "aiming", lastResult: null, rngSeed: Math.floor(rng() * 2 ** 31) };
  }
  return state;
}

export function isTerminal(state: RingerCoinState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
