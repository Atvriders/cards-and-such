import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Balloon Burst: Balloons inflate — click to pop them at the right size for max points. Too big = burst = 0.

export interface BalloonBurstSettings { balloons: "5" | "10"; }

export interface BalloonBurstState {
  size: number;       // 0-100
  balloons: number;
  maxBalloons: number;
  score: number;
  phase: "inflating" | "popped" | "burst" | "gameover";
  lastPoints: number;
  rngSeed: number;
  speed: number;
}

export type BalloonBurstAction = { type: "pop" } | { type: "tick" } | { type: "next" };

export function initialState(seed: number, settings: BalloonBurstSettings): BalloonBurstState {
  const rng = mulberry32(seed);
  const speed = 2 + Math.floor(rng() * 3);
  return { size: 0, balloons: 0, maxBalloons: parseInt(settings.balloons, 10), score: 0, phase: "inflating", lastPoints: 0, rngSeed: Math.floor(rng() * 2 ** 31), speed };
}

export function reducer(state: BalloonBurstState, action: BalloonBurstAction): BalloonBurstState {
  if (state.phase === "gameover") return state;
  if (action.type === "tick") {
    if (state.phase !== "inflating") return state;
    const newSize = state.size + state.speed;
    if (newSize >= 100) {
      const newBalloons = state.balloons + 1;
      return { ...state, size: 100, phase: newBalloons >= state.maxBalloons ? "gameover" : "burst", balloons: newBalloons, lastPoints: 0 };
    }
    return { ...state, size: newSize };
  }
  if (action.type === "pop") {
    if (state.phase !== "inflating") return state;
    const pts = state.size >= 70 ? 100 : state.size >= 40 ? 60 : 20;
    const newBalloons = state.balloons + 1;
    const phase = newBalloons >= state.maxBalloons ? "gameover" : "popped";
    return { ...state, phase, balloons: newBalloons, score: state.score + pts, lastPoints: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "popped" && state.phase !== "burst") return state;
    const rng = mulberry32(state.rngSeed);
    const speed = 2 + Math.floor(rng() * 4);
    return { ...state, size: 0, phase: "inflating", rngSeed: Math.floor(rng() * 2 ** 31), speed };
  }
  return state;
}

export function isTerminal(state: BalloonBurstState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
