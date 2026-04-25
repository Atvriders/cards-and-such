import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Snowball Throw: Click a moving target to hit it with a snowball. Target moves faster each round.

export interface SnowballThrowSettings { throws: "8" | "12"; }

export interface SnowballThrowState {
  targetX: number;     // 0-100 position
  targetY: number;     // 0-100 position
  dx: number;          // velocity
  dy: number;
  throws: number;
  maxThrows: number;
  score: number;
  phase: "throwing" | "result" | "gameover";
  lastHit: boolean | null;
  lastPoints: number;
  rngSeed: number;
}

export type SnowballThrowAction = { type: "throw"; x: number; y: number } | { type: "tick" } | { type: "next" };

export function initialState(seed: number, settings: SnowballThrowSettings): SnowballThrowState {
  const rng = mulberry32(seed);
  const dx = (rng() > 0.5 ? 1 : -1) * (2 + rng() * 3);
  const dy = (rng() > 0.5 ? 1 : -1) * (2 + rng() * 3);
  return { targetX: 50, targetY: 50, dx, dy, throws: 0, maxThrows: parseInt(settings.throws, 10), score: 0, phase: "throwing", lastHit: null, lastPoints: 0, rngSeed: Math.floor(rng() * 2 ** 31) };
}

export function reducer(state: SnowballThrowState, action: SnowballThrowAction): SnowballThrowState {
  if (state.phase === "gameover") return state;
  if (action.type === "tick") {
    if (state.phase !== "throwing") return state;
    let { targetX, targetY, dx, dy } = state;
    targetX += dx;
    targetY += dy;
    if (targetX <= 5 || targetX >= 95) { dx = -dx; targetX = Math.max(5, Math.min(95, targetX)); }
    if (targetY <= 5 || targetY >= 95) { dy = -dy; targetY = Math.max(5, Math.min(95, targetY)); }
    return { ...state, targetX, targetY, dx, dy };
  }
  if (action.type === "throw") {
    if (state.phase !== "throwing") return state;
    const dist = Math.sqrt((action.x - state.targetX) ** 2 + (action.y - state.targetY) ** 2);
    const hit = dist <= 12;
    const close = !hit && dist <= 24;
    const pts = hit ? 100 : close ? 40 : 0;
    const newThrows = state.throws + 1;
    const phase = newThrows >= state.maxThrows ? "gameover" : "result";
    return { ...state, throws: newThrows, score: state.score + pts, lastHit: hit, lastPoints: pts, phase };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    const rng = mulberry32(state.rngSeed);
    const dx = (rng() > 0.5 ? 1 : -1) * (2 + rng() * 4);
    const dy = (rng() > 0.5 ? 1 : -1) * (2 + rng() * 4);
    return { ...state, targetX: 50, targetY: 50, dx, dy, phase: "throwing", lastHit: null, rngSeed: Math.floor(rng() * 2 ** 31) };
  }
  return state;
}

export function isTerminal(state: SnowballThrowState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
