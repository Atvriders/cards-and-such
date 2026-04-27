import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Cocoa Cascade: targets drift across the screen in 6 lanes. Click each before it disappears for 10 points. 30-tick timer.
export const TIMER_TICKS = 30;
export const LANES = 6;
export const POINTS = 10;
export interface CocoaCascadeSettings { dummy: boolean; }
export interface Target { id: number; lane: number; ticksLeft: number; }
export interface CocoaCascadeState { rngSeed: number; targets: Target[]; nextId: number; ticksRemaining: number; score: number; clicked: number; missed: number; phase: "playing" | "done"; }
export type CocoaCascadeAction = { type: "tick" } | { type: "click"; id: number };
export function initialState(seed: number, _s: CocoaCascadeSettings): CocoaCascadeState {
  return { rngSeed: seed, targets: [], nextId: 1, ticksRemaining: TIMER_TICKS, score: 0, clicked: 0, missed: 0, phase: "playing" };
}
export function reducer(state: CocoaCascadeState, action: CocoaCascadeAction): CocoaCascadeState {
  if (state.phase === "done") return state;
  if (action.type === "click") {
    const target = state.targets.find(t => t.id === action.id);
    if (!target) return state;
    return { ...state, targets: state.targets.filter(t => t.id !== action.id), score: state.score + POINTS, clicked: state.clicked + 1 };
  }
  if (action.type === "tick") {
    const rng = mulberry32(state.rngSeed);
    const seed2 = Math.floor(rng() * 2 ** 31);
    const aged = state.targets.map(t => ({ ...t, ticksLeft: t.ticksLeft - 1 }));
    const surviving = aged.filter(t => t.ticksLeft > 0);
    const expired = aged.length - surviving.length;
    const spawnCount = 1 + Math.floor(rng() * 2);
    let nextId = state.nextId;
    const fresh: Target[] = [];
    for (let i = 0; i < spawnCount; i++) {
      fresh.push({ id: nextId++, lane: Math.floor(rng() * LANES), ticksLeft: 3 + Math.floor(rng() * 3) });
    }
    const ticksRemaining = state.ticksRemaining - 1;
    const phase = ticksRemaining <= 0 ? "done" : "playing";
    return { ...state, rngSeed: seed2, targets: [...surviving, ...fresh], nextId, ticksRemaining, missed: state.missed + expired, phase };
  }
  return state;
}
export function isTerminal(state: CocoaCascadeState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
