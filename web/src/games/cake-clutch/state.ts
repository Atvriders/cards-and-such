import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TIMER_TICKS = 30;
export const LANES = 6;
export const POINTS = 10;
export interface CakeClutchSettings { dummy: boolean; }
export interface CakeClutchItem {
  id: number;
  lane: number;
  ticksLeft: number;
}
export interface CakeClutchState {
  rngSeed: number;
  items: CakeClutchItem[];
  nextId: number;
  ticksRemaining: number;
  score: number;
  popped: number;
  missed: number;
  phase: "playing" | "done";
}
export type CakeClutchAction =
  | { type: "tick" }
  | { type: "pop"; id: number };
export function initialState(seed: number, _settings: CakeClutchSettings): CakeClutchState {
  return { rngSeed: seed, items: [], nextId: 1, ticksRemaining: TIMER_TICKS, score: 0, popped: 0, missed: 0, phase: "playing" };
}
export function reducer(state: CakeClutchState, action: CakeClutchAction): CakeClutchState {
  if (state.phase === "done") return state;
  if (action.type === "pop") {
    const target = state.items.find(p => p.id === action.id);
    if (!target) return state;
    return { ...state, items: state.items.filter(p => p.id !== action.id), score: state.score + POINTS, popped: state.popped + 1 };
  }
  if (action.type === "tick") {
    const rng = mulberry32(state.rngSeed);
    const seed2 = Math.floor(rng() * 2 ** 31);
    const aged = state.items.map(p => ({ ...p, ticksLeft: p.ticksLeft - 1 }));
    const surviving = aged.filter(p => p.ticksLeft > 0);
    const expired = aged.length - surviving.length;
    const spawnCount = 1 + Math.floor(rng() * 2);
    let nextId = state.nextId;
    const newItems: CakeClutchItem[] = [];
    for (let i = 0; i < spawnCount; i++) {
      newItems.push({ id: nextId++, lane: Math.floor(rng() * LANES), ticksLeft: 3 + Math.floor(rng() * 3) });
    }
    const ticksRemaining = state.ticksRemaining - 1;
    const phase = ticksRemaining <= 0 ? "done" : "playing";
    return {
      ...state,
      rngSeed: seed2,
      items: [...surviving, ...newItems],
      nextId,
      ticksRemaining,
      missed: state.missed + expired,
      phase,
    };
  }
  return state;
}
export function isTerminal(state: CakeClutchState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
