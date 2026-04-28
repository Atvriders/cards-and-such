import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 6;
export const DICE_COUNT = 3;

export interface BuncoDiceSettings { dummy: boolean; }

export interface BuncoDiceState {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  lastPts: number;
  phase: "roll" | "result" | "done";
  message: string;
}

export type BuncoDiceAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: BuncoDiceSettings): BuncoDiceState {
  return { rngSeed: seed, round: 1, dice: [], score: 0, lastPts: 0, phase: "roll", message: "" };
}

export function reducer(state: BuncoDiceState, action: BuncoDiceAction): BuncoDiceState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "roll") return state;
    const rng = mulberry32(state.rngSeed);
    const d: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) d.push(1 + Math.floor(rng() * 6));
    const seed2 = Math.floor(rng() * 2 ** 31);
    const target = state.round;
    const matches = d.filter(x => x === target).length;
    const allSame = d[0] === d[1] && d[1] === d[2];
    let pts = 0; let msg = "";
    if (allSame && d[0] === target) { pts = 21; msg = "BUNCO! +21"; }
    else if (allSame) { pts = 5; msg = "Mini Bunco +5"; }
    else { pts = matches * 5; msg = matches + " match(es) +" + pts; }
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: seed2, dice: d, score: state.score + pts, lastPts: pts, phase: isLast ? "done" : "result", message: msg };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, dice: [], lastPts: 0, phase: "roll", message: "" };
  }
  return state;
}

export function isTerminal(state: BuncoDiceState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
