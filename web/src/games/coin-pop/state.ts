import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CoinPopSettings { duration: "20" | "30" | "45"; }
export interface FallingItem { id: number; x: number; y: number; speed: number; points: number; }
export interface CoinPopState {
  items: FallingItem[]; score: number; caught: number; missed: number;
  lives: number; timeLeft: number; nextId: number; phase: "playing" | "gameover"; rngSeed: number;
}
export type CoinPopAction = { type: "catch"; id: number } | { type: "tick" } | { type: "spawn" };

export function initialState(seed: number, settings: CoinPopSettings): CoinPopState {
  const rng = mulberry32(seed);
  const first: FallingItem = { id: 0, x: Math.floor(rng() * 85) + 5, y: 5, speed: 7, points: 10 };
  return { items: [first], score: 0, caught: 0, missed: 0, lives: 3, timeLeft: parseInt(settings.duration, 10), nextId: 1, phase: "playing", rngSeed: Math.floor(rng() * 2 ** 31) };
}

export function reducer(state: CoinPopState, action: CoinPopAction): CoinPopState {
  if (state.phase === "gameover") return state;
  if (action.type === "catch") {
    const item = state.items.find(i => i.id === action.id);
    if (!item) return state;
    return { ...state, items: state.items.filter(i => i.id !== action.id), score: state.score + item.points, caught: state.caught + 1 };
  }
  if (action.type === "spawn") {
    const rng = mulberry32(state.rngSeed);
    const speed = Math.floor(rng() * 7) + 5;
    const newItem: FallingItem = { id: state.nextId, x: Math.floor(rng() * 85) + 5, y: 5, speed, points: speed >= 9 ? 20 : 10 };
    return { ...state, items: [...state.items.slice(-5), newItem], nextId: state.nextId + 1, rngSeed: Math.floor(rng() * 2 ** 31) };
  }
  if (action.type === "tick") {
    const moved = state.items.map(i => ({ ...i, y: i.y + i.speed }));
    const fallen = moved.filter(i => i.y >= 100);
    const remaining = moved.filter(i => i.y < 100);
    const newLives = state.lives - fallen.length;
    const newTime = state.timeLeft - 1;
    if (newLives <= 0 || newTime <= 0) return { ...state, items: remaining, missed: state.missed + fallen.length, lives: Math.max(0, newLives), timeLeft: Math.max(0, newTime), phase: "gameover" };
    return { ...state, items: remaining, missed: state.missed + fallen.length, lives: newLives, timeLeft: newTime };
  }
  return state;
}

export function isTerminal(state: CoinPopState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
