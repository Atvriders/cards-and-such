import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TIMER_TICKS = 25;
export const LANES = 6;
export interface OwlHootSettings { dummy: boolean; }
export interface OwlHootTarget { id: number; lane: number; ticksLeft: number; }
export interface OwlHootState { rngSeed: number; targets: OwlHootTarget[]; nextId: number; ticksRemaining: number; score: number; clicked: number; missed: number; phase: "playing" | "done"; }
export type OwlHootAction = { type: "tick" } | { type: "click"; id: number };
export function initialState(seed: number, _s: OwlHootSettings): OwlHootState {
  return { rngSeed: seed, targets: [], nextId: 1, ticksRemaining: TIMER_TICKS, score: 0, clicked: 0, missed: 0, phase: "playing" };
}
export function reducer(state: OwlHootState, action: OwlHootAction): OwlHootState {
  if (state.phase === "done") return state;
  if (action.type === "click") {
    const t = state.targets.find(x => x.id === action.id);
    if (!t) return state;
    return { ...state, targets: state.targets.filter(x => x.id !== action.id), score: state.score + 10, clicked: state.clicked + 1 };
  }
  if (action.type === "tick") {
    const rng = mulberry32(state.rngSeed); const seed2 = Math.floor(rng()*2**31);
    const aged = state.targets.map(t => ({ ...t, ticksLeft: t.ticksLeft - 1 }));
    const surviving = aged.filter(t => t.ticksLeft > 0);
    const expired = aged.length - surviving.length;
    const spawnCount = 1 + Math.floor(rng()*2);
    let nextId = state.nextId; const newT: OwlHootTarget[] = [];
    for (let i = 0; i < spawnCount; i++) newT.push({ id: nextId++, lane: Math.floor(rng()*LANES), ticksLeft: 3 + Math.floor(rng()*3) });
    const ticksRemaining = state.ticksRemaining - 1;
    const phase = ticksRemaining <= 0 ? "done" : "playing";
    return { ...state, rngSeed: seed2, targets: [...surviving, ...newT], nextId, ticksRemaining, missed: state.missed + expired, phase };
  }
  return state;
}
export function isTerminal(state: OwlHootState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
