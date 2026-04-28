import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 12;
export const DICE_COUNT = 2;

export interface BarboothSettings { dummy: boolean; }

export interface BarboothState {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  lastPts: number;
  phase: "roll" | "result" | "done";
  message: string;
}

export type BarboothAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: BarboothSettings): BarboothState {
  return { rngSeed: seed, round: 1, dice: [], score: 0, lastPts: 0, phase: "roll", message: "" };
}

export function reducer(state: BarboothState, action: BarboothAction): BarboothState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "roll") return state;
    const rng = mulberry32(state.rngSeed);
    const d: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) d.push(1 + Math.floor(rng() * 6));
    const seed2 = Math.floor(rng() * 2 ** 31);
    const sortedD = [...d].sort((a,b)=>a-b).join(",");
    let pts = 0; let msg = "";
    const map: Record<string, number> = {"1,2":30,"3,5":25,"4,6":25,"6,6":50,"5,5":40,"4,4":30,"3,3":25,"2,2":20,"1,1":15};
    if (map[sortedD] !== undefined) { pts = map[sortedD]!; msg = sortedD + " +" + pts; }
    else { pts = 0; msg = sortedD + " — no score"; }
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: seed2, dice: d, score: state.score + pts, lastPts: pts, phase: isLast ? "done" : "result", message: msg };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, dice: [], lastPts: 0, phase: "roll", message: "" };
  }
  return state;
}

export function isTerminal(state: BarboothState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
