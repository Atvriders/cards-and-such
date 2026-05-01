import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TURNS = 10;

export interface DiceMuseumSettings { dummy: boolean; }

export interface DiceMuseumState {
  rngSeed: number;
  turn: number;
  collected: Record<number, number>; // face -> count
  rolls: number[] | null;
  score: number;
  phase: "roll" | "claim" | "done";
  log: string;
}

export type DiceMuseumAction = { type: "roll" } | { type: "keep"; face: number } | { type: "skip" };

export function setBonus(count: number): number {
  if (count >= 6) return 60;
  if (count >= 4) return 30;
  if (count >= 3) return 12;
  if (count >= 2) return 4;
  return 0;
}

export function initialState(seed: number, _settings: DiceMuseumSettings): DiceMuseumState {
  return { rngSeed: seed, turn: 1, collected: {1:0,2:0,3:0,4:0,5:0,6:0}, rolls: null, score: 0, phase: "roll", log: "" };
}

export function reducer(state: DiceMuseumState, action: DiceMuseumAction): DiceMuseumState {
  if (state.phase === "done") return state;
  if (action.type === "roll" && state.phase === "roll") {
    const rng = mulberry32(state.rngSeed);
    const r = [1+Math.floor(rng()*6), 1+Math.floor(rng()*6), 1+Math.floor(rng()*6)];
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: nextSeed, rolls: r, phase: "claim", log: `Rolled ${r.join(", ")} — pick a face to add to a display.` };
  }
  if (action.type === "keep" && state.phase === "claim" && state.rolls) {
    if (!state.rolls.includes(action.face)) return state;
    const count = (state.collected[action.face] ?? 0) + state.rolls.filter(r => r === action.face).length;
    const collected = { ...state.collected, [action.face]: count };
    const before = setBonus(state.collected[action.face] ?? 0);
    const after = setBonus(count);
    const pts = after - before;
    const turn = state.turn + 1;
    const phase: DiceMuseumState["phase"] = turn > TURNS ? "done" : "roll";
    return { ...state, collected, rolls: null, score: state.score + pts, turn, phase, log: `Display ${action.face} now has ${count}. +${pts}.` };
  }
  if (action.type === "skip" && state.phase === "claim") {
    const turn = state.turn + 1;
    const phase: DiceMuseumState["phase"] = turn > TURNS ? "done" : "roll";
    return { ...state, rolls: null, turn, phase, log: `Skipped.` };
  }
  return state;
}

export function isTerminal(state: DiceMuseumState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
