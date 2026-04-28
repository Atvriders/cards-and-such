import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TIMER_TICKS = 30;
export const LANES = 6;
export const POINTS = 10;
export interface GiftGrabSettings { dummy: boolean; }
export interface GiftGrabItem {
  id: number;
  lane: number;
  ticksLeft: number;
}
export interface GiftGrabState {
  rngSeed: number;
  items: GiftGrabItem[];
  nextId: number;
  ticksRemaining: number;
  score: number;
  popped: number;
  missed: number;
  phase: "playing" | "done";
}
export type GiftGrabAction =
  | { type: "tick" }
  | { type: "pop"; id: number };
export function initialState(seed: number, _settings: GiftGrabSettings): GiftGrabState {
  return { rngSeed: seed, items: [], nextId: 1, ticksRemaining: TIMER_TICKS, score: 0, popped: 0, missed: 0, phase: "playing" };
}
export function reducer(state: GiftGrabState, action: GiftGrabAction): GiftGrabState {
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
    const newItems: GiftGrabItem[] = [];
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
export function isTerminal(state: GiftGrabState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
