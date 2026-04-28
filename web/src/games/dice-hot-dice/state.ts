import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 8;
export interface DiceHotDiceSettings { dummy: boolean; }
export interface DiceHotDiceState {
  rngSeed: number;
  round: number;
  banked: number; // total banked
  current: number; // current round's tally; lost if you bust
  streak: number;
  lastDie: number | null;
  phase: "rolling" | "done";
}
export type DiceHotDiceAction = { type: "roll" } | { type: "bank" };
export function initialState(seed: number, _s: DiceHotDiceSettings): DiceHotDiceState {
  return { rngSeed: seed, round: 1, banked: 0, current: 0, streak: 0, lastDie: null, phase: "rolling" };
}
export function reducer(state: DiceHotDiceState, action: DiceHotDiceAction): DiceHotDiceState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    const rng = mulberry32(state.rngSeed);
    const die = 1 + Math.floor(rng() * 6);
    const next = Math.floor(rng() * 2 ** 31);
    if (die === 1) {
      // BUST — lose current
      const round = state.round + 1;
      const phase = round > TOTAL_ROUNDS ? "done" : "rolling";
      return { ...state, rngSeed: next, lastDie: die, current: 0, streak: 0, round, phase };
    }
    const newStreak = state.streak + 1;
    const bonus = newStreak >= 4 ? 8 : newStreak >= 3 ? 4 : 0;
    return { ...state, rngSeed: next, lastDie: die, current: state.current + die + bonus, streak: newStreak };
  }
  if (action.type === "bank") {
    const round = state.round + 1;
    const phase = round > TOTAL_ROUNDS ? "done" : "rolling";
    return { ...state, banked: state.banked + state.current, current: 0, streak: 0, lastDie: null, round, phase };
  }
  return state;
}
export function isTerminal(state: DiceHotDiceState): { score: number } | null {
  return state.phase === "done" ? { score: state.banked } : null;
}
