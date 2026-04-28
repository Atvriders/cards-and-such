import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TIMER_TICKS = 25;
export const LANES = 6;
export interface TrainTapSettings { dummy: boolean; }
export interface Target { id: number; lane: number; ticksLeft: number; }
export interface TrainTapState { rngSeed: number; targets: Target[]; nextId: number; ticksRemaining: number; score: number; popped: number; missed: number; phase: "playing" | "done"; }
export type TrainTapAction = { type: "tick" } | { type: "pop"; id: number };
export function initialState(seed: number, _settings: TrainTapSettings): TrainTapState {
  return { rngSeed: seed, targets: [], nextId: 1, ticksRemaining: TIMER_TICKS, score: 0, popped: 0, missed: 0, phase: "playing" };
}
export function reducer(state: TrainTapState, action: TrainTapAction): TrainTapState {
  if (state.phase === "done") return state;
  if (action.type === "pop") {
    const target = state.targets.find(p => p.id === action.id);
    if (!target) return state;
    return { ...state, targets: state.targets.filter(p => p.id !== action.id), score: state.score + 10, popped: state.popped + 1 };
  }
  if (action.type === "tick") {
    const rng = mulberry32(state.rngSeed);
    const seed2 = Math.floor(rng() * 2 ** 31);
    const aged = state.targets.map(p => ({ ...p, ticksLeft: p.ticksLeft - 1 }));
    const surviving = aged.filter(p => p.ticksLeft > 0);
    const expired = aged.length - surviving.length;
    const spawnCount = 1 + Math.floor(rng() * 2);
    let nextId = state.nextId;
    const newTargets: Target[] = [];
    for (let i = 0; i < spawnCount; i++) {
      newTargets.push({ id: nextId++, lane: Math.floor(rng() * LANES), ticksLeft: 3 + Math.floor(rng() * 3) });
    }
    const ticksRemaining = state.ticksRemaining - 1;
    const phase: "playing"|"done" = ticksRemaining <= 0 ? "done" : "playing";
    return { ...state, rngSeed: seed2, targets: [...surviving, ...newTargets], nextId, ticksRemaining, missed: state.missed + expired, phase };
  }
  return state;
}
export function isTerminal(state: TrainTapState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
