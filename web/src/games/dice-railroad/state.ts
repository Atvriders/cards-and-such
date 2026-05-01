import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TARGET = 30;
export const MAX_TURNS = 14;

export interface DiceRailroadSettings { dummy: boolean; }

export interface DiceRailroadState {
  rngSeed: number;
  turn: number;
  track: number;
  rolls: [number, number] | null;
  score: number;
  phase: "lay" | "result" | "done";
  log: string;
  lastDouble: boolean;
}

export type DiceRailroadAction = { type: "lay" } | { type: "next" };

export function isWin(a: number, b: number): boolean { return a === b; }

export function initialState(seed: number, _settings: DiceRailroadSettings): DiceRailroadState {
  return { rngSeed: seed, turn: 1, track: 0, rolls: null, score: 0, phase: "lay", log: "", lastDouble: false };
}

export function reducer(state: DiceRailroadState, action: DiceRailroadAction): DiceRailroadState {
  if (state.phase === "done") return state;
  if (action.type === "lay" && state.phase === "lay") {
    const rng = mulberry32(state.rngSeed);
    const r1 = 1 + Math.floor(rng()*6);
    const r2 = 1 + Math.floor(rng()*6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const dbl = r1 === r2;
    const laid = dbl ? (r1 + r2) * 2 : Math.max(r1, r2);
    const track = Math.min(TARGET, state.track + laid);
    let log = dbl ? `DOUBLES! +${laid} track.` : `Laid ${laid} track.`;
    let pts = laid + (dbl ? 8 : 0);
    let phase: DiceRailroadState["phase"] = "result";
    if (track >= TARGET) {
      phase = "done";
      pts += 50 + (MAX_TURNS - state.turn) * 4;
      log += ` LINE COMPLETE! +${50 + (MAX_TURNS - state.turn) * 4}.`;
    } else if (state.turn >= MAX_TURNS) {
      phase = "done";
      log += ` Out of time at ${track} ties.`;
    }
    return { ...state, rngSeed: nextSeed, rolls: [r1, r2], track, score: state.score + pts, phase, log, lastDouble: dbl };
  }
  if (action.type === "next" && state.phase === "result") {
    return { ...state, turn: state.turn + 1, rolls: null, phase: "lay", log: "", lastDouble: false };
  }
  return state;
}

export function isTerminal(state: DiceRailroadState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
