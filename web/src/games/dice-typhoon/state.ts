import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const ROUNDS = 5;

export interface DiceTyphoonSettings { dummy: boolean; }

export interface DiceTyphoonState {
  rngSeed: number;
  round: number;
  pool: number; // points banked this round
  rolls: number[];
  score: number;
  phase: "roll" | "decide" | "done";
  log: string;
  busted: boolean;
}

export type DiceTyphoonAction = { type: "roll" } | { type: "bank" };

export function initialState(seed: number, _settings: DiceTyphoonSettings): DiceTyphoonState {
  return { rngSeed: seed, round: 1, pool: 0, rolls: [], score: 0, phase: "roll", log: "", busted: false };
}

export function reducer(state: DiceTyphoonState, action: DiceTyphoonAction): DiceTyphoonState {
  if (state.phase === "done") return state;
  if (action.type === "roll" && (state.phase === "roll" || state.phase === "decide")) {
    const rng = mulberry32(state.rngSeed);
    const r = [1+Math.floor(rng()*6), 1+Math.floor(rng()*6)];
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sum = r[0]! + r[1]!;
    if (r[0] === 1 && r[1] === 1) {
      // double 1s = wave wipes pool
      return { ...state, rngSeed: nextSeed, rolls: r, pool: 0, phase: "decide", busted: true, log: "DOUBLE 1s — wave wipes the pool!" };
    }
    return { ...state, rngSeed: nextSeed, rolls: r, pool: state.pool + sum, phase: "decide", log: `+${sum} (pool ${state.pool + sum})` };
  }
  if (action.type === "bank") {
    if (state.phase !== "decide" && state.phase !== "roll") return state;
    const score = state.score + state.pool;
    const nextRound = state.round + 1;
    const phase: DiceTyphoonState["phase"] = nextRound > ROUNDS ? "done" : "roll";
    return { ...state, score, pool: 0, round: nextRound, phase, rolls: [], log: `Banked +${state.pool}.`, busted: false };
  }
  return state;
}

export function isTerminal(state: DiceTyphoonState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
