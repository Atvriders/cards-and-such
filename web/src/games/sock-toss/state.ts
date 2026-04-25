import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Sock Toss: Click a button at rising height to "toss" a sock into a basket.
// A height meter rises and falls - release at the right height to land in the basket.

export interface SockTossSettings { tosses: "6" | "10"; }

export interface SockTossState {
  height: number;      // 0-100 (bouncing arc)
  rising: boolean;
  speed: number;
  basket: number;      // target height range center (40-70)
  tosses: number;
  maxTosses: number;
  score: number;
  phase: "tossing" | "result" | "gameover";
  lastLanded: "basket" | "rim" | "floor" | null;
  lastPoints: number;
  rngSeed: number;
}

export type SockTossAction = { type: "release" } | { type: "tick" } | { type: "next" };

export function initialState(seed: number, settings: SockTossSettings): SockTossState {
  const rng = mulberry32(seed);
  const speed = 3 + Math.floor(rng() * 5);
  const basket = 45 + Math.floor(rng() * 20);
  return { height: 0, rising: true, speed, basket, tosses: 0, maxTosses: parseInt(settings.tosses, 10), score: 0, phase: "tossing", lastLanded: null, lastPoints: 0, rngSeed: Math.floor(rng() * 2 ** 31) };
}

export function reducer(state: SockTossState, action: SockTossAction): SockTossState {
  if (state.phase === "gameover") return state;
  if (action.type === "tick") {
    if (state.phase !== "tossing") return state;
    let h = state.height + (state.rising ? state.speed : -state.speed);
    let rising = state.rising;
    if (h >= 100) { h = 100; rising = false; }
    if (h <= 0) { h = 0; rising = true; }
    return { ...state, height: h, rising };
  }
  if (action.type === "release") {
    if (state.phase !== "tossing") return state;
    const diff = Math.abs(state.height - state.basket);
    let landed: "basket" | "rim" | "floor";
    let pts: number;
    if (diff <= 8) { landed = "basket"; pts = 100; }
    else if (diff <= 18) { landed = "rim"; pts = 40; }
    else { landed = "floor"; pts = 0; }
    const newTosses = state.tosses + 1;
    const phase = newTosses >= state.maxTosses ? "gameover" : "result";
    return { ...state, tosses: newTosses, score: state.score + pts, lastLanded: landed, lastPoints: pts, phase };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    const rng = mulberry32(state.rngSeed);
    const speed = 3 + Math.floor(rng() * 5);
    const basket = 45 + Math.floor(rng() * 20);
    return { ...state, height: 0, rising: true, speed, basket, phase: "tossing", lastLanded: null, rngSeed: Math.floor(rng() * 2 ** 31) };
  }
  return state;
}

export function isTerminal(state: SockTossState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
