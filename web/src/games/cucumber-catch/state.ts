import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Cucumber Catch: cucumbers fall in 5 lanes. Click each cucumber before it ages out.
// 30 second timer.
export const TIMER_TICKS = 30;
export const LANES = 5;

export interface CucumberCatchSettings { dummy: boolean; }
export interface Cucumber { id: number; lane: number; ticksLeft: number; }
export interface CucumberCatchState {
  rngSeed: number;
  cucumbers: Cucumber[];
  nextId: number;
  ticksRemaining: number;
  score: number;
  caught: number;
  missed: number;
  phase: "playing" | "done";
}
export type CucumberCatchAction = { type: "tick" } | { type: "catch"; id: number };

export function initialState(seed: number, _settings: CucumberCatchSettings): CucumberCatchState {
  return { rngSeed: seed, cucumbers: [], nextId: 1, ticksRemaining: TIMER_TICKS, score: 0, caught: 0, missed: 0, phase: "playing" };
}

export function reducer(state: CucumberCatchState, action: CucumberCatchAction): CucumberCatchState {
  if (state.phase === "done") return state;
  if (action.type === "catch") {
    const target = state.cucumbers.find(c => c.id === action.id);
    if (!target) return state;
    return { ...state, cucumbers: state.cucumbers.filter(c => c.id !== action.id), score: state.score + 10, caught: state.caught + 1 };
  }
  if (action.type === "tick") {
    const rng = mulberry32(state.rngSeed);
    const seed2 = Math.floor(rng() * 2 ** 31);
    const aged = state.cucumbers.map(c => ({ ...c, ticksLeft: c.ticksLeft - 1 }));
    const surviving = aged.filter(c => c.ticksLeft > 0);
    const expired = aged.length - surviving.length;
    const spawnCount = 1 + Math.floor(rng() * 2);
    let nextId = state.nextId;
    const newOnes: Cucumber[] = [];
    for (let i = 0; i < spawnCount; i++) {
      newOnes.push({ id: nextId++, lane: Math.floor(rng() * LANES), ticksLeft: 3 + Math.floor(rng() * 3) });
    }
    const ticksRemaining = state.ticksRemaining - 1;
    const phase = ticksRemaining <= 0 ? "done" : "playing";
    return { ...state, rngSeed: seed2, cucumbers: [...surviving, ...newOnes], nextId, ticksRemaining, missed: state.missed + expired, phase };
  }
  return state;
}

export function isTerminal(state: CucumberCatchState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
