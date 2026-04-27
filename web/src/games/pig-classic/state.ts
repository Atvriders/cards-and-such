import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Pig Classic: Roll a single die. Each roll adds to your turn total
// unless you roll a 1 — then your turn total is wiped and turn ends.
// Bank to add turn total to score. Race to TARGET (default 100).
// Score returned is total banked when the user reaches target, or banked at end.

export const TARGET = 100;
export const MAX_TURNS = 30;

export interface PigClassicSettings { dummy: boolean; }

export interface PigClassicState {
  rngSeed: number;
  turn: number;
  turnTotal: number;
  totalScore: number;
  lastRoll: number;
  phase: "playing" | "done";
  lastWasOne: boolean;
}

export type PigClassicAction = { type: "roll" } | { type: "bank" };

export function initialState(seed: number, _settings: PigClassicSettings): PigClassicState {
  return { rngSeed: seed, turn: 1, turnTotal: 0, totalScore: 0, lastRoll: 0, phase: "playing", lastWasOne: false };
}

export function reducer(state: PigClassicState, action: PigClassicAction): PigClassicState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    const rng = mulberry32(state.rngSeed);
    const r = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    if (r === 1) {
      const turn = state.turn + 1;
      const done = turn > MAX_TURNS;
      return { ...state, rngSeed: nextSeed, turnTotal: 0, lastRoll: r, lastWasOne: true, turn, phase: done ? "done" : "playing" };
    }
    return { ...state, rngSeed: nextSeed, turnTotal: state.turnTotal + r, lastRoll: r, lastWasOne: false };
  }
  if (action.type === "bank") {
    const newScore = state.totalScore + state.turnTotal;
    if (newScore >= TARGET) return { ...state, totalScore: newScore, turnTotal: 0, phase: "done" };
    const turn = state.turn + 1;
    const done = turn > MAX_TURNS;
    return { ...state, totalScore: newScore, turnTotal: 0, turn, phase: done ? "done" : "playing" };
  }
  return state;
}

export function isTerminal(state: PigClassicState): { score: number } | null {
  return state.phase === "done" ? { score: state.totalScore } : null;
}
