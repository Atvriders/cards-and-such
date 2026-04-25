import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Sword Slice: Objects appear at random positions. Click/tap to slice them.
// Timed game: 30 seconds. Each slice = points. Miss = -2 pts.

export interface SwordSliceSettings {
  duration: "20" | "30" | "45";
}

export interface SliceTarget {
  id: number;
  x: number;     // 0-100
  y: number;     // 0-100
  size: number;  // 30-60
  points: number;
  active: boolean;
}

export interface SwordSliceState {
  targets: SliceTarget[];
  score: number;
  sliced: number;
  misses: number;
  timeLeft: number;
  maxTime: number;
  nextId: number;
  phase: "playing" | "gameover";
  rngSeed: number;
}

export type SwordSliceAction =
  | { type: "slice"; id: number }
  | { type: "miss" }
  | { type: "tick" }
  | { type: "spawn" };

export function initialState(seed: number, settings: SwordSliceSettings): SwordSliceState {
  const maxTime = parseInt(settings.duration, 10);
  const rng = mulberry32(seed);
  const firstTarget: SliceTarget = {
    id: 0, x: Math.floor(rng() * 80) + 10, y: Math.floor(rng() * 70) + 10,
    size: Math.floor(rng() * 30) + 30, points: 10, active: true,
  };
  return { targets: [firstTarget], score: 0, sliced: 0, misses: 0, timeLeft: maxTime, maxTime, nextId: 1, phase: "playing", rngSeed: Math.floor(rng() * 2 ** 31) };
}

export function reducer(state: SwordSliceState, action: SwordSliceAction): SwordSliceState {
  if (state.phase === "gameover") return state;
  if (action.type === "slice") {
    const target = state.targets.find(t => t.id === action.id && t.active);
    if (!target) return state;
    return { ...state, targets: state.targets.filter(t => t.id !== action.id), score: state.score + target.points, sliced: state.sliced + 1 };
  }
  if (action.type === "miss") {
    return { ...state, score: Math.max(0, state.score - 2), misses: state.misses + 1 };
  }
  if (action.type === "spawn") {
    const rng = mulberry32(state.rngSeed);
    const pts = Math.random() < 0.2 ? 20 : 10;
    const newTarget: SliceTarget = {
      id: state.nextId,
      x: Math.floor(rng() * 80) + 10,
      y: Math.floor(rng() * 70) + 10,
      size: Math.floor(rng() * 30) + 30,
      points: pts,
      active: true,
    };
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, targets: [...state.targets.slice(-4), newTarget], nextId: state.nextId + 1, rngSeed: nextSeed };
  }
  if (action.type === "tick") {
    const newTime = state.timeLeft - 1;
    if (newTime <= 0) return { ...state, timeLeft: 0, phase: "gameover" };
    return { ...state, timeLeft: newTime };
  }
  return state;
}

export function isTerminal(state: SwordSliceState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
