import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TARGET = 50;
export const MAX_ROLLS = 30;

export interface DiceStormSettings { dummy: boolean; }

export interface DiceStormState {
  rngSeed: number;
  rollsTaken: number;
  pool: number;
  rolls: number[];
  score: number;
  phase: "roll" | "decide" | "done";
  log: string;
}

export type DiceStormAction = { type: "roll" } | { type: "bank" };

export function initialState(seed: number, _settings: DiceStormSettings): DiceStormState {
  return { rngSeed: seed, rollsTaken: 0, pool: 0, rolls: [], score: 0, phase: "roll", log: "" };
}

export function reducer(state: DiceStormState, action: DiceStormAction): DiceStormState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    const rng = mulberry32(state.rngSeed);
    const r = [1+Math.floor(rng()*6), 1+Math.floor(rng()*6)];
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const rollsTaken = state.rollsTaken + 1;
    if (r[0] === r[1] && r[0] === 1) {
      // thunderstrike: lose pool
      return { ...state, rngSeed: nextSeed, rolls: r, pool: 0, rollsTaken, phase: "decide", log: "THUNDER! Pool wiped." };
    }
    const sum = r[0]! + r[1]!;
    const phase: DiceStormState["phase"] = rollsTaken >= MAX_ROLLS ? "done" : "decide";
    let log = `+${sum} (pool ${state.pool + sum})`;
    let pool = state.pool + sum;
    let score = state.score;
    if (phase === "done") {
      score += pool;
      log += " — final pool added.";
    }
    return { ...state, rngSeed: nextSeed, rolls: r, pool, rollsTaken, phase, score, log };
  }
  if (action.type === "bank") {
    if (state.phase !== "decide") return state;
    let bonus = 0;
    if (state.pool >= TARGET) bonus = 30;
    const score = state.score + state.pool + bonus;
    return { ...state, score, pool: 0, phase: "done", log: bonus > 0 ? `Banked ${state.pool} (+${bonus} target bonus).` : `Banked ${state.pool}.` };
  }
  return state;
}

export function isTerminal(state: DiceStormState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
