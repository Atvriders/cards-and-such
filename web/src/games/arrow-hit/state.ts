import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Arrow Hit: A moving target zones from left to right. Click at the right moment to hit the bullseye.

export interface ArrowHitSettings { arrows: "5" | "10"; }

export interface ArrowHitState {
  arrows: number;
  maxArrows: number;
  targetPos: number;   // 0-100, position of moving indicator
  direction: 1 | -1;
  speed: number;
  score: number;
  lastHit: "bull" | "hit" | "miss" | null;
  lastPoints: number;
  phase: "aiming" | "shot" | "gameover";
  rngSeed: number;
  ticks: number;
}

export type ArrowHitAction = { type: "shoot" } | { type: "tick" };

export function initialState(seed: number, settings: ArrowHitSettings): ArrowHitState {
  const rng = mulberry32(seed);
  const speed = 3 + Math.floor(rng() * 4);
  return { arrows: 0, maxArrows: parseInt(settings.arrows, 10), targetPos: 10, direction: 1, speed, score: 0, lastHit: null, lastPoints: 0, phase: "aiming", rngSeed: Math.floor(rng() * 2 ** 31), ticks: 0 };
}

export function reducer(state: ArrowHitState, action: ArrowHitAction): ArrowHitState {
  if (state.phase === "gameover") return state;
  if (action.type === "tick") {
    if (state.phase !== "aiming") return state;
    let pos = state.targetPos + state.direction * state.speed;
    let dir = state.direction;
    if (pos >= 100) { pos = 100; dir = -1; }
    if (pos <= 0) { pos = 0; dir = 1; }
    return { ...state, targetPos: pos, direction: dir, ticks: state.ticks + 1 };
  }
  if (action.type === "shoot") {
    if (state.phase !== "aiming") return state;
    const pos = state.targetPos;
    let hit: "bull" | "hit" | "miss";
    let pts: number;
    if (pos >= 45 && pos <= 55) { hit = "bull"; pts = 100; }
    else if (pos >= 30 && pos <= 70) { hit = "hit"; pts = 50; }
    else { hit = "miss"; pts = 0; }
    const newArrows = state.arrows + 1;
    const rng = mulberry32(state.rngSeed);
    const speed = 3 + Math.floor(rng() * 6);
    const phase = newArrows >= state.maxArrows ? "gameover" : "shot";
    return { ...state, arrows: newArrows, score: state.score + pts, lastHit: hit, lastPoints: pts, phase, speed, rngSeed: Math.floor(rng() * 2 ** 31) };
  }
  return state;
}

export function isTerminal(state: ArrowHitState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
