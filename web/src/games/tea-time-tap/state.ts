import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Tea Time Tap: tea cups appear on a board for 30 seconds. Tap to score.
export const TIMER_TICKS = 30;
export const LANES = 6;
export interface TeaTimeTapSettings { dummy: boolean; }
export interface TeaCup { id: number; lane: number; ticksLeft: number; }
export interface TeaTimeTapState {
  rngSeed: number;
  cups: TeaCup[];
  nextId: number;
  ticksRemaining: number;
  score: number;
  popped: number;
  missed: number;
  phase: "playing" | "done";
}
export type TeaTimeTapAction = { type: "tick" } | { type: "pop"; id: number };
export function initialState(seed: number, _settings: TeaTimeTapSettings): TeaTimeTapState {
  return { rngSeed: seed, cups: [], nextId: 1, ticksRemaining: TIMER_TICKS, score: 0, popped: 0, missed: 0, phase: "playing" };
}
export function reducer(state: TeaTimeTapState, action: TeaTimeTapAction): TeaTimeTapState {
  if (state.phase === "done") return state;
  if (action.type === "pop") {
    const target = state.cups.find(c => c.id === action.id);
    if (!target) return state;
    return { ...state, cups: state.cups.filter(c => c.id !== action.id), score: state.score + 10, popped: state.popped + 1 };
  }
  if (action.type === "tick") {
    const rng = mulberry32(state.rngSeed);
    const seed2 = Math.floor(rng() * 2 ** 31);
    const aged = state.cups.map(c => ({ ...c, ticksLeft: c.ticksLeft - 1 }));
    const surviving = aged.filter(c => c.ticksLeft > 0);
    const expired = aged.length - surviving.length;
    const spawnCount = 1 + Math.floor(rng() * 2);
    let nextId = state.nextId;
    const newCups: TeaCup[] = [];
    for (let i = 0; i < spawnCount; i++) {
      newCups.push({ id: nextId++, lane: Math.floor(rng() * LANES), ticksLeft: 3 + Math.floor(rng() * 3) });
    }
    const ticksRemaining = state.ticksRemaining - 1;
    const phase = ticksRemaining <= 0 ? "done" : "playing";
    return { ...state, rngSeed: seed2, cups: [...surviving, ...newCups], nextId, ticksRemaining, missed: state.missed + expired, phase };
  }
  return state;
}
export function isTerminal(state: TeaTimeTapState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
